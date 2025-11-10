package com.lemon.supershop.swp391fa25evdm.report.controller;

import com.lemon.supershop.swp391fa25evdm.report.model.dto.*;
import com.lemon.supershop.swp391fa25evdm.report.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    /**
     * 💰 Báo cáo doanh thu và lợi nhuận
     * GET /api/reports/sales?dealerId={dealerId}
     */
    @GetMapping("/sales")
    public ResponseEntity<SalesReportRes> getSalesReport(
            @RequestParam(required = false) Integer dealerId) {
        SalesReportRes report = reportService.getSalesReport(dealerId);
        return ResponseEntity.ok(report);
    }

    /**
     * 🚗 Báo cáo phân phối và tồn kho
     * GET /api/reports/distribution?dealerId={dealerId}
     */
    @GetMapping("/distribution")
    public ResponseEntity<DistributionReportRes> getDistributionReport(
            @RequestParam(required = false) Integer dealerId) {
        DistributionReportRes report = reportService.getDistributionReport(dealerId);
        return ResponseEntity.ok(report);
    }

    /**
     * ⚡ Top dealer theo doanh số (chỉ Admin)
     * GET /api/reports/dealer-performance?limit={limit}
     */
    @GetMapping("/dealer-performance")
    public ResponseEntity<List<DealerPerformanceRes>> getDealerPerformance(
            @RequestParam(defaultValue = "10") int limit) {
        List<DealerPerformanceRes> dealers = reportService.getDealerPerformance(limit);
        return ResponseEntity.ok(dealers);
    }

    /**
     * 🏆 Top sản phẩm bán chạy
     * GET /api/reports/top-products?dealerId={dealerId}&limit={limit}
     */
    @GetMapping("/top-products")
    public ResponseEntity<List<ProductSalesRes>> getTopProducts(
            @RequestParam(required = false) Integer dealerId,
            @RequestParam(defaultValue = "5") int limit) {
        List<ProductSalesRes> products = reportService.getTopProducts(dealerId, limit);
        return ResponseEntity.ok(products);
    }
}
