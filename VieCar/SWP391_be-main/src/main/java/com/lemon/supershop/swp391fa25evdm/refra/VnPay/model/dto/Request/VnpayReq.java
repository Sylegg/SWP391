package com.lemon.supershop.swp391fa25evdm.refra.VnPay.model.dto.Request;

/**
 * ========================================================================================
 * VNPay Payment Request DTO
 * ========================================================================================
 * 
 * Data Transfer Object cho request tạo thanh toán VNPay
 * Data Transfer Object for creating VNPay payment request
 * 
 * <p><strong>Mục đích / Purpose:</strong><br>
 * DTO này chứa thông tin cần thiết để khởi tạo một giao dịch thanh toán VNPay<br>
 * This DTO contains necessary information to initiate a VNPay payment transaction
 * 
 * <p><strong>Các trường / Fields:</strong>
 * <ul>
 *   <li><code>amount</code> (Long) - Số tiền thanh toán (VNĐ) / Payment amount (VND)</li>
 *   <li><code>orderInfo</code> (String) - Thông tin mô tả đơn hàng / Order description</li>
 *   <li><code>orderId</code> (String) - Mã đơn hàng (unique) / Order ID (unique)</li>
 *   <li><code>subscriptionId</code> (Long) - ID gói subscription nếu có / Subscription package ID if applicable</li>
 * </ul>
 * 
 * <p><strong>Ví dụ sử dụng / Usage Example:</strong>
 * <pre>
 * VnpayReq request = new VnpayReq();
 * request.setOrderId("123");
 * request.setAmount(2000000L);  // 2,000,000 VNĐ
 * request.setOrderInfo("Thanh toán đơn hàng #123");
 * </pre>
 * 
 * @author Lemon SuperShop Team
 * @version 1.0
 * @since 2025-01-15
 * @see com.lemon.supershop.swp391fa25evdm.refra.VnPay.service.VnpayService
 * @see com.lemon.supershop.swp391fa25evdm.refra.VnPay.controller.VnpayController
 */
public class VnpayReq {
    
    // ========================================================================================
    // FIELDS / CÁC TRƯỜNG DỮ LIỆU
    // ========================================================================================
    
    /**
     * Số tiền thanh toán (VNĐ)
     * Payment amount in Vietnamese Dong (VND)
     * 
     * <p>VD / Example: 2000000 = 2,000,000 VNĐ
     */
    private Long amount;
    
    /**
     * Thông tin mô tả đơn hàng
     * Order description/information
     * 
     * <p>VD / Example: "Thanh toán đơn hàng #123 - 2 sản phẩm"
     */
    private String orderInfo;
    
    /**
     * Mã đơn hàng (unique)
     * Order ID (must be unique)
     * 
     * <p>VD / Example: "123", "ORD-2025-001"
     * <p><strong>⚠️ Lưu ý:</strong> orderId phải là unique để tránh duplicate transaction
     */
    private String orderId;
    
    /**
     * ID gói subscription (nếu thanh toán cho subscription)
     * Subscription package ID (if payment is for subscription)
     * 
     * <p>Optional field - chỉ dùng khi thanh toán cho gói subscription
     */
    private Long subscriptionId;

    // ========================================================================================
    // CONSTRUCTORS
    // ========================================================================================
    
    /**
     * Constructor mặc định
     * Default constructor
     */
    public VnpayReq() {
    }

    // ========================================================================================
    // GETTERS & SETTERS
    // ========================================================================================

    /**
     * Lấy số tiền thanh toán
     * Get payment amount
     * 
     * @return amount - Số tiền (VNĐ) / Payment amount (VND)
     */
    public Long getAmount() {
        return amount;
    }

    /**
     * Set số tiền thanh toán
     * Set payment amount
     * 
     * @param amount - Số tiền (VNĐ) / Payment amount (VND)
     */
    public void setAmount(Long amount) {
        this.amount = amount;
    }

    /**
     * Lấy thông tin đơn hàng
     * Get order information
     * 
     * @return orderInfo - Mô tả đơn hàng / Order description
     */
    public String getOrderInfo() {
        return orderInfo;
    }

    /**
     * Set thông tin đơn hàng
     * Set order information
     * 
     * @param orderInfo - Mô tả đơn hàng / Order description
     */
    public void setOrderInfo(String orderInfo) {
        this.orderInfo = orderInfo;
    }

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
     * @param orderId - Mã đơn hàng (unique) / Order ID (unique)
     */
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    /**
     * Lấy ID gói subscription
     * Get subscription package ID
     * 
     * @return subscriptionId - ID subscription / Subscription ID
     */
    public Long getSubscriptionId() {
        return subscriptionId;
    }

    /**
     * Set ID gói subscription
     * Set subscription package ID
     * 
     * @param subscriptionId - ID subscription / Subscription ID
     */
    public void setSubscriptionId(Long subscriptionId) {
        this.subscriptionId = subscriptionId;
    }
}
