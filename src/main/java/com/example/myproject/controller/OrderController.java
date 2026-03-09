package com.example.myproject.controller;

import com.example.myproject.entity.Order;
import com.example.myproject.entity.OrderStatus;
import com.example.myproject.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public Order placeOrder(@RequestParam Long userId) {
        return orderService.placeOrder(userId);
    }

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable Long userId) {
        return orderService.getOrdersByUser(userId);
    }

    @PutMapping("/{orderId}/status")
    public Order updateStatus(@PathVariable Long orderId,
                              @RequestParam OrderStatus status){

        return orderService.updateOrderStatus(orderId, status);
    }

    @GetMapping("/all")
    public List<Order> getAllOrders(){
        return orderService.getAllOrders();
    }

    @PutMapping("/{orderId}/cancel")
    public Order cancelOrder(@PathVariable Long orderId){
        return orderService.cancelOrder(orderId);
    }

    @DeleteMapping("/{orderId}")
    public String deleteOrder(@PathVariable Long orderId){

        orderService.deleteOrder(orderId);
        return "Order Deleted Successfully";
    }
}