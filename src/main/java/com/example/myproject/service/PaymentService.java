package com.example.myproject.service;

import com.example.myproject.entity.Order;
import com.example.myproject.entity.Payment;
import com.example.myproject.exception.ResourceNotFoundException;
import com.example.myproject.repository.OrderRepository;
import com.example.myproject.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    public Payment makePayment(Long orderId, String method){

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Payment payment = new Payment();

        payment.setPaymentMethod(method);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus("SUCCESS");
        payment.setOrder(order);

        return paymentRepository.save(payment);
    }
}