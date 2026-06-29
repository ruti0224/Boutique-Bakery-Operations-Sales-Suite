package com.example.cakesmenagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    // האנוטציה הזו מושכת את הערך שהגדרנו ב-application.properties
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // תקף לכל ה-Endpoints של השרת
                        .allowedOrigins(allowedOrigins.split(",")) // תומך גם בפסיקים אם תרצי להגדיר כמה כתובות מורשות
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // מתודות מותרות
                        .allowedHeaders("*") // מאפשר את כל ה-Headers (כולל Authorization לטוקנים)
                        .allowCredentials(true); // מאפשר העברת קוקיז או פרטי זיהוי אם נצטרך בעתיד
            }
        };
    }
}