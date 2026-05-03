package com.example.myproject.controller;

import com.example.myproject.dto.CouponValidateResponse;
import com.example.myproject.entity.Coupon;
import com.example.myproject.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "http://localhost:3000")
public class CouponController {

    @Autowired
    private CouponService couponService;

    /** Admin: create a new coupon */
    @PostMapping("/create")
    public Coupon createCoupon(@RequestBody Coupon coupon) {
        return couponService.createCoupon(coupon);
    }

    /** Admin: list all coupons */
    @GetMapping
    public List<Coupon> getAllCoupons() {
        return couponService.getAllCoupons();
    }

    /** User: validate a coupon code against a cart total */
    @GetMapping("/validate")
    public CouponValidateResponse validateCoupon(
            @RequestParam String code,
            @RequestParam double cartTotal) {
        return couponService.validateCoupon(code, cartTotal);
    }

    /** Admin: delete a coupon */
    @DeleteMapping("/{id}")
    public String deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return "Coupon deleted";
    }
}
