package com.example.cakesmenagement.security;

import com.example.cakesmenagement.JWT.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // <--- ייבוא חשוב שהוספנו
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        RoleHierarchyImpl roleHierarchy = new RoleHierarchyImpl();
        roleHierarchy.setHierarchy("ROLE_ADMIN > ROLE_USER");
        return roleHierarchy;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ✅ מאפשר ל-Security להשתמש בהגדרות ה-CORS מ-CorsConfig
                .cors(Customizer.withDefaults())

                .csrf(csrf -> csrf.disable()) // ביטול CSRF
                .authorizeHttpRequests(auth -> auth

                        // 1. קריאת נתונים (GET) - פתוח לכולם (גם אורחים)
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cakes/**").permitAll()

                        // 2. התחברות והרשמה - פתוח לכולם
                        .requestMatchers("/api/users/register", "/auth/**").permitAll()

                        // 3. הוספה/עריכה/מחיקה וגישת ניהול - רק למנהל (ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/cakes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/cakes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/cakes/**").hasRole("ADMIN")
                        .requestMatchers("/api/*/admin/**").hasRole("ADMIN")

                        // 4. פעולות של לקוח מחובר (USER)
                        .requestMatchers(
                                "/api/users/**",
                                "/api/orders/add",
                                "/api/cakes/recommend"
                        ).hasRole("USER")

                        // 5. כל נתיב אחר דורש התחברות בסיסית
                        .anyRequest().authenticated()
                )
                // הוספת מסנן ה-JWT לפני מסנן ההתחברות הרגיל
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}