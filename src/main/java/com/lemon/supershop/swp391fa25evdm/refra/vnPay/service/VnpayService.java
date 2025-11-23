package com.lemon.supershop.swp391fa25evdm.refra.vnPay.service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.order.repository.OrderRepo;
import com.lemon.supershop.swp391fa25evdm.payment.model.entity.Payment;
import com.lemon.supershop.swp391fa25evdm.payment.model.enums.PaymentStatus;
import com.lemon.supershop.swp391fa25evdm.payment.repository.PaymentRepo;
import com.lemon.supershop.swp391fa25evdm.refra.vnPay.model.dto.Response.VnpayRes;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

/**
 * Service xử lý tích hợp thanh toán VNPay
 *
 * Chức năng chính: - Tạo URL thanh toán VNPay - Xác thực callback từ VNPay -
 * Lưu thông tin thanh toán vào database - Xử lý các response code từ VNPay
 *
 * @author LEMON-164
 * @version 1.0
 * @since 2025-01-29
 */
@Service
public class VnpayService {

    // ============================================
    // DEPENDENCIES & CONFIGURATIONS
    // ============================================
    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private PaymentRepo paymentRepo;

    /**
     * Mã website của merchant (được VNPay cấp) VD: VLOICMA9
     */
    @Value("${vnpay.tmn_code}")
    private String tmnCode;

    /**
     * Secret key để tạo chữ ký điện tử (được VNPay cấp) Dùng để mã hóa và xác
     * thực dữ liệu
     */
    @Value("${vnpay.hash_secret}")
    private String hashSecret;

    /**
     * URL thanh toán của VNPay Sandbox:
     * https://sandbox.vnpayment.vn/paymentv2/vpcpay.html Production:
     * https://vnpayment.vn/paymentv2/vpcpay.html
     */
    @Value("${vnpay.url}")
    private String vnpayUrl;

    /**
     * URL để VNPay redirect sau khi thanh toán - Test (không có FE):
     * http://localhost:6969/api/vnpay/return - Production (có FE):
     * http://localhost:3000/payment/vnpay-return thay đổi trong
     * application.properties
     */
    @Value("${vnpay.return_url}")
    private String returnUrl;

    /**
     * URL API của VNPay để query transaction Dùng cho các API như refund, query
     * payment status
     */
    @Value("${vnpay.api_url:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    private String apiUrl;

    // ============================================
    // MAIN BUSINESS METHODS
    // ============================================
    /**
     * Tạo URL thanh toán VNPay
     *
     * Luồng xử lý: 1. Kiểm tra Order có tồn tại không 2. Tạo mã giao dịch duy
     * nhất (orderId + timestamp) 3. Tạo/Reset Payment record trong DB với
     * status PENDING 4. Build parameters theo spec VNPay 5. Tạo secure hash
     * (HMAC SHA512) 6. Return URL thanh toán hoàn chỉnh
     *
     * @param orderId Mã đơn hàng cần thanh toán
     * @param ipAddress IP address của khách hàng (bắt buộc theo VNPay)
     * @param bankCode Mã ngân hàng (optional: NCB, VIETCOMBANK, AGRIBANK...) -
     * Nếu null: khách chọn ngân hàng tại trang VNPay - Nếu có: redirect thẳng
     * đến ngân hàng đó
     * @return VnpayRes chứa URL thanh toán và thông tin đơn hàng
     * @throws Exception nếu Order không tồn tại hoặc đã được thanh toán
     */
    public VnpayRes createPaymentUrl(String orderId, String ipAddress, String bankCode) throws Exception {
        // BƯỚC 1: Validate Order
        Optional<Order> orderOpt = orderRepo.findById(Integer.valueOf(orderId));
        if (!orderOpt.isPresent()) {
            throw new Exception("Order not found with ID: " + orderId);
        }

        Order order = orderOpt.get();
        long amount = order.getTotal(); // Số tiền thanh toán (VND)
        String orderInfo = order.getDescription(); // Thông tin đơn hàng

        // BƯỚC 2: Tạo mã giao dịch duy nhất
        // Format: orderId_timestamp
        // VD: 1_1735459200000
        // Lý do: VNPay yêu cầu mỗi giao dịch phải có mã duy nhất
        String vnpTxnRef = orderId + "_" + System.currentTimeMillis();

        // BƯỚC 3: Xử lý Payment record trong DB
        Optional<Payment> existingPayment = paymentRepo.findByVnpOrderId(orderId);

        if (existingPayment.isPresent()) {
            Payment payment = existingPayment.get();

            // Kiểm tra trạng thái thanh toán
            if (payment.getPaidStatus() == PaymentStatus.PAID) {
                // Đơn hàng đã thanh toán → Không cho phép thanh toán lại
                throw new Exception("Order has already been paid.");
            } else if (payment.getPaidStatus() == PaymentStatus.PENDING
                    || payment.getPaidStatus() == PaymentStatus.FAILED) {
                // Payment đang PENDING/FAILED → Reset để thử lại
                payment.setPaidStatus(PaymentStatus.PENDING);
                payment.setTransactionCode(null);
                payment.setResponseCode(null);
                payment.setBankCode(null);
                payment.setProviderResponse(null);
                payment.setUpdateAt(new Date());
                paymentRepo.save(payment);

                System.out.println("🔄 Reset existing payment for retry: Order " + orderId);
            }
        } else {
            // Chưa có Payment → Tạo mới với status PENDING
            Payment newPayment = new Payment();
            newPayment.setMethod("VNPay");
            newPayment.setPaidStatus(PaymentStatus.PENDING);
            newPayment.setOrder(order);
            newPayment.setUser(order.getUser());
            newPayment.setVnpOrderId(orderId);
            newPayment.setUpdateAt(new Date());
            paymentRepo.save(newPayment);

            System.out.println("✅ Created new payment for order: " + orderId);
        }

        // BƯỚC 4: Build parameters theo VNPay specification
        Map<String, String> vnpParams = new HashMap<>();

        // Thông tin cơ bản
        vnpParams.put("vnp_Version", "2.1.0");          // Phiên bản API VNPay
        vnpParams.put("vnp_Command", "pay");            // Lệnh thanh toán
        vnpParams.put("vnp_TmnCode", tmnCode);          // Mã website merchant

        // Thông tin giao dịch
        vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay yêu cầu: số tiền * 100
        vnpParams.put("vnp_CurrCode", "VND");                      // Loại tiền tệ
        vnpParams.put("vnp_TxnRef", vnpTxnRef);                    // Mã giao dịch duy nhất
        vnpParams.put("vnp_OrderInfo", orderInfo + " - Order: " + orderId); // Thông tin đơn hàng
        vnpParams.put("vnp_OrderType", "other");                   // Loại đơn hàng

        // Ngân hàng (optional)
        if (bankCode != null && !bankCode.isEmpty()) {
            vnpParams.put("vnp_BankCode", bankCode); // Nếu có: redirect thẳng đến bank
        }

        // Cấu hình return
        vnpParams.put("vnp_Locale", "vn");              // Ngôn ngữ: vn/en
        vnpParams.put("vnp_ReturnUrl", returnUrl);      // URL callback sau khi thanh toán
        vnpParams.put("vnp_IpAddr", ipAddress);         // IP của khách hàng (bắt buộc)

        // BƯỚC 5: Tạo thời gian
        // Timezone: GMT+7 (Việt Nam)
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");

        // Thời gian tạo giao dịch
        String vnpCreateDate = formatter.format(calendar.getTime());
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        // Thời gian hết hạn (15 phút sau)
        calendar.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(calendar.getTime());
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        // BƯỚC 6: Build query string và hash
        String queryUrl = buildQueryString(vnpParams);
        String secureHash = hmacSHA512(hashSecret, buildHashData(vnpParams));

        // Thêm secure hash vào query string
        queryUrl += "&vnp_SecureHash=" + secureHash;

        // BƯỚC 7: Tạo URL thanh toán hoàn chỉnh
        String paymentUrl = vnpayUrl + "?" + queryUrl;

        System.out.println("🔗 Payment URL created for order: " + orderId);
        System.out.println("📝 TxnRef: " + vnpTxnRef);

        return new VnpayRes(orderId, amount, bankCode, paymentUrl);
    }

    /**
     * Xác thực và xử lý callback từ VNPay
     *
     * Method này xử lý khi VNPay redirect về sau khi khách thanh toán
     *
     * Luồng xử lý: 1. Lấy tất cả parameters từ request 2. Verify signature để
     * đảm bảo data không bị giả mạo 3. Tách orderId từ vnpTxnRef 4. Lưu thông
     * tin thanh toán vào DB 5. Trả về kết quả
     *
     * @param request HttpServletRequest chứa callback params từ VNPay
     * @return Map chứa status và message
     */
    @Transactional
    public Map<String, String> handleCallback(HttpServletRequest request) {
        Map<String, String> result = new HashMap<>();

        try {
            // BƯỚC 1: Extract tất cả parameters từ request
            Map<String, String> params = new HashMap<>();
            for (String key : request.getParameterMap().keySet()) {
                params.put(key, request.getParameter(key));
            }

            System.out.println("📨 Received callback from VNPay:");
            System.out.println("   TxnRef: " + params.get("vnp_TxnRef"));
            System.out.println("   ResponseCode: " + params.get("vnp_ResponseCode"));
            System.out.println("   TransactionNo: " + params.get("vnp_TransactionNo"));

            // BƯỚC 2: Verify signature để đảm bảo data integrity
            if (!verifyCallback(params)) {
                result.put("status", "error");
                result.put("message", "Invalid signature");
                System.err.println("❌ Invalid signature from VNPay");
                return result;
            }

            // BƯỚC 3: Lấy thông tin từ callback
            String vnpTxnRef = params.get("vnp_TxnRef");           // Mã giao dịch
            String vnpAmount = params.get("vnp_Amount");            // Số tiền (x100)
            String vnpTransactionNo = params.get("vnp_TransactionNo"); // Mã GD VNPay
            String vnpBankCode = params.get("vnp_BankCode");        // Mã ngân hàng
            String vnpResponseCode = params.get("vnp_ResponseCode"); // Mã kết quả

            // BƯỚC 4: Tách orderId từ vnpTxnRef (format: orderId_timestamp)
            String orderId = vnpTxnRef.split("_")[0];

            // BƯỚC 5: Cập nhật Payment trong database
            savePayment(vnpTxnRef, vnpAmount, vnpTransactionNo, vnpBankCode, vnpResponseCode);

            // BƯỚC 6: Build response
            if ("00".equals(vnpResponseCode)) {
                // Thanh toán thành công
                result.put("status", "success");
                result.put("message", "Payment successful");
                result.put("orderId", orderId);
                result.put("transactionNo", vnpTransactionNo);
            } else {
                // Thanh toán thất bại
                result.put("status", "failed");
                result.put("message", "Payment failed: " + getResponseCodeMessage(vnpResponseCode));
                result.put("orderId", orderId);
                result.put("responseCode", vnpResponseCode);
            }

        } catch (Exception e) {
            System.err.println("❌ Error processing callback: " + e.getMessage());
            e.printStackTrace();
            result.put("status", "error");
            result.put("message", "Internal error: " + e.getMessage());
        }

        return result;
    }

    /**
     * Xác thực chữ ký điện tử từ VNPay
     *
     * VNPay sử dụng HMAC SHA512 để tạo chữ ký Cần so sánh chữ ký nhận được với
     * chữ ký tính toán
     *
     * Lưu ý: - Phải remove vnp_SecureHash và vnp_SecureHashType trước khi
     * verify - Params phải được sort theo alphabet - Sử dụng cùng hash secret
     * với lúc tạo payment
     *
     * @param params Parameters từ VNPay callback
     * @return true nếu signature hợp lệ, false nếu không hợp lệ
     */
    public boolean verifyCallback(Map<String, String> params) {
        // BƯỚC 1: Lấy secure hash từ VNPay
        String vnpSecureHash = params.get("vnp_SecureHash");

        // BƯỚC 2: Tạo bản copy và remove các field không cần verify
        Map<String, String> verifyParams = new HashMap<>(params);
        verifyParams.remove("vnp_SecureHash");
        verifyParams.remove("vnp_SecureHashType");

        // BƯỚC 3: Tính hash từ params nhận được
        String calculatedHash = hmacSHA512(hashSecret, buildHashData(verifyParams));

        // BƯỚC 4: So sánh hash
        boolean isValid = calculatedHash.equals(vnpSecureHash);
        System.out.println("🔐 Signature verification: " + (isValid ? "VALID ✅" : "INVALID ❌"));

        return isValid;
    }

    /**
     * Lưu thông tin thanh toán vào database
     *
     * Method này cập nhật Payment record với thông tin từ VNPay: - Nếu thanh
     * toán thành công (code 00): status = PAID - Nếu thất bại: status = FAILED
     *
     * @param vnpTxnRef Mã giao dịch (format: orderId_timestamp)
     * @param vnpAmount Số tiền (đã nhân 100)
     * @param vnpTransactionNo Mã giao dịch VNPay
     * @param vnpBankCode Mã ngân hàng
     * @param vnpResponseCode Mã kết quả từ VNPay
     */
    @Transactional
    public void savePayment(String vnpTxnRef, String vnpAmount, String vnpTransactionNo,
            String vnpBankCode, String vnpResponseCode) {
        // BƯỚC 1: Tách orderId từ vnpTxnRef (format: orderId_timestamp)
        String orderId = vnpTxnRef.split("_")[0];

        // BƯỚC 2: Tìm Payment trong database
        Optional<Payment> paymentOpt = paymentRepo.findByVnpOrderId(orderId);

        if (!paymentOpt.isPresent()) {
            System.err.println("❌ Payment not found for order: " + orderId);
            return;
        }

        Payment payment = paymentOpt.get();

        // BƯỚC 3: Tạo chuỗi provider response để lưu trữ
        String providerResponse = String.format(
                "TxnRef=%s, Amount=%s, TransactionNo=%s, BankCode=%s, ResponseCode=%s",
                vnpTxnRef, vnpAmount, vnpTransactionNo, vnpBankCode, vnpResponseCode
        );

        // BƯỚC 4: Cập nhật Payment based on response code
        if ("00".equals(vnpResponseCode)) {
            // ✅ Thanh toán thành công
            payment.setPaidStatus(PaymentStatus.PAID);
            payment.setTransactionCode(vnpTransactionNo);
            payment.setResponseCode(vnpResponseCode);
            payment.setBankCode(vnpBankCode);
            payment.setUpdateAt(new Date());
            payment.setProviderResponse(providerResponse);

            System.out.println("✅ Payment successful: Order " + orderId + " (TxnRef: " + vnpTxnRef + ")");

            // 🔄 Cập nhật Order status sang "Paid"
            Order order = payment.getOrder();
            if (order != null) {
                order.setStatus("Paid");
                orderRepo.save(order);
                System.out.println("✅ Order status updated to 'Paid': Order " + orderId);
            }

            System.out.println("✅ Payment successful: Order " + orderId + " (TxnRef: " + vnpTxnRef + ")");
        } else {
            // ❌ Thanh toán thất bại
            payment.setPaidStatus(PaymentStatus.FAILED);
            payment.setResponseCode(vnpResponseCode);
            payment.setUpdateAt(new Date());
            payment.setProviderResponse(providerResponse);

            System.out.println("❌ Payment failed: Order " + orderId + " - Code: " + vnpResponseCode);

            // 🔄 Cập nhật Order status sang "Failed"
            Order order = payment.getOrder();
            if (order != null) {
                order.setStatus("Failed");
                orderRepo.save(order);
                System.out.println("🔄 Order status updated to 'Failed': Order " + orderId);
            }
        }

        // BƯỚC 5: Lưu vào database
        paymentRepo.save(payment);
        System.out.println("💾 Payment saved to database");
    }

    // ============================================
    // HELPER METHODS - SECURITY & ENCODING
    // ============================================
    /**
     * Build hash data string từ parameters
     *
     * VNPay yêu cầu: - Sort parameters theo alphabet - Format:
     * field1=value1&field2=value2&... - URL encode values theo US_ASCII - Bỏ
     * qua các field null hoặc empty
     *
     * @param params Map chứa parameters
     * @return String hash data theo spec VNPay
     */
    private String buildHashData(Map<String, String> params) {
        // BƯỚC 1: Sort parameters theo alphabet
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        // BƯỚC 2: Build hash string
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);

            // Chỉ thêm field không null và không empty
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    // URL encode theo US_ASCII (yêu cầu VNPay)
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    throw new RuntimeException("Error encoding field: " + fieldName, e);
                }

                // Thêm & nếu chưa phải field cuối
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        return hashData.toString();
    }

    /**
     * Build query string từ parameters
     *
     * Tương tự buildHashData nhưng encode cả field name Dùng để tạo URL query
     * string
     *
     * @param params Map chứa parameters
     * @return String query theo format URL
     */
    private String buildQueryString(Map<String, String> params) {
        // BƯỚC 1: Sort parameters
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        // BƯỚC 2: Build query string
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);

            if (fieldValue != null && !fieldValue.isEmpty()) {
                try {
                    // Encode cả field name và value
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    throw new RuntimeException("Error encoding field: " + fieldName, e);
                }

                if (itr.hasNext()) {
                    query.append('&');
                }
            }
        }

        return query.toString();
    }

    /**
     * Tính HMAC SHA512 hash
     *
     * Thuật toán mã hóa được VNPay sử dụng - Input: Secret key + Data string -
     * Output: Hash string dạng hex (lowercase)
     *
     * @param key Secret key (hash_secret từ VNPay)
     * @param data Data string cần hash
     * @return Hash string dạng hex
     * @throws RuntimeException nếu có lỗi trong quá trình hash
     */
    private String hmacSHA512(String key, String data) {
        try {
            // BƯỚC 1: Khởi tạo Mac instance với thuật toán HmacSHA512
            Mac hmac512 = Mac.getInstance("HmacSHA512");

            // BƯỚC 2: Tạo secret key
            SecretKeySpec secretKey = new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA512"
            );

            // BƯỚC 3: Init Mac với secret key
            hmac512.init(secretKey);

            // BƯỚC 4: Tính hash
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            // BƯỚC 5: Convert byte array sang hex string
            StringBuilder sb = new StringBuilder();
            for (byte b : result) {
                sb.append(String.format("%02x", b)); // Format hex lowercase
            }

            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC SHA512", e);
        }
    }

    // ============================================
    // UTILITY METHODS
    // ============================================
    /**
     * Lấy IP address từ HTTP request
     *
     * Ưu tiên lấy từ X-FORWARDED-FOR header (nếu qua proxy/load balancer)
     * Fallback về getRemoteAddr() nếu không có header
     *
     * @param request HTTP request
     * @return IP address của client
     */
    public String getIpAddress(HttpServletRequest request) {
        // Kiểm tra X-FORWARDED-FOR header (nếu qua proxy)
        String ipAddress = request.getHeader("X-FORWARDED-FOR");

        // Nếu không có, lấy từ remote address
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }

        return ipAddress;
    }

    /**
     * Mapping VNPay response code sang message tiếng Việt
     *
     * Các response code phổ biến: - 00: Thành công - 07: Trừ tiền thành công
     * nhưng giao dịch nghi ngờ - 09: Chưa đăng ký Internet Banking - 10: Xác
     * thực sai quá 3 lần - 11: Hết hạn thanh toán - 12: Thẻ bị khóa - 13: Sai
     * OTP - 24: Khách hàng hủy giao dịch - 51: Tài khoản không đủ số dư - 65:
     * Vượt quá hạn mức giao dịch - 75: Ngân hàng bảo trì - 79: Nhập sai mật
     * khẩu quá số lần
     *
     * @param responseCode Mã response từ VNPay
     * @return Message tiếng Việt tương ứng
     */
    public String getResponseCodeMessage(String responseCode) {
        Map<String, String> messages = new HashMap<>();

        // Success
        messages.put("00", "Giao dịch thành công");
        messages.put("07", "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).");

        // Customer errors
        messages.put("09", "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.");
        messages.put("10", "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần");
        messages.put("11", "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.");
        messages.put("12", "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.");
        messages.put("13", "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).");
        messages.put("24", "Giao dịch không thành công do: Khách hàng hủy giao dịch");
        messages.put("51", "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.");
        messages.put("65", "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.");
        messages.put("79", "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.");

        // System errors
        messages.put("75", "Ngân hàng thanh toán đang bảo trì.");
        messages.put("99", "Các lỗi khác");

        return messages.getOrDefault(responseCode, "Unknown error code: " + responseCode);
    }
}
