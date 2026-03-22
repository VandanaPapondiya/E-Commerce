package com.example.myproject.service;
import com.example.myproject.entity.Address;
import com.example.myproject.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public Address addAddress(Address address){
        return addressRepository.save(address);
    }

    public List<Address> getUserAddress(Long userId){
        return addressRepository.findByUserId(userId);
    }
}