package com.apartmanimcepte.backend.identity.filter;

import com.apartmanimcepte.backend.identity.bus.jwt.JwtService;
import com.apartmanimcepte.backend.identity.bus.kullaniciBul.userDetailsService;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class MyFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final userDetailsService userService;
    private final RequestMatcher permitAllUrls; // Değişkeni burada tanımla

    // Constructor içinde listeyi oluşturarak daha güvenli hale getiriyoruz
    public MyFilter(JwtService jwtService, userDetailsService userService) {
        this.jwtService = jwtService;
        this.userService = userService;

        // Herkesin token olmadan erişebileceği yolların tam ve doğru listesi
        this.permitAllUrls = new OrRequestMatcher(
        );
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Gelen isteğin, yukarıda tanımladığımız herkese açık URL listesiyle eşleşip eşleşmediğini kontrol et.
        if (permitAllUrls.matches(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        // --- Buradan sonrası korumalı yollar için ---
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, "Token eksik veya geçersiz formatta.");
            return;
        }

        String token = authHeader.substring(7);
        String telefonNo;

        try {
            telefonNo = jwtService.extractUsername(token);
        } catch (Exception e) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Oturum geçersiz veya süresi dolmuş.");
            return;
        }

        if (telefonNo != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Kullanici kullanici =userService.loadUserByUsername(telefonNo);

            if (kullanici != null && jwtService.validateToken(token, telefonNo)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        kullanici, null, List.of(() -> "ROLE_" + kullanici.getApartmanRol().name())
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    // Hata mesajlarını tek bir yerden yönetmek için yardımcı metod
    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format("{\"error\": \"%s\"}", message));
    }
}