package com.example.myproject.service;

import com.example.myproject.dto.CouponValidateResponse;
import com.example.myproject.entity.Coupon;
import com.example.myproject.exception.ResourceNotFoundException;
import com.example.myproject.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public Coupon createCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public CouponValidateResponse validateCoupon(String code, double cartTotal) {

        Optional<Coupon> optional = couponRepository.findByCode(code.toUpperCase().trim());

        if (optional.isEmpty()) {
            return new CouponValidateResponse(false, "Invalid coupon code");
        }

        Coupon coupon = optional.get();

        if (!coupon.isActive()) {
            return new CouponValidateResponse(false, "Coupon is inactive");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
            return new CouponValidateResponse(false, "Coupon has expired");
        }

        if (coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return new CouponValidateResponse(false, "Coupon usage limit reached");
        }

        double discount;
        if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = cartTotal * (coupon.getDiscountValue() / 100.0);
        } else {
            discount = Math.min(coupon.getDiscountValue(), cartTotal);
        }

        double finalAmount = Math.max(0, cartTotal - discount);

        CouponValidateResponse response = new CouponValidateResponse(true, "Coupon applied successfully");
        response.setDiscountValue(discount);
        response.setDiscountType(coupon.getDiscountType());
        response.setFinalAmount(finalAmount);

        return response;
    }

    @Transactional
    public void markCouponUsed(String code) {
        couponRepository.findByCode(code.toUpperCase().trim()).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        });
    }

    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }
}
