package com.lemon.supershop.swp391fa25evdm.report.service;

import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.order.repository.OrderRepo;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
import com.lemon.supershop.swp391fa25evdm.report.model.dto.DealerPerformanceRes;
import com.lemon.supershop.swp391fa25evdm.report.model.dto.DistributionReportRes;
import com.lemon.supershop.swp391fa25evdm.report.model.dto.ProductSalesRes;
import com.lemon.supershop.swp391fa25evdm.report.model.dto.SalesReportRes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private OrderRepo orderRepository;

    @Autowired
    private ProductRepo productRepository;

    @Autowired
    private DealerRepo dealerRepository;

    /**
     * 💰 Báo cáo doanh thu và lợi nhuận
     */
    public SalesReportRes getSalesReport(Integer dealerId) {
        System.out.println("🔍 getSalesReport called with dealerId: " + dealerId);
        
        List<Order> orders;
        
        if (dealerId != null) {
            orders = orderRepository.findByDealerId(dealerId);
            System.out.println("📦 Found " + orders.size() + " orders for dealerId: " + dealerId);
        } else {
            orders = orderRepository.findAll();
            System.out.println("📦 Found " + orders.size() + " total orders (ALL dealers)");
        }

        // Lọc chỉ đơn hàng DELIVERED hoặc COMPLETED
        List<Order> filteredOrders = orders.stream()
                .filter(o -> "DELIVERED".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus()))
                .collect(Collectors.toList());
        
        System.out.println("✅ After filtering: " + filteredOrders.size() + " DELIVERED/COMPLETED orders");
        
        // Debug: Print first few orders
        filteredOrders.stream().limit(3).forEach(o -> 
            System.out.println("  - Order #" + o.getId() + ": Status=" + o.getStatus() + ", Total=" + o.getTotal() + ", DealerId=" + (o.getDealer() != null ? o.getDealer().getId() : "NULL"))
        );

        double totalRevenue = 0;
        double totalCost = 0;
        int totalOrders = filteredOrders.size();

        for (Order order : filteredOrders) {
            totalRevenue += order.getTotal();
            
            // Tính cost từ manufacturerPrice của product
            Product product = order.getProduct();
            if (product != null && product.getManufacturerPrice() != null) {
                totalCost += product.getManufacturerPrice();
            }
        }

        double totalProfit = totalRevenue - totalCost;
        double averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        double profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        System.out.println("💰 Results: Orders=" + totalOrders + ", Revenue=" + totalRevenue + ", Profit=" + totalProfit);

        return new SalesReportRes(
            totalRevenue,
            totalProfit,
            totalOrders,
            averageOrderValue,
            profitMargin
        );
    }

    /**
     * 🚗 Báo cáo phân phối và tồn kho
     */
    public DistributionReportRes getDistributionReport(Integer dealerId) {
        System.out.println("🔍 getDistributionReport called with dealerId: " + dealerId);
        
        List<Product> products;
        
        if (dealerId != null) {
            products = productRepository.findByDealerId(dealerId);
            System.out.println("📦 Found " + products.size() + " products for dealerId: " + dealerId);
        } else {
            products = productRepository.findAll();
            System.out.println("📦 Found " + products.size() + " total products (ALL dealers)");
        }

        int totalDistributed = products.size();
        int totalInStock = 0;
        int totalSold = 0;
        int totalInactive = 0;

        for (Product product : products) {
            if (product.getStatus() != null) {
                switch (product.getStatus()) {
                    case ACTIVE:
                        totalInStock++;
                        break;
                    case SOLDOUT:  // Đổi từ SOLD sang SOLDOUT
                        totalSold++;
                        break;
                    case INACTIVE:
                        totalInactive++;
                        break;
                    default:
                        break;
                }
            }
        }

        double distributionRate = totalDistributed > 0 
            ? ((double) totalSold / totalDistributed) * 100 
            : 0;

        System.out.println("🚗 Results: Total=" + totalDistributed + ", InStock=" + totalInStock + ", Sold=" + totalSold + ", Inactive=" + totalInactive);

        return new DistributionReportRes(
            totalDistributed,
            totalInStock,
            totalSold,
            totalInactive,
            distributionRate
        );
    }

    /**
     * ⚡ Top dealer theo doanh số
     */
    public List<DealerPerformanceRes> getDealerPerformance(int limit) {
        List<Dealer> dealers = dealerRepository.findAll();
        List<DealerPerformanceRes> performances = new ArrayList<>();

        for (Dealer dealer : dealers) {
            List<Order> dealerOrders = orderRepository.findByDealerId(dealer.getId());
            
            // Lọc chỉ đơn DELIVERED/COMPLETED
            dealerOrders = dealerOrders.stream()
                    .filter(o -> "DELIVERED".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus()))
                    .collect(Collectors.toList());

            if (dealerOrders.isEmpty()) {
                continue;
            }

            int totalSales = dealerOrders.size();
            double totalRevenue = 0;
            double totalCost = 0;

            for (Order order : dealerOrders) {
                totalRevenue += order.getTotal();
                
                Product product = order.getProduct();
                if (product != null && product.getManufacturerPrice() != null) {
                    totalCost += product.getManufacturerPrice();
                }
            }

            double totalProfit = totalRevenue - totalCost;
            
            List<Product> dealerProducts = productRepository.findByDealerId(dealer.getId());
            int totalProducts = dealerProducts.size();

            performances.add(new DealerPerformanceRes(
                dealer.getId(),
                dealer.getName(),
                dealer.getAddress(),
                totalSales,
                totalRevenue,
                totalProfit,
                totalProducts
            ));
        }

        // Sắp xếp theo doanh thu giảm dần và lấy top N
        return performances.stream()
                .sorted((a, b) -> Double.compare(b.getTotalRevenue(), a.getTotalRevenue()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * 🏆 Top sản phẩm bán chạy
     */
    public List<ProductSalesRes> getTopProducts(Integer dealerId, int limit) {
        List<Order> orders;
        
        if (dealerId != null) {
            orders = orderRepository.findByDealerId(dealerId);
        } else {
            orders = orderRepository.findAll();
        }

        // Lọc chỉ đơn DELIVERED/COMPLETED
        orders = orders.stream()
                .filter(o -> "DELIVERED".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus()))
                .collect(Collectors.toList());

        // Nhóm theo tên sản phẩm
        Map<String, ProductSalesData> productSalesMap = new HashMap<>();

        for (Order order : orders) {
            Product product = order.getProduct();
            if (product != null && product.getName() != null) {
                String productName = product.getName();
                
                productSalesMap.putIfAbsent(productName, new ProductSalesData(
                    productName,
                    product.getCategory() != null ? product.getCategory().getName() : "N/A"
                ));
                
                ProductSalesData salesData = productSalesMap.get(productName);
                salesData.addSale(order.getTotal());
            }
        }

        // Chuyển sang list và sắp xếp
        return productSalesMap.values().stream()
                .sorted((a, b) -> Integer.compare(b.totalSold, a.totalSold))
                .limit(limit)
                .map(data -> new ProductSalesRes(
                    data.productName,
                    data.categoryName,
                    data.totalSold,
                    data.totalRevenue,
                    data.totalSold > 0 ? data.totalRevenue / data.totalSold : 0
                ))
                .collect(Collectors.toList());
    }

    /**
     * Helper class để tính toán dữ liệu bán hàng
     */
    private static class ProductSalesData {
        String productName;
        String categoryName;
        int totalSold = 0;
        double totalRevenue = 0;

        ProductSalesData(String productName, String categoryName) {
            this.productName = productName;
            this.categoryName = categoryName;
        }

        void addSale(double price) {
            this.totalSold++;
            this.totalRevenue += price;
        }
    }
}
