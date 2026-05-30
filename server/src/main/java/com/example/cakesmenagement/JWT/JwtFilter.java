package com.example.cakesmenagement.JWT;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil; // משתמשים במחלקת JwtUtil שלנו

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 🔹 1. שולפים את הכתובת של הבקשה
        String path = request.getRequestURI();

        // 🔹 2. אם זו בקשה ל-login או register (auth) – לא צריך לבדוק טוקן
        if (path.startsWith("/auth")) {
            filterChain.doFilter(request, response); // ממשיכים לבקשה הבאה
            return;
        }

        // 🔹 3. שולפים את ה-Header Authorization
        final String authHeader = request.getHeader("Authorization");

        // 🔹 4. בודקים אם יש טוקן ומתחיל ב-"Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // חותכים את "Bearer "

            try {
                // 🔹 5. מפענחים את הטוקן כדי לקבל Claims (מייל ותפקיד)
                Claims claims = jwtUtil.extractClaims(token);

                String email = claims.getSubject(); // המייל של המשתמש
                String role = claims.get("role", String.class); // תפקיד המשתמש
                if (role != null && !role.startsWith("ROLE_")) {
                    role = "ROLE_" + role;
                }
                
                // 🔹 6. יוצרים הרשאות עבור Spring Security
                List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

                // 🔹 7. יוצרים אובייקט Authentication שמכיל את המייל והרשאות
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);

                // 🔹 8. מכניסים את המשתמש ל-SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);

            } catch (JwtException e) {
                // 🔹 9. אם הטוקן לא חוקי – מחזירים 401 Unauthorized
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        // 🔹 10. אם הכל בסדר – ממשיכים בבקשה הרגילה ל-Controller
        filterChain.doFilter(request, response);
    }
}