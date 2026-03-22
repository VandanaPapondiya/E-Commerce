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
                        .requestMatchers("/api/auth/**", "/api/products",
                                "/api/cart/**","/api/orders/place","/api/orders/user/**",
                                "/api/orders/*/status","/api/orders/all","/api/orders/*/cancel",
                                "/api/orders/**","/api/categories/**",
                                "/api/products/category/**","/api/products/**","/api/address/add",
                                "/api/address/user/**","/api/payment/**").permitAll()
                        .requestMatchers("/api/products/add").hasRole("ADMIN")

                        .requestMatchers("/api/products/delete/**").hasRole("ADMIN")

                        .requestMatchers("/api/products/**").hasAnyRole("USER","ADMIN")
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
