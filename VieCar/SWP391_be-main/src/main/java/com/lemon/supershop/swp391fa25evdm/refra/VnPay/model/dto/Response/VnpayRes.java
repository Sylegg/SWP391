package com.lemon.supershop.swp391fa25evdm.refra.VnPay.model.dto.Response;

import java.io.Serializable;

/**
 * ========================================================================================
 * VNPay Payment Response DTO
 * ========================================================================================
 * 
 * Data Transfer Object cho response trả về sau khi tạo URL thanh toán VNPay
 * Data Transfer Object for response after creating VNPay payment URL
 * 
 * <p><strong>Mục đích / Purpose:</strong><br>
 * DTO này chứa thông tin response khi tạo URL thanh toán VNPay thành công<br>
 * This DTO contains response information when VNPay payment URL is created successfully
 * 
 * <p><strong>Các trường / Fields:</strong>
 * <ul>
 *   <li><code>orderId</code> (String) - Mã đơn hàng / Order ID</li>
 *   <li><code>amount</code> (long) - Số tiền thanh toán (VNĐ) / Payment amount (VND)</li>
 *   <li><code>bank</code> (String) - Mã ngân hàng / Bank code</li>
 *   <li><code>url</code> (String) - URL thanh toán VNPay / VNPay payment URL</li>
 * </ul>
 * 
 * <p><strong>Response JSON Example:</strong>
 * <pre>
 * {
 *   "orderId": "123",
 *   "amount": 2000000,
 *   "bank": "NCB",
 *   "url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=..."
 * }
 * </pre>
 * 
 * <p><strong>Frontend Usage:</strong>
 * <pre>
 * axios.post('/api/vnpay/create-payment', null, { params: { orderId: '123' }})
 *   .then(response => {
 *     const paymentUrl = response.data.url;
 *     window.location.href = paymentUrl;  // Redirect user to VNPay
 *   });
 * </pre>
 * 
 * @author Lemon SuperShop Team
 * @version 1.0
 * @since 2025-01-15
 * @see com.lemon.supershop.swp391fa25evdm.refra.VnPay.service.VnpayService
 * @see com.lemon.supershop.swp391fa25evdm.refra.VnPay.controller.VnpayController
 */
public class VnpayRes implements Serializable {
    
    // ========================================================================================
    // FIELDS / CÁC TRƯỜNG DỮ LIỆU
    // ========================================================================================
    
    /**
     * Mã đơn hàng
     * Order ID
     * 
     * <p>VD / Example: "123", "ORD-2025-001"
     */
    private String orderId;
    
    /**
     * Số tiền thanh toán (VNĐ)
     * Payment amount in Vietnamese Dong (VND)
     * 
     * <p>VD / Example: 2000000 = 2,000,000 VNĐ
     */
    private long amount;
    
    /**
     * Mã ngân hàng
     * Bank code
     * 
     * <p>VD / Example: "NCB", "VIETCOMBANK", "AGRIBANK"
     * <p>Nếu null → User chọn ngân hàng tại trang VNPay
     */
    private String bank;
    
    /**
     * URL thanh toán VNPay (để redirect user)
     * VNPay payment URL (to redirect user)
     * 
     * <p>VD / Example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=200000000&..."
     */
    private String url;

    // ========================================================================================
    // CONSTRUCTORS
    // ========================================================================================
    
    /**
     * Constructor đầy đủ
     * Full constructor
     * 
     * @param orderId Mã đơn hàng / Order ID
     * @param amount Số tiền (VNĐ) / Payment amount (VND)
     * @param bank Mã ngân hàng / Bank code
     * @param url URL thanh toán VNPay / VNPay payment URL
     */
    public VnpayRes(String orderId, long amount, String bank, String url) {
        this.orderId = orderId;
        this.amount = amount;
        this.bank = bank;
        this.url = url;
    }

    // ========================================================================================
    // GETTERS & SETTERS
    // ========================================================================================

    /**
     * Lấy mã đơn hàng
     * Get order ID
     * 
     * @return orderId - Mã đơn hàng / Order ID
     */
    public String getOrderId() {
        return orderId;
    }

    /**
     * Set mã đơn hàng
     * Set order ID
     * 
     * @param orderId - Mã đơn hàng / Order ID
     */
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    /**
     * Lấy số tiền thanh toán
     * Get payment amount
     * 
     * @return amount - Số tiền (VNĐ) / Payment amount (VND)
     */
    public long getAmount() {
        return amount;
    }

    /**
     * Set số tiền thanh toán
     * Set payment amount
     * 
     * @param amount - Số tiền (VNĐ) / Payment amount (VND)
     */
    public void setAmount(long amount) {
        this.amount = amount;
    }

    /**
     * Lấy mã ngân hàng
     * Get bank code
     * 
     * @return bank - Mã ngân hàng / Bank code
     */
    public String getBank() {
        return bank;
    }

    /**
     * Set mã ngân hàng
     * Set bank code
     * 
     * @param bank - Mã ngân hàng / Bank code
     */
    public void setBank(String bank) {
        this.bank = bank;
    }

    /**
     * Lấy URL thanh toán VNPay
     * Get VNPay payment URL
     * 
     * @return url - URL thanh toán / Payment URL
     */
    public String getUrl() {
        return url;
    }

    /**
     * Set URL thanh toán VNPay
     * Set VNPay payment URL
     * 
     * @param url - URL thanh toán / Payment URL
     */
    public void setUrl(String url) {
        this.url = url;
    }
}
