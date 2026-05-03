package com.example.myproject.service;

import com.example.myproject.entity.Product;
import com.example.myproject.entity.Wishlist;
import com.example.myproject.exception.ResourceNotFoundException;
import com.example.myproject.repository.ProductRepository;
import com.example.myproject.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    public Wishlist getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wishlist wishlist = new Wishlist();
                    wishlist.setUserId(userId);
                    return wishlistRepository.save(wishlist);
                });
    }

    @Transactional
    public Wishlist addToWishlist(Long userId, Long productId) {
        Wishlist wishlist = getWishlist(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        boolean alreadyExists = wishlist.getProducts().stream()
                .anyMatch(p -> p.getId().equals(productId));

        if (!alreadyExists) {
            wishlist.getProducts().add(product);
            return wishlistRepository.save(wishlist);
        }

        return wishlist;
    }

    @Transactional
    public Wishlist removeFromWishlist(Long userId, Long productId) {
        Wishlist wishlist = getWishlist(userId);
        wishlist.getProducts().removeIf(p -> p.getId().equals(productId));
        return wishlistRepository.save(wishlist);
    }
}
