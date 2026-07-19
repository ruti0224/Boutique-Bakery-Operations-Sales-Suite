package com.example.cakesmenagement.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.cloudinary.Transformation;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB - סביר לתמונת פלאפון

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        config.put("secure", "true");
        this.cloudinary = new Cloudinary(config);
    }

    public String uploadCakeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("לא נבחר קובץ להעלאה");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new RuntimeException("סוג קובץ לא נתמך - יש להעלות תמונה בפורמט JPG, PNG או WEBP בלבד");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new RuntimeException("הקובץ גדול מדי - הגודל המקסימלי הוא 8MB");
        }

        try {
            Transformation transformation = new Transformation()
                    .width(800)
                    .height(600)
                    .crop("limit")
                    .quality("auto");

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "sweets-cakes",
                    "transformation", transformation
            ));
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("שגיאה בהעלאת התמונה, נסי שנית");
        }
    }
}