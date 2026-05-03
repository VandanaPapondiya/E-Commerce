package com.example.myproject.service;

import com.example.myproject.entity.Order;
import com.example.myproject.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOrderConfirmationEmail(String toEmail, Order order) {
        if (mailSender == null) {
            // Mail sender not configured - skip silently
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Order Confirmation - Order #" + order.getId());
            message.setText(
                "Thank you for your order!\n\n" +
                "Order ID: " + order.getId() + "\n" +
                "Total Amount: ₹" + order.getTotalAmount() + "\n" +
                "Status: " + order.getStatus() + "\n" +
                "Order Date: " + order.getOrderDate() + "\n\n" +
                "We will notify you when your order is shipped.\n\n" +
                "Thank you for shopping with us!"
            );
            mailSender.send(message);
        } catch (Exception e) {
            // Log but don't fail the order placement
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendOrderStatusUpdateEmail(String toEmail, Order order) {
        if (mailSender == null) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Order #" + order.getId() + " Status Update");
            message.setText(
                "Your order status has been updated.\n\n" +
                "Order ID: " + order.getId() + "\n" +
                "New Status: " + order.getStatus() + "\n\n" +
                "Thank you for shopping with us!"
            );
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
