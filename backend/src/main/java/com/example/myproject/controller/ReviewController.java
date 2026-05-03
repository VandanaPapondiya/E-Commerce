package com.example.myproject.controller;

import com.example.myproject.dto.ReviewDTO;
import com.example.myproject.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/add")
    public ReviewDTO addReview(@RequestBody ReviewDTO reviewDTO) {
        return reviewService.addReview(reviewDTO);
    }

    @GetMapping("/product/{productId}")
    public List<ReviewDTO> getProductReviews(@PathVariable Long productId) {
        return reviewService.getReviewsForProduct(productId);
    }

    @DeleteMapping("/{reviewId}")
    public String deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return "Review deleted successfully";
    }
}
