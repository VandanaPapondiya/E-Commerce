package com.example.myproject.controller;

import com.example.myproject.entity.User;
import com.example.myproject.exception.ResourceNotFoundException;
import com.example.myproject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /** Admin: get all users */
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /** Admin: get user by id */
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /** Admin: delete a user */
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.deleteById(id);
        return "User deleted successfully";
    }
}
