package com.lemon.supershop.swp391fa25evdm.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import com.lemon.supershop.swp391fa25evdm.authentication.service.CustomOAuth2UserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable());

        http
                // OLD: Có /login tạo lỗi "No static resource login"
                // .authorizeHttpRequests(auth -> auth
                //         .requestMatchers("/", "/login", "/oauth2/**", "/error").permitAll()
                //         .anyRequest().authenticated()
                // )
                
                // NEW: Xóa /login vì FE tự xử lý, thêm /api/** để cho phép tất cả API
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/oauth2/**", "/api/auth/google/callback", "/api/**", "/error", "/swagger-ui/**", "/api-docs/**").permitAll()
                        .anyRequest().authenticated()
                )
                
                // OLD: Có .loginPage("/login") tạo lỗi
                // .oauth2Login(oauth -> oauth
                //         .loginPage("/login")
                //         .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                //         .defaultSuccessUrl("/api/auth/google/callback", true)
                // );
                
                // NEW: Xóa loginPage vì FE tự xử lý
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .defaultSuccessUrl("/api/auth/google/callback", true)
                );

        return http.build();
    }
}
