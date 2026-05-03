package com.example.myproject.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Auth endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        // Product endpoints
                        .requestMatchers("/api/products/**").permitAll()
                        // Category endpoints
                        .requestMatchers("/api/categories/**").permitAll()
                        // Cart endpoints
                        .requestMatchers("/api/cart/**").permitAll()
                        // Order endpoints
                        .requestMatchers("/api/orders/**").permitAll()
                        // Address endpoints
                        .requestMatchers("/api/address/**").permitAll()
                        // Payment endpoints
                        .requestMatchers("/api/payment/**").permitAll()
                        // Review endpoints
                        .requestMatchers("/api/reviews/**").permitAll()
                        // Wishlist endpoints
                        .requestMatchers("/api/wishlist/**").permitAll()
                        // Coupon endpoints
                        .requestMatchers("/api/coupons/**").permitAll()
                        // Report endpoints
                        .requestMatchers("/api/reports/**").permitAll()
                        // User management endpoints
                        .requestMatchers("/api/users/**").permitAll()
                        // Swagger UI
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
