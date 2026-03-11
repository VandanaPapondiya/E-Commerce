package com.example.myproject.service;

import com.example.myproject.dto.ProductDTO;
import com.example.myproject.entity.Category;
import com.example.myproject.entity.Product;
import com.example.myproject.exception.ResourceNotFoundException;
import com.example.myproject.repository.CategoryRepository;
import com.example.myproject.repository.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    public ProductDTO addProduct(ProductDTO productDTO){

        Product product = modelMapper.map(productDTO, Product.class);

        Category category = categoryRepository
                .findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        product.setCategory(category);

        Product savedProduct = productRepository.save(product);

        return modelMapper.map(savedProduct, ProductDTO.class);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = productRepository.findById(id).orElse(null);

        if (existingProduct != null) {
            existingProduct.setName(updatedProduct.getName());
            existingProduct.setDescription(updatedProduct.getDescription());
            existingProduct.setPrice(updatedProduct.getPrice());
            existingProduct.setQuantity(updatedProduct.getQuantity());

            return productRepository.save(existingProduct);
        }

        return null;
    }

    public String deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return "Product deleted successfully";
        }
        return "Product not found";
    }

    public Page getAllProducts(Pageable pageable){
        return productRepository.findAll(pageable);
    }
}
