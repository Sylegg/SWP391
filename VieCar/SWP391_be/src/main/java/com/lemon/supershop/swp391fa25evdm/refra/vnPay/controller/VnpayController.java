package com.lemon.supershop.swp391fa25evdm.refra.vnPay.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lemon.supershop.swp391fa25evdm.refra.vnPay.model.dto.Response.VnpayRes;
import com.lemon.supershop.swp391fa25evdm.refra.vnPay.service.VnpayService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * ========================================================================================
 * VNPay Payment Integration Controller
 * ========================================================================================
 * 
 * REST API Controller cho tích hợp thanh toán VNPay - Cổng thanh toán trực tuyến hàng đầu VN
 * REST API Controller for VNPay payment integration - Leading online payment gateway in Vietnam
 * 
 * <p><strong>Chức năng chính / Main Features:</strong>
 * <ul>
 *   <li>🔗 Tạo URL thanh toán VNPay / Create VNPay payment URL</li>
 *   <li>✅ Xác thực callback từ VNPay / Verify VNPay callback</li>
 *   <li>💾 Lưu thông tin thanh toán vào DB / Save payment information to database</li>
 *   <li>🎯 Hỗ trợ cả trả về trực tiếp & proxy qua Frontend / Support both direct return & frontend proxy</li>
 * </ul>
 * 
 * <p><strong>API Endpoints:</strong>
 * <pre>
 * POST /api/vnpay/create-payment    - Tạo URL thanh toán (Frontend gọi khi user chọn VNPay)
 * GET  /api/vnpay/return             - VNPay redirect về đây (cho TEST không FE)
 * POST /api/vnpay/verify-payment     - Frontend gửi params từ VNPay về (khi có FE)
 * </pre>
 * 
 * <p><strong>Luồng thanh toán / Payment Flow:</strong>
 * <ol>
 *   <li>Frontend gọi POST /create-payment với orderId</li>
 *   <li>Backend tạo URL → Frontend redirect user đến VNPay</li>
 *   <li>User thanh toán tại VNPay</li>
 *   <li><strong>Option A (TEST):</strong> VNPay redirect về GET /return → Backend xử lý trực tiếp</li>
 *   <li><strong>Option B (PRODUCTION):</strong> VNPay redirect về Frontend → Frontend POST /verify-payment → Backend xử lý</li>
 * </ol>
 * 
 * @author Lemon SuperShop Team
 * @version 2.0
 * @since 2025-01-15
 * @see VnpayService
 */
@RestController
@RequestMapping("api/vnpay")
@CrossOrigin("*")  // Cho phép mọi origin (production nên giới hạn)
public class VnpayController {

    // ========================================================================================
    // DEPENDENCIES & CONFIGURATIONS
    // ========================================================================================
    
    @Autowired
    private VnpayService vnpayService;  // Service xử lý logic VNPay

    // ========================================================================================
    // PUBLIC API ENDPOINTS
    // ========================================================================================

    /**
     * ========================================================================================
     * 🔗 TẠO URL THANH TOÁN VNPAY / CREATE VNPAY PAYMENT URL
     * ========================================================================================
     * 
     * <p><strong>Endpoint:</strong> POST /api/vnpay/create-payment
     * 
     * <p><strong>Mục đích / Purpose:</strong><br>
     * Tạo URL thanh toán VNPay để Frontend redirect user đi thanh toán<br>
     * Generate VNPay payment URL for Frontend to redirect user to payment page
     * 
     * <p><strong>Request Parameters:</strong>
     * <ul>
     *   <li><code>orderId</code> (String, required) - Mã đơn hàng cần thanh toán / Order ID to pay</li>
     *   <li><code>bankCode</code> (String, optional) - Mã ngân hàng (VD: NCB, VIETCOMBANK, AGRIBANK).<br>
     *       Nếu null → User chọn ngân hàng tại trang VNPay</li>
     * </ul>
     * 
     * <p><strong>Response Success:</strong>
     * <pre>
     * {
     *   "orderId": "123",
     *   "amount": 2000000,
     *   "bankCode": "NCB",
     *   "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
     * }
     * </pre>
     * 
     * <p><strong>Response Error:</strong>
     * <pre>
     * {
     *   "success": false,
     *   "message": "Order not found with ID: 123"
     * }
     * </pre>
     * 
     * <p><strong>Ví dụ gọi từ Frontend / Frontend Example:</strong>
     * <pre>
     * axios.post('/api/vnpay/create-payment', null, {
     *   params: { orderId: '123', bankCode: 'NCB' }
     * }).then(res => {
     *   window.location.href = res.data.paymentUrl; // Redirect đến VNPay
     * });
     * </pre>
     * 
     * @param orderId Mã đơn hàng (unique) / Order ID (unique)
     * @param bankCode Mã ngân hàng (optional) / Bank code (optional)
     * @param request HttpServletRequest để lấy IP address
     * @return ResponseEntity chứa payment URL hoặc lỗi
     */
    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(
            @RequestParam String orderId,
            @RequestParam(required = false) String bankCode,
            HttpServletRequest request
    ) {
        try {
            // BƯỚC 1: Lấy IP address của client để gửi cho VNPay
            // Get client IP address to send to VNPay
            String ipAddress = vnpayService.getIpAddress(request);
            
            // BƯỚC 2: Gọi service tạo payment URL
            // Call service to create payment URL
            VnpayRes response = vnpayService.createPaymentUrl(orderId, ipAddress, bankCode);
            
            System.out.println("✅ Payment URL created for order: " + orderId);
            
            // BƯỚC 3: Trả về URL cho Frontend
            // Return URL to Frontend
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
     * ========================================================================================
     * 📍 ENDPOINT NHẬN CALLBACK TRỰC TIẾP TỪ VNPAY (CHO TEST KHÔNG FE)
     * 📍 DIRECT CALLBACK ENDPOINT FROM VNPAY (FOR TESTING WITHOUT FRONTEND)
     * ========================================================================================
     * 
     * <p><strong>Endpoint:</strong> GET /api/vnpay/return
     * 
     * <p><strong>Mục đích / Purpose:</strong><br>
     * VNPay sẽ redirect user về URL này sau khi thanh toán xong.<br>
     * VNPay will redirect user to this URL after payment is completed.<br>
     * <strong>⚠️ Chỉ dùng để TEST khi chưa có Frontend!</strong><br>
     * <strong>⚠️ Use this ONLY for TESTING without Frontend!</strong>
     * 
     * <p><strong>Cấu hình / Configuration:</strong>
     * <ul>
     *   <li>✅ <strong>Để test ngay:</strong> Giữ nguyên <code>vnpay.return_url=http://localhost:6969/api/vnpay/return</code></li>
     *   <li>⚠️ <strong>Sau khi có FE:</strong> Đổi thành <code>vnpay.return_url=http://localhost:3000/payment/vnpay-return</code></li>
     * </ul>
     * 
     * <p><strong>VNPay gửi params:</strong>
     * <pre>
     * vnp_TxnRef=123_1642345678000     // orderId_timestamp
     * vnp_Amount=200000000              // Số tiền * 100
     * vnp_ResponseCode=00               // 00 = success
     * vnp_TransactionNo=14537893        // Mã giao dịch VNPay
     * vnp_BankCode=NCB                  // Mã ngân hàng
     * vnp_SecureHash=abc123...          // Chữ ký bảo mật
     * </pre>
     * 
     * <p><strong>Response:</strong>
     * <pre>
     * {
     *   "orderId": "123",
     *   "transactionNo": "14537893",
     *   "bankCode": "NCB",
     *   "amount": 2000000,
     *   "responseCode": "00",
     *   "success": true,
     *   "message": "Giao dịch thành công"
     * }
     * </pre>
     * 
     * @param params Query parameters từ VNPay (Map<String, String>)
     * @return ResponseEntity chứa kết quả thanh toán
     */
    @GetMapping("/return")
    public ResponseEntity<?> handleVnpayReturn(@RequestParam Map<String, String> params) {
        System.out.println("🔔 VNPay return callback received");
        System.out.println("   TxnRef: " + params.get("vnp_TxnRef"));
        System.out.println("   ResponseCode: " + params.get("vnp_ResponseCode"));
        
        // Delegate xử lý cho method chung
        return processPaymentCallback(params);
    }

    /**
     * ========================================================================================
     * 📍 API NHẬN PARAMS TỪ FRONTEND (KHI CÓ FRONTEND)
     * 📍 API RECEIVES PARAMS FROM FRONTEND (WHEN FRONTEND EXISTS)
     * ========================================================================================
     * 
     * <p><strong>Endpoint:</strong> POST /api/vnpay/verify-payment
     * 
     * <p><strong>Mục đích / Purpose:</strong><br>
     * Frontend nhận params từ URL sau khi VNPay redirect, rồi POST params lên API này để Backend xử lý.<br>
     * Frontend receives params from URL after VNPay redirect, then POST params to this API for Backend processing.
     * 
     * <p><strong>Luồng hoạt động / Workflow:</strong>
     * <ol>
     *   <li>VNPay redirect user về: <code>http://localhost:3000/payment/vnpay-return?vnp_TxnRef=...&vnp_Amount=...</code></li>
     *   <li>Frontend parse params từ URL</li>
     *   <li>Frontend gọi POST /api/vnpay/verify-payment với params</li>
     *   <li>Backend verify signature & lưu DB</li>
     *   <li>Backend trả về kết quả cho Frontend hiển thị</li>
     * </ol>
     * 
     * <p><strong>Ví dụ Frontend call / Frontend Example:</strong>
     * <pre>
     * // React/Next.js example
     * const urlParams = new URLSearchParams(window.location.search);
     * const params = Object.fromEntries(urlParams);
     * 
     * axios.post('/api/vnpay/verify-payment', null, { params })
     *   .then(res => {
     *     if (res.data.success) {
     *       showSuccessMessage(res.data.message);
     *     } else {
     *       showErrorMessage(res.data.message);
     *     }
     *   });
     * </pre>
     * 
     * @param params Query parameters từ Frontend forward từ VNPay
     * @return ResponseEntity chứa kết quả thanh toán
     */
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestParam Map<String, String> params) {
        System.out.println("🔔 Verifying payment from frontend");
        System.out.println("   TxnRef: " + params.get("vnp_TxnRef"));
        System.out.println("   ResponseCode: " + params.get("vnp_ResponseCode"));
        
        // Delegate xử lý cho method chung
        return processPaymentCallback(params);
    }

    // ========================================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================================

    /**
     * ========================================================================================
     * 🔧 XỬ LÝ CALLBACK CHUNG (DÙng CHO CẢ 2 ENDPOINT TRÊN)
     * 🔧 COMMON CALLBACK PROCESSING (USED BY BOTH ENDPOINTS ABOVE)
     * ========================================================================================
     * 
     * <p><strong>Mục đích / Purpose:</strong><br>
     * Method này xử lý logic chung cho cả GET /return và POST /verify-payment<br>
     * This method handles common logic for both GET /return and POST /verify-payment
     * 
     * <p><strong>Các bước xử lý / Processing Steps:</strong>
     * <ol>
     *   <li>Verify signature VNPay (bảo mật) / Verify VNPay signature (security)</li>
     *   <li>Lấy thông tin giao dịch từ params / Extract transaction info from params</li>
     *   <li>Tách orderId từ vnpTxnRef (format: orderId_timestamp) / Extract orderId from vnpTxnRef</li>
     *   <li>Lưu Payment vào DB / Save Payment to database</li>
     *   <li>Trả về response cho caller / Return response to caller</li>
     * </ol>
     * 
     * @param params Query parameters từ VNPay (chứa vnp_TxnRef, vnp_Amount, vnp_ResponseCode...)
     * @return ResponseEntity<?>
     *         - Success: {"orderId": "123", "success": true, "message": "Giao dịch thành công", ...}
     *         - Fail: {"success": false, "message": "Invalid signature"}
     */
    private ResponseEntity<?> processPaymentCallback(Map<String, String> params) {
        try {
            // BƯỚC 1: Verify signature từ VNPay (bảo mật)
            // Verify signature from VNPay (security check)
            if (!vnpayService.verifyCallback(params)) {
                System.err.println("❌ Invalid signature");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid signature"
                ));
            }

            // BƯỚC 2: Lấy thông tin giao dịch từ params
            // Extract transaction info from params
            String vnpTxnRef = params.get("vnp_TxnRef");            // orderId_timestamp
            String vnpAmount = params.get("vnp_Amount");            // Số tiền * 100
            String vnpTransactionNo = params.get("vnp_TransactionNo");  // Mã GD VNPay
            String vnpBankCode = params.get("vnp_BankCode");        // Mã ngân hàng
            String vnpResponseCode = params.get("vnp_ResponseCode");    // 00=success

            // Validate required params
            if (vnpTxnRef == null || vnpResponseCode == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing required parameters"
                ));
            }

            // BƯỚC 3: Tách orderId từ vnpTxnRef (format: orderId_timestamp)
            // Extract orderId from vnpTxnRef (format: orderId_timestamp)
            // VD: "123_1642345678000" → orderId = "123"
            String orderId = vnpTxnRef.split("_")[0];

            // BƯỚC 4: Lưu payment vào DB (status = PAID hoặc FAILED)
            // Save payment to database (status = PAID or FAILED)
            vnpayService.savePayment(vnpTxnRef, vnpAmount, vnpTransactionNo, vnpBankCode, vnpResponseCode);

            // BƯỚC 5: Chuẩn bị response
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("transactionNo", vnpTransactionNo != null ? vnpTransactionNo : "");
            response.put("bankCode", vnpBankCode);
            response.put("responseCode", vnpResponseCode);

            // Parse amount (VNPay gửi số tiền * 100, cần chia 100)
            if (vnpAmount != null) {
                try {
                    response.put("amount", Long.parseLong(vnpAmount) / 100);
                } catch (NumberFormatException e) {
                    response.put("amount", 0);
                }
            }

            // BƯỚC 6: Trả về kết quả dựa trên responseCode
            // Return result based on responseCode
            if ("00".equals(vnpResponseCode)) {
                // ✅ Thanh toán thành công
                response.put("success", true);
                response.put("message", "Giao dịch thành công");
                System.out.println("✅ Payment successful: Order " + orderId);
            } else {
                // ❌ Thanh toán thất bại
                response.put("success", false);
                response.put("message", vnpayService.getResponseCodeMessage(vnpResponseCode));
                System.out.println("❌ Payment failed: Order " + orderId + " - Code: " + vnpResponseCode);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error processing payment callback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Internal error: " + e.getMessage()
            ));
        }
    }

    // ============================================
    // 📦 CODE CŨ (đã comment để backup)
    // ============================================
    
    /**
     * [OLD CODE - COMMENTED]
     * Callback từ VNPay (IPN - Instant Payment Notification)
     * GET /api/vnpay/callback
     * 
     * ❌ Code này có vấn đề: Không lưu payment vào DB
     */
    // @GetMapping("/callback")
    // public ResponseEntity<?> vnpayCallback(@RequestParam Map<String, String> params) {
    //     try {
    //         // Verify signature
    //         boolean isValid = vnpayService.verifyCallback(params);
    //
    //         if (!isValid) {
    //             return ResponseEntity.badRequest().body(Map.of(
    //                     "RspCode", "97",
    //                     "Message", "Invalid signature"
    //             ));
    //         }
    //
    //         // Lấy thông tin giao dịch
    //         String vnp_ResponseCode = params.get("vnp_ResponseCode");
    //         String vnp_TxnRef = params.get("vnp_TxnRef"); // orderId
    //         String vnp_Amount = params.get("vnp_Amount");
    //         String vnp_TransactionNo = params.get("vnp_TransactionNo");
    //         String vnp_PayDate = params.get("vnp_PayDate");
    //
    //         // Kiểm tra kết quả thanh toán
    //         if ("00".equals(vnp_ResponseCode)) {
    //             // Thanh toán thành công
    //         } else {
    //             // Thanh toán thất bại
    //             System.out.println("❌ Payment failed: " + vnp_TxnRef + " - Code: " + vnp_ResponseCode);
    //
    //             return ResponseEntity.ok(Map.of(
    //                     "RspCode", vnp_ResponseCode,
    //                     "Message", "Payment failed",
    //                     "orderId", vnp_TxnRef
    //             ));
    //         }
    //
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         return ResponseEntity.badRequest().body(Map.of(
    //                 "RspCode", "99",
    //                 "Message", "Unknown error: " + e.getMessage()
    //         ));
    //     }
    //     return ResponseEntity.ok(Map.of(
    //             "RspCode", "00",
    //             "Message", "Payment successful"
    //     ));
    // }

    /**
     * [OLD CODE - COMMENTED]
     * GET /api/vnpay/return - phiên bản cũ
     * 
     * ❌ Vấn đề:
     * - Duplicate logic lưu DB (đã có trong VnpayService.savePayment)
     * - Không tách orderId từ vnpTxnRef
     * - Sử dụng vnp_TxnRef làm orderId → sai khi có timestamp
     */
    // @GetMapping("/return")
    // public ResponseEntity<?> vnpayReturnOld(@RequestParam Map<String, String> params) {
    //     try {
    //         // 1. Verify signature
    //         boolean isValid = vnpayService.verifyCallback(params);
    //
    //         if (!isValid) {
    //             return ResponseEntity.badRequest().body(Map.of(
    //                     "success", false,
    //                     "message", "Invalid signature"
    //             ));
    //         }
    //
    //         // 2. Lấy thông tin giao dịch
    //         String vnp_ResponseCode = params.get("vnp_ResponseCode");
    //         String vnp_TxnRef = params.get("vnp_TxnRef");
    //         String vnp_Amount = params.get("vnp_Amount");
    //         String vnp_TransactionNo = params.get("vnp_TransactionNo");
    //         String vnp_BankCode = params.get("vnp_BankCode");
    //
    //         vnpayService.savePayment(vnp_TxnRef, vnp_Amount, vnp_TransactionNo, vnp_BankCode, vnp_ResponseCode);
    //         
    //         // 3. Tìm Payment trong DB
    //         Optional<Payment> payment = paymentRepo.findByVnpOrderId(vnp_TxnRef);
    //         if (payment.isEmpty()) {
    //             return ResponseEntity.badRequest().body(Map.of(
    //                     "success", false,
    //                     "message", "Order not found"
    //             ));
    //         }
    //
    //         // 4. ✅ UPDATE DB (duplicate với savePayment)
    //         if ("00".equals(vnp_ResponseCode)) {
    //             // Thanh toán thành công
    //             payment.get().setPaidStatus(PaymentStatus.PAID);
    //             payment.get().setTransactionCode(vnp_TransactionNo);
    //             payment.get().setResponseCode(vnp_ResponseCode);
    //             payment.get().setBankCode(vnp_BankCode);
    //             payment.get().setUpdateAt(new Date());
    //             payment.get().setProviderResponse(params.toString());
    //             paymentRepo.save(payment.get());
    //
    //             System.out.println("✅ Payment successful (return): " + vnp_TxnRef);
    //         } else {
    //             // Thanh toán thất bại
    //             payment.get().setPaidStatus(PaymentStatus.FAILED);
    //             payment.get().setResponseCode(vnp_ResponseCode);
    //             payment.get().setUpdateAt(new Date());
    //             payment.get().setProviderResponse(params.toString());
    //             paymentRepo.save(payment.get());
    //
    //             System.out.println("❌ Payment failed (return): " + vnp_TxnRef + " - Code: " + vnp_ResponseCode);
    //         }
    //
    //         // 5. Trả về response cho frontend
    //         Map<String, Object> response = new HashMap<>();
    //         response.put("orderId", vnp_TxnRef);
    //         response.put("amount", Long.parseLong(vnp_Amount) / 100);
    //         response.put("transactionNo", vnp_TransactionNo);
    //         response.put("bankCode", vnp_BankCode);
    //         response.put("responseCode", vnp_ResponseCode);
    //
    //         if ("00".equals(vnp_ResponseCode)) {
    //             response.put("success", true);
    //             response.put("message", "Payment successful");
    //         } else {
    //             response.put("success", false);
    //             response.put("message", getResponseMessage(vnp_ResponseCode));
    //         }
    //
    //         return ResponseEntity.ok(response);
    //
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         return ResponseEntity.badRequest().body(Map.of(
    //                 "success", false,
    //                 "message", "Error processing return: " + e.getMessage()
    //         ));
    //     }
    // }

    /**
     * [OLD CODE - COMMENTED]
     * Lấy message từ response code
     * 
     * ✅ Đã chuyển sang VnpayService.getResponseCodeMessage()
     */
    // private String getResponseMessage(String responseCode) {
    //     switch (responseCode) {
    //         case "00": return "Giao dịch thành công";
    //         case "07": return "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).";
    //         case "09": return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.";
    //         case "10": return "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
    //         case "11": return "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.";
    //         case "12": return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.";
    //         case "13": return "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.";
    //         case "24": return "Giao dịch không thành công do: Khách hàng hủy giao dịch";
    //         case "51": return "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.";
    //         case "65": return "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.";
    //         case "75": return "Ngân hàng thanh toán đang bảo trì.";
    //         case "79": return "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch";
    //         default: return "Giao dịch thất bại";
    //     }
    // }

}
