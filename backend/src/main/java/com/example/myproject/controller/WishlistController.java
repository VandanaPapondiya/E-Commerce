package com.example.myproject.controller;

import com.example.myproject.entity.Wishlist;
import com.example.myproject.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:3000")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/{userId}")
    public Wishlist getWishlist(@PathVariable Long userId) {
        return wishlistService.getWishlist(userId);
    }

    @PostMapping("/add")
    public Wishlist addToWishlist(@RequestParam Long userId, @RequestParam Long productId) {
        return wishlistService.addToWishlist(userId, productId);
    }

    @DeleteMapping("/remove")
    public Wishlist removeFromWishlist(@RequestParam Long userId, @RequestParam Long productId) {
        return wishlistService.removeFromWishlist(userId, productId);
    }
}
