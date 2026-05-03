package com.example.myproject.service;

import com.example.myproject.dto.ReviewDTO;
import com.example.myproject.entity.Product;
import com.example.myproject.entity.Review;
import com.example.myproject.exception.ResourceNotFoundException;
import com.example.myproject.repository.ProductRepository;
import com.example.myproject.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public ReviewDTO addReview(ReviewDTO dto) {

        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Review review = new Review();
        review.setUserId(dto.getUserId());
        review.setUsername(dto.getUsername());
        review.setProduct(product);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        Review saved = reviewRepository.save(review);

        // Update product average rating
        updateProductRating(product);

        return toDTO(saved);
    }

    public List<ReviewDTO> getReviewsForProduct(Long productId) {
        return reviewRepository.findByProductId(productId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        Product product = review.getProduct();
        reviewRepository.delete(review);
        updateProductRating(product);
    }

    private void updateProductRating(Product product) {
        Double avg = reviewRepository.findAverageRatingByProductId(product.getId());
        Long count = reviewRepository.countByProductId(product.getId());
        product.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0);
        product.setReviewCount(count != null ? count.intValue() : 0);
        productRepository.save(product);
    }

    private ReviewDTO toDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setUserId(review.getUserId());
        dto.setUsername(review.getUsername());
        dto.setProductId(review.getProduct().getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
