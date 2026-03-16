package com.example.myproject.controller;

import com.example.myproject.entity.Cart;
import com.example.myproject.entity.Product;
import com.example.myproject.entity.User;
import com.example.myproject.repository.CartRepository;
import com.example.myproject.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private CartRepository cartRepository;

    @PostMapping("/add")
    public Cart addToCart(@RequestParam Long userId,
                          @RequestParam Long productId,
                          @RequestParam int quantity) {

        return cartService.addToCart(userId, productId, quantity);
    }

    @GetMapping("/{userId}")
    public Cart getCart(@PathVariable Long userId) {
        return cartService.getCart(userId);
    }

    @DeleteMapping("/remove")
    public Cart removeItem(@RequestParam Long userId,
                           @RequestParam Long productId) {

        return cartService.removeItem(userId, productId);
    }
    @PutMapping("/increase")
    public Cart increaseQuantity(@RequestParam Long userId,
                                 @RequestParam Long productId){

        return cartService.increaseQuantity(userId, productId);
    }
    @PutMapping("/decrease")
    public Cart decreaseQuantity(@RequestParam Long userId,
                                 @RequestParam Long productId){

        return cartService.decreaseQuantity(userId, productId);
    }
}
