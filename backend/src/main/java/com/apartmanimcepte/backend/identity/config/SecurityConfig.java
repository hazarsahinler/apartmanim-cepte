package com.apartmanimcepte.backend.identity.config;

import com.apartmanimcepte.backend.identity.filter.MyFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final MyFilter myFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Collections.singletonList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/identity/giris",
                                "/api/identity/yonetici/kayit",
                                "/api/identity/kullanici/kayit",
                                "/api/identity/apartman/sakin/kayit",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // Site, blok, daire ekleme/silme/güncelleme gibi işlemleri SADECE YONETICI yapabilsin
                        .requestMatchers("/api/structure/site/ekle").hasRole("YONETICI")
                        .requestMatchers("/api/structure/blok/ekle").hasRole("YONETICI")
                        .requestMatchers("/api/structure/bloklar/**").hasRole("YONETICI")
                        .requestMatchers("/api/structure/daire/sakin/ekle").hasRole("YONETICI")
                        .requestMatchers("/api/structure/site/{kullaniciId}").hasRole("YONETICI")
                        .requestMatchers("/api/finance/borc/ekle").hasRole("YONETICI")
                        .requestMatchers("/api/finance/daireler/borc/{borcId}").hasRole("YONETICI")
                        .requestMatchers("/api/finance/eklenen/borclar").hasRole("YONETICI")
                        .requestMatchers("/api/finance/odeme/istek/gonder/{daireBorcId}").hasAnyRole("YONETICI", "APARTMANSAKIN")
                        .requestMatchers("/api/finance/odeme/istekler/{siteId}").hasRole("YONETICI")
                        .requestMatchers("/api/finance/odeme/istek/kabul/{daireBorcId}").hasRole("YONETICI")
                        .requestMatchers("/api/structure/kullanici/daire/bul/{telefonNo}").hasAnyRole("YONETICI","APARTMANSAKIN")
                        .requestMatchers("/api/finance/odeme/istek/onay/{daireBorcId}").hasAnyRole("YONETICI","APARTMANSAKIN")
                        .requestMatchers("/api/finance/total/gelir/{siteId}").hasAnyRole("YONETICI","APARTMANSAKIN")
                        .requestMatchers("/api/finance/gider/ekle").hasRole("YONETICI")
                        .requestMatchers("/api/finance/gider/getir/{steId}").hasAnyRole("YONETICI","APARTMANSAKIN")
                        .requestMatchers("/api/finance/gider/belge/goster/{belgeId}").hasAnyRole("YONETICI","APARTMANSAKIN")
                        .requestMatchers("/api/finance/total/gider/{siteId}").hasAnyRole("YONETICI","APARTMANSAKIN")


                        // Geriye kalan TÜM istekler için kimlik doğrulaması (login) zorunlu olsun
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(myFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
