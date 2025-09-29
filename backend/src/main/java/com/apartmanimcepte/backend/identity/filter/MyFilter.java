package com.apartmanimcepte.backend.identity.filter;

import com.apartmanimcepte.backend.identity.bus.jwt.JwtService;
import com.apartmanimcepte.backend.identity.bus.kullaniciBul.userDetailsService;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor; // Lombok'un bu anotasyonu constructor'ı otomatik oluşturur
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor // final olan alanlar için otomatik constructor oluşturur
public class MyFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final userDetailsService userService;

    // Constructor'dan URL eşleştirme mantığı tamamen kaldırıldı!

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Eğer Authorization başlığı yoksa veya "Bearer " ile başlamıyorsa,
        // hiçbir şey yapma ve zincirin bir sonraki filtresine devam et.
        // Kararı (izin ver/reddet) SecurityConfig'deki zincir verecek.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String userPhone;

        try {
            userPhone = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // Token geçersizse, yine de zincire devam et.
            // Spring Security'nin kendisi 401 Unauthorized hatası verecektir.
            // Hata mesajını burada kendimiz de basabiliriz.
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Geçersiz veya süresi dolmuş token.");
            return;
        }

        // Token'dan kullanıcı adı alındıysa ve henüz context'te bir kimlik yoksa
        if (userPhone != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Kullanici kullanici = this.userService.loadUserByUsername(userPhone);

            if (kullanici != null && jwtService.validateToken(jwt, kullanici.getKullaniciTelefon())) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        kullanici,
                        null,
                        Collections.singletonList(() -> "ROLE_" + kullanici.getApartmanRol().name())
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // Kimlik doğrulama bilgisini SecurityContext'e yerleştir
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Her durumda zincirin bir sonraki filtresine devam et
        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format("{\"hata\": \"%s\"}", message));
    }
}