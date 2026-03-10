package com.example.myproject.controller;

import com.example.myproject.entity.Product;
import com.example.myproject.repository.ProductRepository;
import com.example.myproject.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/add")
    public Product addProduct(@RequestBody Product product) {
        return productService.addProduct(product);
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        return productService.deleteProduct(id);
    }

    @GetMapping("/category/{id}")
    public List<Product> getProductsByCategory(@PathVariable Long id){

        return productRepository.findByCategoryId(id);
    }

    @GetMapping("/search")
    public List<Product> searchProduct(@RequestParam String name){
        return productRepository.findByNameContaining(name);
    }

    @GetMapping("/price")
    public List<Product> getByPriceRange(
            @RequestParam double min,
            @RequestParam double max){

        return productRepository.findByPriceBetween(min,max);
    }

    @GetMapping("/products")
    public Page<Product> getProducts(Pageable pageable){
        return productService.getAllProducts(pageable);
    }
}