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
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // HERKESE AÇIK URL'LER BURADA TANIMLANIR
                        .requestMatchers(
                                "/identity/yönetici/kayit",
                                "/identity/giris",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()
                        // YUKARIDAKİLER DIŞINDAKİ TÜM İSTEKLER KİMLİK DOĞRULAMASI GEREKTİRİR
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(myFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // HandlerMappingIntrospector bean'ine artık MyFilter'da ihtiyacımız olmadığı için
    // bu bean tanımını silebiliriz. Spring Boot gerekirse kendisi oluşturur.
}