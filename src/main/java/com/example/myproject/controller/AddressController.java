package com.example.myproject.controller;

import com.example.myproject.entity.Address;
import com.example.myproject.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/address")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @PostMapping("/add")
    public Address addAddress(@RequestBody Address address){
        return addressService.addAddress(address);
    }

    @GetMapping("/user/{userId}")
    public List<Address> getUserAddress(@PathVariable Long userId){
        return addressService.getUserAddress(userId);
    }
}