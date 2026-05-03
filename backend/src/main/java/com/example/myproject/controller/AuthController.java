package com.example.myproject.controller;

import com.example.myproject.dto.LoginResponse;
import com.example.myproject.dto.RegisterRequest;
import com.example.myproject.dto.RegisterResponse;
import com.example.myproject.entity.Role;
import com.example.myproject.entity.User;
import com.example.myproject.repository.UserRepository;
import com.example.myproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    /**
     * Login with email + password (BCrypt).
     * Returns JWT access token + refresh token + user info.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        // Support login by email or username
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByUsername(request.getEmail());
        }

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body("User not found");
        }

        User user = userOptional.get();

        // Support both raw (legacy) and BCrypt-encoded passwords
        boolean passwordMatches = false;
        if (user.getPassword() != null) {
            if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$")) {
                passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
            } else {
                passwordMatches = user.getPassword().equals(request.getPassword());
            }
        }

        if (!passwordMatches) {
            return ResponseEntity.status(401).body("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getUsername() != null ? user.getUsername() : user.getEmail(),
                user.getId(), user.getRole() != null ? user.getRole().name() : "USER");
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername() != null ? user.getUsername() : user.getEmail());

        LoginResponse response = new LoginResponse(
                "Login successful",
                user.getEmail(),
                token,
                user.getId(),
                user.getUsername() != null ? user.getUsername() : user.getEmail(),
                user.getRole() != null ? user.getRole().name() : "USER",
                refreshToken
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Register a new user (uses BCrypt password encoding).
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        RegisterResponse response = userService.registerUser(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Legacy signup endpoint (kept for backward compatibility).
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    /**
     * Refresh access token using a valid refresh token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtUtil.isTokenValid(refreshToken)) {
            return ResponseEntity.status(401).body("Invalid or expired refresh token");
        }
        String username = jwtUtil.extractUsername(refreshToken);
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByEmail(username);
        }
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body("User not found");
        }
        User user = userOptional.get();
        String newToken = jwtUtil.generateToken(
                user.getUsername() != null ? user.getUsername() : user.getEmail(),
                user.getId(),
                user.getRole() != null ? user.getRole().name() : "USER"
        );
        return ResponseEntity.ok(new java.util.HashMap<String, String>() {{
            put("token", newToken);
        }});
    }

    // Inner DTO for refresh token request
    public static class LoginRequest {
        private String email;
        private String password;
        public String getEmail() { return email; }
        public String getPassword() { return password; }
    }

    public static class RefreshTokenRequest {
        private String refreshToken;
        public String getRefreshToken() { return refreshToken; }
    }
}