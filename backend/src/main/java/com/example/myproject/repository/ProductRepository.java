package com.example.myproject.repository;

import com.example.myproject.entity.Product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByNameContaining(String name);
    List<Product> findByPriceBetween(double min,double max);


    Page findAll(Pageable pageable);
}
