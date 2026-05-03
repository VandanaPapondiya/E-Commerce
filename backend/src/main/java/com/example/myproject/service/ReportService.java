package com.example.myproject.service;

import com.example.myproject.dto.SalesReportDTO;
import com.example.myproject.entity.Order;
import com.example.myproject.entity.OrderItem;
import com.example.myproject.entity.OrderStatus;
import com.example.myproject.repository.OrderRepository;
import com.example.myproject.repository.ProductRepository;
import com.example.myproject.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public SalesReportDTO getSalesReport() {

        List<Order> allOrders = orderRepository.findAll();

        SalesReportDTO report = new SalesReportDTO();

        report.setTotalOrders(allOrders.size());
        report.setTotalRevenue(allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalAmount)
                .sum());
        report.setDeliveredOrders(allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .count());
        report.setCancelledOrders(allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CANCELLED)
                .count());
        report.setTotalUsers(userRepository.count());
        report.setTotalProducts(productRepository.count());

        // Revenue grouped by date (last 30 days)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Double> revenueByDate = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getOrderDate() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getOrderDate().format(formatter),
                        Collectors.summingDouble(Order::getTotalAmount)
                ));
        // Sort by date
        Map<String, Double> sortedRevenue = new TreeMap<>(revenueByDate);
        report.setRevenueByDate(sortedRevenue);

        // Top products by revenue
        Map<String, double[]> productStats = new HashMap<>();
        for (Order order : allOrders) {
            if (order.getStatus() == OrderStatus.CANCELLED) continue;
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() == null) continue;
                String name = item.getProduct().getName();
                double revenue = item.getPrice() * item.getQuantity();
                productStats.merge(name, new double[]{1, revenue},
                        (existing, newVal) -> new double[]{existing[0] + 1, existing[1] + newVal[1]});
            }
        }

        List<SalesReportDTO.TopProductDTO> topProducts = productStats.entrySet().stream()
                .map(e -> new SalesReportDTO.TopProductDTO(e.getKey(), (long) e.getValue()[0], e.getValue()[1]))
                .sorted(Comparator.comparingDouble(SalesReportDTO.TopProductDTO::getRevenue).reversed())
                .limit(5)
                .collect(Collectors.toList());

        report.setTopProducts(topProducts);

        return report;
    }
}
