package com.example.myproject.dto;

import java.util.List;
import java.util.Map;

public class SalesReportDTO {

    private long totalOrders;
    private double totalRevenue;
    private long deliveredOrders;
    private long cancelledOrders;
    private long totalUsers;
    private long totalProducts;
    private Map<String, Double> revenueByDate;
    private List<TopProductDTO> topProducts;

    public SalesReportDTO() {}

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getDeliveredOrders() { return deliveredOrders; }
    public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }

    public long getCancelledOrders() { return cancelledOrders; }
    public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public Map<String, Double> getRevenueByDate() { return revenueByDate; }
    public void setRevenueByDate(Map<String, Double> revenueByDate) { this.revenueByDate = revenueByDate; }

    public List<TopProductDTO> getTopProducts() { return topProducts; }
    public void setTopProducts(List<TopProductDTO> topProducts) { this.topProducts = topProducts; }

    public static class TopProductDTO {
        private String productName;
        private long orderCount;
        private double revenue;

        public TopProductDTO(String productName, long orderCount, double revenue) {
            this.productName = productName;
            this.orderCount = orderCount;
            this.revenue = revenue;
        }

        public String getProductName() { return productName; }
        public long getOrderCount() { return orderCount; }
        public double getRevenue() { return revenue; }
    }
}
