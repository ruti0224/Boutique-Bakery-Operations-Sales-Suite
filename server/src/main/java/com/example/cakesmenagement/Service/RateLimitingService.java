package com.example.cakesmenagement.Service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    @Autowired
    private HttpServletRequest request;

    // רשימת ה-IP-ים של הפרוקסי/LB שלכם שמותר לסמוך על ה-header שלהם.
    // ריק (ברירת מחדל) = לא סומכים על שום דבר, תמיד משתמשים ב-getRemoteAddr הישיר.
    @Value("${app.trusted-proxy-ips:}")
    private String trustedProxyIps;

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    public void checkRateLimit() {
        String ip = resolveClientIp();
        Bucket bucket = cache.computeIfAbsent(ip, this::createNewBucket);

        if (!bucket.tryConsume(1)) {
            throw new RuntimeException("מטעמי אבטחה: זיהינו כמות חריגה של פעולות. אנא המתן כחצי שעה ונסה שוב.");
        }
    }

    private String resolveClientIp() {
        String directIp = request.getRemoteAddr();

        // אם הבקשה לא מגיעה מהפרוקסי המהימן שלנו - מתעלמים לגמרי מה-header
        // ומשתמשים ב-IP הישיר, גם אם ה-header קיים (מונע זיוף).
        if (!isTrustedProxy(directIp)) {
            return directIp;
        }

        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            // ה-header יכול להכיל שרשרת: "client, proxy1, proxy2" - הראשון הוא הלקוח האמיתי
            return forwardedFor.split(",")[0].trim();
        }
        return directIp;
    }

    private boolean isTrustedProxy(String ip) {
        if (trustedProxyIps == null || trustedProxyIps.isBlank()) {
            return false; // אין רשימה מוגדרת = אף אחד לא מהימן
        }
        for (String trusted : trustedProxyIps.split(",")) {
            if (trusted.trim().equals(ip)) return true;
        }
        return false;
    }

    private Bucket createNewBucket(String key) {
        Refill refill = Refill.intervally(5, Duration.ofMinutes(30));
        Bandwidth limit = Bandwidth.classic(5, refill);
        return Bucket.builder().addLimit(limit).build();
    }
}