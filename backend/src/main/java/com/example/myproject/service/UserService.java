package com.example.myproject.service;

import com.example.myproject.dto.LoginRequest;
import com.example.myproject.dto.LoginResponse;
import com.example.myproject.dto.RegisterRequest;
import com.example.myproject.dto.RegisterResponse;

public interface UserService {


    RegisterResponse registerUser(RegisterRequest request);

    public LoginResponse loginUser(LoginRequest request);
}