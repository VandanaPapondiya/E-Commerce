package com.example.myproject.controller;

import com.example.myproject.entity.Payment;
import com.example.myproject.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/pay")
    public Payment makePayment(@RequestParam Long orderId,
                               @RequestParam String method){

        return paymentService.makePayment(orderId, method);
    }
}