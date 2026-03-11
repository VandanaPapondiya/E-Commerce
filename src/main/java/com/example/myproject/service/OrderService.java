package com.example.myproject.service;

import com.example.myproject.dto.OrderDTO;
import com.example.myproject.entity.*;
import com.example.myproject.exception.ResourceNotFoundException;
import com.example.myproject.repository.CartRepository;
import com.example.myproject.repository.OrderRepository;
import com.example.myproject.repository.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    public OrderDTO placeOrder(Order order) {
        Long userId = order.getUserId();
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() ->new ResourceNotFoundException("Cart is empty"));


        Order order1 = new Order();
        order1.setUserId(userId);
        order1.setOrderDate(LocalDateTime.now());
        order1.setStatus(OrderStatus.PLACED);

        double total = 0;

        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();

            //  Final stock validation
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Product out of stock: " + product.getName());
            }

            //  Reduce stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setOrder(order);

            total += orderItem.getPrice() * orderItem.getQuantity();

            order.getItems().add(orderItem);
        }

        order.setTotalAmount(total);

        //  Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);
        Order savedOrder = orderRepository.save(order);

        return modelMapper.map(savedOrder, OrderDTO.class);
    }

    public List<Order> getOrdersByUser(Long userId) {
        Order order = orderRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUserId(userId);
    }

    public Order updateOrderStatus(Long orderId, OrderStatus status){

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->new ResourceNotFoundException("Product not found"));

        order.setStatus(status);

        return orderRepository.save(order);
    }

    @Autowired
    private ModelMapper modelMapper;

    public List<OrderDTO> getAllOrders(){

        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .toList();
    }

    public Order cancelOrder(Long orderId){

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(OrderStatus.CANCELLED);

        return orderRepository.save(order);
    }

    public void deleteOrder(Long orderId){

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        orderRepository.delete(order);
    }
}