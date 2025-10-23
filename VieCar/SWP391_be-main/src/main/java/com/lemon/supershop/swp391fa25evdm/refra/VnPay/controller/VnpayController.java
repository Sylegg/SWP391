package com.lemon.supershop.swp391fa25evdm.refra.VnPay.controller;

import com.lemon.supershop.swp391fa25evdm.refra.VnPay.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("api/vnpay")
@CrossOrigin("*")
public class VnpayController {

    @Autowired
    private VnpayService vnpayService;

    /**
     * Tạo URL thanh toán VNPay
     * POST /api/vnpay/create-payment
     *
     * @param amount Số tiền (VNĐ) - sẽ tự động nhân 100 khi gửi VNPay
     * @param orderInfo Thông tin đơn hàng
     * @param orderId Mã đơn hàng (unique)
     * @param bankCode (Optional) Mã ngân hàng - nếu null, khách chọn tại VNPay
     *                 VD: NCB, VIETCOMBANK, VIETINBANK, AGRIBANK, etc.
     */
    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(
            @RequestParam long amount,
            @RequestParam String orderInfo,
            @RequestParam String orderId,
            @RequestParam(required = false) String bankCode,
            HttpServletRequest request
    ) {
        try {
            String ipAddress = vnpayService.getIpAddress(request);
            String paymentUrl = vnpayService.createPaymentUrl(orderId, amount, orderInfo, ipAddress, bankCode);

            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            response.put("orderId", orderId);
            response.put("amount", String.valueOf(amount));
            if (bankCode != null) {
                response.put("bankCode", bankCode);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to create payment URL",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Callback từ VNPay (IPN - Instant Payment Notification)
     * GET /api/vnpay/callback
     */
    @GetMapping("/callback")
    public ResponseEntity<?> vnpayCallback(@RequestParam Map<String, String> params) {
        try {
            // Verify signature
            boolean isValid = vnpayService.verifyCallback(params);

            if (!isValid) {
                return ResponseEntity.badRequest().body(Map.of(
                        "RspCode", "97",
                        "Message", "Invalid signature"
                ));
            }

            // Lấy thông tin giao dịch
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TxnRef = params.get("vnp_TxnRef"); // orderId
            String vnp_Amount = params.get("vnp_Amount");
            String vnp_TransactionNo = params.get("vnp_TransactionNo");
            String vnp_PayDate = params.get("vnp_PayDate");

            // Kiểm tra kết quả thanh toán
            if ("00".equals(vnp_ResponseCode)) {
                // Thanh toán thành công
                // TODO: Cập nhật trạng thái đơn hàng trong database
                System.out.println("✅ Payment successful: " + vnp_TxnRef);

                return ResponseEntity.ok(Map.of(
                        "RspCode", "00",
                        "Message", "Success",
                        "orderId", vnp_TxnRef,
                        "amount", vnp_Amount,
                        "transactionNo", vnp_TransactionNo,
                        "payDate", vnp_PayDate
                ));
            } else {
                // Thanh toán thất bại
                System.out.println("❌ Payment failed: " + vnp_TxnRef + " - Code: " + vnp_ResponseCode);

                return ResponseEntity.ok(Map.of(
                        "RspCode", vnp_ResponseCode,
                        "Message", "Payment failed",
                        "orderId", vnp_TxnRef
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "RspCode", "99",
                    "Message", "Unknown error: " + e.getMessage()
            ));
        }
    }

    /**
     * Return URL - Trang người dùng quay về sau khi thanh toán
     * GET /api/vnpay/return
     */
    @GetMapping("/return")
    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> params) {
        try {
            // Verify signature
            boolean isValid = vnpayService.verifyCallback(params);

            if (!isValid) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid signature"
                ));
            }

            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TxnRef = params.get("vnp_TxnRef");
            String vnp_Amount = params.get("vnp_Amount");
            String vnp_TransactionNo = params.get("vnp_TransactionNo");
            String vnp_BankCode = params.get("vnp_BankCode");

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", vnp_TxnRef);
            response.put("amount", Long.parseLong(vnp_Amount) / 100); // Chia 100 vì VNPay nhân 100
            response.put("transactionNo", vnp_TransactionNo);
            response.put("bankCode", vnp_BankCode);
            response.put("responseCode", vnp_ResponseCode);

            if ("00".equals(vnp_ResponseCode)) {
                response.put("success", true);
                response.put("message", "Payment successful");
            } else {
                response.put("success", false);
                response.put("message", getResponseMessage(vnp_ResponseCode));
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error processing return: " + e.getMessage()
            ));
        }
    }

    /**
     * Lấy message từ response code
     */
    private String getResponseMessage(String responseCode) {
        switch (responseCode) {
            case "00": return "Transaction successful.";
            case "07": return "Amount deducted successfully. The transaction is suspected (related to fraud or unusual activity).";
            case "09": return "Transaction failed: The card/account has not been registered for Internet Banking service.";
            case "10": return "Transaction failed: Incorrect card/account authentication information entered more than 3 times.";
            case "11": return "Transaction failed: Payment timeout expired. Please try again.";
            case "12": return "Transaction failed: The card/account has been locked.";
            case "13": return "Transaction failed: Incorrect OTP entered. Please try again.";
            case "24": return "Transaction failed: The customer canceled the transaction.";
            case "51": return "Transaction failed: Insufficient account balance.";
            case "65": return "Transaction failed: The daily transaction limit has been exceeded.";
            case "75": return "Transaction failed: The payment bank is under maintenance.";
            case "79": return "Transaction failed: Incorrect payment password entered too many times. Please try again.";
            default: return "Transaction failed.";
        }
    }
}
