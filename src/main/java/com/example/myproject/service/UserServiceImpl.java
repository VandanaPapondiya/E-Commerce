package com.example.myproject.service;

import com.example.myproject.dto.LoginRequest;
import com.example.myproject.dto.LoginResponse;
import com.example.myproject.dto.RegisterResponse;
import com.example.myproject.entity.Role;
import com.example.myproject.service.UserService;
import com.example.myproject.dto.RegisterRequest;
import com.example.myproject.entity.User;
import com.example.myproject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public RegisterResponse registerUser(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new RegisterResponse("Email already registered", request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        if(request.getRole() == null || request.getRole().equals("USER"))
            user.setRole(Role.USER);
        else
            user.setRole(Role.ADMIN);

        userRepository.save(user);

        return new RegisterResponse("User registered successfully", user.getEmail());
    }

    @Override
    public LoginResponse loginUser(LoginRequest request) {

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            return new LoginResponse("User not found", null);
        }

        User user = userOptional.get();

        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new LoginResponse("Login successful", user.getEmail());
        } else {
            return new LoginResponse("Invalid password", null);
        }
    }

}