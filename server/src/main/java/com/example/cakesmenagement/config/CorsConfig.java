package com.example.cakesmenagement.config; // תוודאי שה-package תואם לשלך

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // מאשר את כל הנתיבים בשרת (API)
                        .allowedOrigins("http://localhost:8081", "http://localhost:5173") // מאשר את הכתובות של הריאקט
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // מאשר את כל סוגי הפעולות
                        .allowedHeaders("*") // מאשר לשלוח כל מידע (כמו למשל את טוקן ה-JWT)
                        .allowCredentials(true);
            }
        };
    }
}