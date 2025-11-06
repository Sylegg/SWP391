package com.lemon.supershop.swp391fa25evdm.vnpay.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lemon.supershop.swp391fa25evdm.vnpay.model.dto.response.VnpayRes;
import com.lemon.supershop.swp391fa25evdm.vnpay.service.VnpayService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * VNPay Payment Integration Controller
 * 
 * REST API cho tích hợp thanh toán VNPay
 * 
 * API Endpoints:
 * - POST /api/vnpay/create-payment    - Tạo URL thanh toán
 * - GET  /api/vnpay/return             - VNPay callback (TEST)
 * - POST /api/vnpay/verify-payment     - Verify payment từ Frontend
 */
@RestController
@RequestMapping("api/vnpay")
@CrossOrigin("*")
public class VnpayController {

    @Autowired
    private VnpayService vnpayService;

    /**
     * Tạo URL thanh toán VNPay
     * 
     * POST /api/vnpay/create-payment?orderId=123&bankCode=NCB
     * 
     * @param orderId Mã đơn hàng
     * @param bankCode Mã ngân hàng (optional: NCB, VIETCOMBANK, etc.)
     * @param request HttpServletRequest để lấy IP
     * @return ResponseEntity với payment URL
     */
    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(
            @RequestParam String orderId,
            @RequestParam(required = false) String bankCode,
            HttpServletRequest request
    ) {
        try {
            // Lấy IP address của client
            String ipAddress = vnpayService.getIpAddress(request);
            
            // Tạo payment URL
            VnpayRes response = vnpayService.createPaymentUrl(orderId, ipAddress, bankCode);
            
            System.out.println("✅ Payment URL created for order: " + orderId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error creating payment: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * VNPay callback handler (cho TEST không có Frontend)
     * 
     * GET /api/vnpay/return?vnp_TxnRef=...&vnp_ResponseCode=...
     * 
     * VNPay sẽ redirect về đây sau khi user thanh toán
     * Method này xử lý callback và hiển thị kết quả trực tiếp
     * 
     * @param request HttpServletRequest chứa callback params từ VNPay
     * @return HTML page hiển thị kết quả thanh toán
     */
    @GetMapping("/return")
    public ResponseEntity<String> handleReturn(HttpServletRequest request) {
        System.out.println("📨 VNPay callback received");
        
        // Xử lý callback từ VNPay
        Map<String, String> result = vnpayService.handleCallback(request);
        
        String status = result.get("status");
        String message = result.get("message");
        String orderId = result.get("orderId");
        
        // Tạo HTML response
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head><meta charset='UTF-8'><title>Kết quả thanh toán</title>");
        html.append("<style>");
        html.append("body { font-family: Arial; margin: 50px; }");
        html.append(".success { color: green; } .failed { color: red; } .error { color: orange; }");
        html.append("</style></head><body>");
        
        if ("success".equals(status)) {
            html.append("<h1 class='success'>✅ Thanh toán thành công</h1>");
            html.append("<p>Mã đơn hàng: <strong>" + orderId + "</strong></p>");
            html.append("<p>Mã giao dịch: <strong>" + result.get("transactionNo") + "</strong></p>");
        } else if ("failed".equals(status)) {
            html.append("<h1 class='failed'>❌ Thanh toán thất bại</h1>");
            html.append("<p>Mã đơn hàng: <strong>" + orderId + "</strong></p>");
            html.append("<p>Lý do: " + message + "</p>");
        } else {
            html.append("<h1 class='error'>⚠️ Lỗi xử lý</h1>");
            html.append("<p>" + message + "</p>");
        }
        
        html.append("</body></html>");
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/html; charset=UTF-8")
                .body(html.toString());
    }

    /**
     * Verify payment từ Frontend (cho PRODUCTION)
     * 
     * POST /api/vnpay/verify-payment
     * 
     * Frontend nhận callback từ VNPay, sau đó forward params về endpoint này
     * Backend verify signature và lưu vào database
     * 
     * @param request HttpServletRequest chứa callback params từ VNPay
     * @return ResponseEntity với kết quả verify
     */
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(HttpServletRequest request) {
        System.out.println("📨 Payment verification request from Frontend");
        
        // Xử lý callback từ VNPay (giống như /return)
        Map<String, String> result = vnpayService.handleCallback(request);
        
        return ResponseEntity.ok(result);
    }
}
