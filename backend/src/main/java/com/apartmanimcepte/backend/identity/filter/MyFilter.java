package com.apartmanimcepte.backend.identity.filter;

import com.apartmanimcepte.backend.identity.bus.jwt.JwtService;
import com.apartmanimcepte.backend.identity.bus.kullaniciBul.userDetailsService;
import com.apartmanimcepte.backend.identity.entity.Kullanici;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority; // DEĞİŞİKLİK: Bu importu ekleyin
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MyFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final userDetailsService userService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String userPhone;

        try {
            userPhone = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Geçersiz veya süresi dolmuş token.");
            return;
        }

        if (userPhone != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Kullanici kullanici = this.userService.loadUserByUsername(userPhone);

            if (kullanici != null && jwtService.validateToken(jwt, kullanici.getKullaniciTelefon())) {


                List<GrantedAuthority> authorities = new ArrayList<>();


                if (kullanici.getApartmanRol() != null) {
                    authorities.addAll(kullanici.getApartmanRol().getAuthorities());
                }


                if (kullanici.getKonutKullanimRol() != null) {
                    authorities.addAll(kullanici.getKonutKullanimRol().getAuthorities());
                }


                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        kullanici,
                        null,
                        authorities
                );


                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format("{\"hata\": \"%s\"}", message));
    }
}