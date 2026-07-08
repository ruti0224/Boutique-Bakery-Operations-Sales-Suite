package com.example.cakesmenagement.Service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    @Autowired
    private HttpServletRequest request;

    // מפה מאובטחת לניהול ריבוי תהליכים (Thread-Safe) השומרת "דלי" לכל IP
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    public void checkRateLimit() {
        String ip = request.getRemoteAddr();

        Bucket bucket = cache.computeIfAbsent(ip, this::createNewBucket);

        if (!bucket.tryConsume(1)) {
            throw new RuntimeException("מטעמי אבטחה: זיהינו כמות חריגה של פעולות. אנא המתן כחצי שעה ונסה שוב.");
        }
    }

    // יצירת חוקי ההגבלה בתחביר הרשמי והיציב (Classic API)
    private Bucket createNewBucket(String key) {
        // הגדרת המילוי מחדש - 5 פעולות כל חצי שעה
        Refill refill = Refill.intervally(5, Duration.ofMinutes(30));

        // צירוף המילוי לרוחב הפס (Bandwidth)
        Bandwidth limit = Bandwidth.classic(5, refill);

        // יצירת הדלי והחזרתו למשתמש
        return Bucket.builder().addLimit(limit).build();
    }
}