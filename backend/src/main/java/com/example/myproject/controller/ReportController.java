package com.example.myproject.controller;

import com.example.myproject.dto.SalesReportDTO;
import com.example.myproject.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/sales")
    public SalesReportDTO getSalesReport() {
        return reportService.getSalesReport();
    }
}
