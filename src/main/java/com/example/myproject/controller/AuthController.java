package com.example.myproject.controller;


import com.example.myproject.dto.LoginRequest;
import com.example.myproject.dto.LoginResponse;
import com.example.myproject.dto.RegisterRequest;
import com.example.myproject.dto.RegisterResponse;
import com.example.myproject.entity.Role;
import com.example.myproject.entity.User;
import com.example.myproject.repository.UserRepository;
import com.example.myproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;
import java.util.Date;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public String login(@RequestBody User user){

        User existingUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!existingUser.getPassword().equals(user.getPassword())){
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(user.getUsername());
    }

    @PostMapping("/signup")
    public User signup(@RequestBody User user){
        return userRepository.save(user);
    }
}