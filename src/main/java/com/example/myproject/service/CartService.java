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

        Optional<CartItem> existingItem = cart.getItems()
                .stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(
                    existingItem.get().getQuantity() + quantity);
        } else {

            CartItem item = new CartItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setCart(cart);

            cart.getItems().add(item);
        }

        return cartRepository.save(cart);
    }

    public Cart getCart(Long userId) {
        Optional<Cart> optional = cartRepository.findByUserId(userId) ;
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

