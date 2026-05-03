package com.example.myproject.dto;

public class LoginResponse {

    private String message;
    private String email;
    private String token;
    private Long userId;
    private String username;
    private String role;
    private String refreshToken;

    public LoginResponse() {}

    public LoginResponse(String message, String email) {
        this.message = message;
        this.email = email;
    }

    public LoginResponse(String message, String email, String token, Long userId, String username, String role, String refreshToken) {
        this.message = message;
        this.email = email;
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.refreshToken = refreshToken;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
}
