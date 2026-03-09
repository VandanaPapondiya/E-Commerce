package com.example.myproject.service;

import com.example.myproject.entity.Cart;
import com.example.myproject.entity.CartItem;
import com.example.myproject.entity.Product;
import com.example.myproject.repository.CartRepository;
import com.example.myproject.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;


@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    public Cart addToCart(Long userId, Long productId, int quantity) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    return cartRepository.save(newCart);
                });

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Out of stock! Available quantity: " + product.getStock());
        }

        Optional<CartItem> existingItem = cart.getItems()
                .stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {

            CartItem item = existingItem.get();

            int newQuantity = item.getQuantity() + quantity;

            // 🔥 Check total quantity against stock
            if (product.getStock() < newQuantity) {
                throw new RuntimeException("Out of stock! Available quantity: " + product.getStock());
            }

            item.setQuantity(newQuantity);

        } else {

            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setCart(cart);

            cart.getItems().add(newItem);
        }

        return cartRepository.save(cart);
    }
    public Cart getCart(Long userId) {
        Optional<Cart> optional = cartRepository.findByUserId(userId) ;
        if (optional.isEmpty()) {
            throw new RuntimeException("Cart not found for user " + userId);
        }
        return optional.get();
    }

    public Cart removeItem(Long userId, Long productId) {

        Optional<Cart> optionalCart = cartRepository.findByUserId(userId);

        if (optionalCart.isEmpty()) {
            throw new RuntimeException("Cart not found for user " + userId);
        }

        Cart cart = optionalCart.get();

        cart.getItems().removeIf(item ->
                item.getProduct().getId().equals(productId));

        return cartRepository.save(cart);
    }
}

