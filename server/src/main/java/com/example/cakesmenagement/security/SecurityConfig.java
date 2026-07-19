package com.example.cakesmenagement.security;

import com.example.cakesmenagement.JWT.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable()) // ביטול CSRF (מכיוון שאנו משתמשים ב-JWT)
                .authorizeHttpRequests(auth -> auth

                        // 1. בקשות OPTIONS פתוחות לכולם לצורך תקינות CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/", "/error", "/index.html").permitAll()

                        // 2. נתיבים ציבוריים - קריאה בלבד (GET) של עוגות וקטגוריות
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cakes/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
                        // 3. נתיבי רישום והתחברות פתוחים לכל
                        .requestMatchers("/api/users/register", "/auth/**").permitAll()

                        .requestMatchers(
                                "/api/cakes/admin/**",
                                "/api/categories/admin/**",
                                "/api/orders/admin/**",
                                "/api/users/admin/**",
                                "/api/payments/admin/**"
                        ).hasRole("ADMIN")
                        // 5. פעולות המיועדות למשתמשים רשומים בלבד (USER / ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/cakes/recommend").hasRole("USER")
                        .requestMatchers("/api/users/**", "/api/orders/add").hasRole("USER")
                        .anyRequest().authenticated()
                )
                // הוספת פילטר ה-JWT לפני מנגנון האימות הסטנדרטי של Spring
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}