package com.example.myproject.service;

import com.example.myproject.entity.Category;
import com.example.myproject.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public Category addCategory(Category category){

        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories(){

        return categoryRepository.findAll();
    }
}
