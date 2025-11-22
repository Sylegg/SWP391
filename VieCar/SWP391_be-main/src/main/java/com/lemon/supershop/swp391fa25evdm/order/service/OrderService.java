package com.lemon.supershop.swp391fa25evdm.order.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;
import com.lemon.supershop.swp391fa25evdm.contract.repository.ContractRepo;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.order.model.dto.request.DeliveryReq;
import com.lemon.supershop.swp391fa25evdm.order.model.dto.request.OrderReq;
import com.lemon.supershop.swp391fa25evdm.order.model.dto.request.UpdateOrderReq;
import com.lemon.supershop.swp391fa25evdm.order.model.dto.response.OrderRes;
import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.order.repository.OrderRepo;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.product.model.enums.ProductStatus;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
import com.lemon.supershop.swp391fa25evdm.promotion.model.entity.Promotion;
import com.lemon.supershop.swp391fa25evdm.promotion.repository.PromotionRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;
import com.lemon.supershop.swp391fa25evdm.email.service.EmailService;

@Service
public class OrderService {

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private DealerRepo dealerRepo;

    @Autowired
    private ContractRepo contractRepo;

    @Autowired
    private PromotionRepo promotionRepo;

    @Autowired
    private EmailService emailService;

    public List<OrderRes> ListOrderbyUserId(int userId) {
        User user = userRepo.findById(userId).get();
        if (user != null){
            return orderRepo.findByUserId(user.getId()).stream().map(order -> {
                return convertOrderToOrderRes(order);
            }).collect(Collectors.toList());
        }else {
            return null;
        }
    }

    public List<OrderRes> ListOrderbyDealerId(int dealerId) {
        Optional<Dealer> dealer = dealerRepo.findById(dealerId);
        if (dealer.isPresent()){
            return orderRepo.findByDealerId(dealerId).stream().map(order -> {
                return convertOrderToOrderRes(order);
            }).collect(Collectors.toList());
        }else {
            return new ArrayList<>();
        }
    }

    public OrderRes getOrderById(int orderId) {
        Optional<Order> order = orderRepo.findById(orderId);
        if (order.isPresent()){
            return convertOrderToOrderRes(order.get());
        }
        return null;
    }

    public List<OrderRes> ListAllOrders() {
            return orderRepo.findAll().stream().map(order -> {
                return convertOrderToOrderRes(order);
            }).collect(Collectors.toList());
    }

    public OrderRes createOrder(int userId, OrderReq dto) {
        Optional<User> user = userRepo.findById(userId);
        if (user.isPresent()){
            Order order = new Order();
            order.setUser(user.get());
            
            // Set default status
            order.setStatus("Chờ xử lý");
            
            if (dto.getProductId() > 0 ){
                Optional<Product> product  = productRepo.findById(dto.getProductId());
                if (product.isPresent()){
                    order.setProduct(product.orElse(null));
                    order.setTotal(product.get().getDealerPrice());
                }
            }
            if (dto.getContractId() > 0){
                Optional<Contract> contract  = contractRepo.findById(dto.getContractId());
                if (contract.isPresent()){
                    List<Contract> contracts = new ArrayList<>();
                    contracts.add(contract.get());
                    order.setContract(contracts);
                }
            }
            if (dto.getDealerId() > 0){
                Optional<Dealer> dealer = dealerRepo.findById(dto.getDealerId());
                if (dealer.isPresent()){
                    order.setDealer(dealer.orElse(null));
                    List<Promotion> promotions = promotionRepo.findByDealer_Id(dealer.get().getId());
                    if (promotions != null){
                        order.setPromotions(promotions);
                    }
                }
            }
            orderRepo.save(order);
            return convertOrderToOrderRes(order);
        }
        return null;
    }
    public OrderRes createDelivery(int orderId, DeliveryReq dto) {
        Optional<Order> order = orderRepo.findById(orderId);
        if (order.isPresent()){
            if (dto.getShip_address() != null){
                order.get().setShipAddress(dto.getShip_address());
            }
            if (dto.getShip_date() != null){
                order.get().getShipAt(dto.getShip_date());
            }
            if (dto.getShip_status() != null){
                order.get().setShipStatus(dto.getShip_status());
            } else {
                order.get().setShipStatus("Chờ giao hàng");
            }
            orderRepo.save(order.get());
            return convertOrderToOrderRes(order.get());
        }
        return null;
    }

    public OrderRes updateOrder(int orderId, UpdateOrderReq dto) {
        Optional<Order> order = orderRepo.findById(orderId);
        if (order.isPresent()){
            String oldStatus = order.get().getStatus();
            
            // Prevent updating orders that have been delivered (completed)
            if ("Đã giao".equals(oldStatus)) {
                throw new IllegalStateException("Không thể chỉnh sửa đơn hàng đã giao. Đơn hàng này đã hoàn tất.");
            }
            
            // Update status if provided
            if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
                order.get().setStatus(dto.getStatus());
                
                // Update product status in showroom when deposit is confirmed
                if (("Đã đặt cọc".equals(dto.getStatus()) || "Đã yêu cầu đại lý".equals(dto.getStatus())) 
                    && !dto.getStatus().equals(oldStatus)) {
                    try {
                        Product product = order.get().getProduct();
                        if (product != null) {
                            product.setStatus(ProductStatus.RESERVED); // Đánh dấu xe đã được đặt cọc
                            productRepo.save(product);
                            System.out.println("Updated product status to RESERVED for product ID: " + product.getId());
                        }
                    } catch (Exception e) {
                        System.err.println("Failed to update product status: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
                
                // Update product status to SOLDOUT when vehicle is delivered
                if ("Đã giao".equals(dto.getStatus()) && !dto.getStatus().equals(oldStatus)) {
                    try {
                        Product product = order.get().getProduct();
                        User customer = order.get().getUser();
                        if (product != null) {
                            product.setStatus(ProductStatus.SOLDOUT); // Đánh dấu xe đã bán
                            productRepo.save(product);
                            System.out.println("Updated product status to SOLDOUT for product ID: " + product.getId());
                            
                            // Send congratulations email to customer
                            if (customer != null && customer.getEmail() != null) {
                                try {
                                    String customerName = customer.getUsername();
                                    String customerEmail = customer.getEmail();
                                    String productName = product.getName() != null ? product.getName() : "N/A";
                                    String vinNum = product.getVinNum() != null ? product.getVinNum() : "N/A";
                                    String color = product.getColor() != null ? product.getColor() : "N/A";
                                    double totalPrice = order.get().getTotal();
                                    String formattedPrice = String.format("%,.0f", totalPrice);
                                    
                                    String subject = "🎉 Chúc mừng bạn đã mua xe thành công - VinFast";
                                    String body = String.format(
                                        "Kính gửi quý khách %s,\n\n" +
                                        "Chúc mừng bạn đã hoàn tất thủ tục mua xe tại VinFast!\n\n" +
                                        "📋 THÔNG TIN XE:\n" +
                                        "- Mẫu xe: %s\n" +
                                        "- Màu sắc: %s\n" +
                                        "- Số khung (VIN): %s\n" +
                                        "- Tổng giá trị: %s VNĐ\n\n" +
                                        "✅ XÁC NHẬN THANH TOÁN:\n" +
                                        "Chúng tôi xác nhận đã nhận đủ số tiền thanh toán cho xe của quý khách.\n\n" +
                                        "🎊 CẢM ƠN QUÝ KHÁCH:\n" +
                                        "Cảm ơn quý khách đã tin tưởng và lựa chọn sản phẩm của VinFast. " +
                                        "Chúng tôi tin rằng chiếc xe này sẽ đồng hành cùng quý khách trên mọi hành trình.\n\n" +
                                        "💼 HỖ TRỢ SAU BÁN HÀNG:\n" +
                                        "Nếu cần hỗ trợ hoặc tư vấn thêm về bảo hành, bảo dưỡng, vui lòng liên hệ với chúng tôi bất cứ lúc nào.\n\n" +
                                        "Chúc quý khách lái xe an toàn và may mắn!\n\n" +
                                        "Trân trọng,\n" +
                                        "Đội ngũ VinFast",
                                        customerName,
                                        productName,
                                        color,
                                        vinNum,
                                        formattedPrice
                                    );
                                    
                                    emailService.sendSimpleEmail(customerEmail, subject, body);
                                    System.out.println("Congratulations email sent to: " + customerEmail);
                                } catch (Exception emailEx) {
                                    System.err.println("Failed to send congratulations email: " + emailEx.getMessage());
                                    emailEx.printStackTrace();
                                    // Don't throw - allow order update to succeed even if email fails
                                }
                            }
                            
                            // Cancel all other orders with the same VIN/Engine number (in separate try-catch)
                            try {
                                String vinNum = product.getVinNum();
                                String engineNum = product.getEngineNum();
                                if (vinNum != null || engineNum != null) {
                                    List<Order> allOrders = orderRepo.findAll();
                                    List<Order> otherOrders = new ArrayList<>();
                                    
                                    for (Order o : allOrders) {
                                        if (o.getId() == orderId) continue; // Skip current order
                                        if (o.getProduct() == null) continue;
                                        
                                        Product p = o.getProduct();
                                        boolean sameVin = vinNum != null && vinNum.equals(p.getVinNum());
                                        boolean sameEngine = engineNum != null && engineNum.equals(p.getEngineNum());
                                        
                                        if (sameVin || sameEngine) {
                                            String status = o.getStatus();
                                            if (!"Đã giao".equals(status) && !"Đã hủy".equals(status)) {
                                                otherOrders.add(o);
                                            }
                                        }
                                    }
                                    
                                    for (Order otherOrder : otherOrders) {
                                        otherOrder.setStatus("Đã hủy");
                                        String cancelNote = "Xe đã được bán cho khách hàng khác (VIN: " + vinNum + ", Số máy: " + engineNum + ")";
                                        if (otherOrder.getShipAddress() != null && !otherOrder.getShipAddress().isEmpty()) {
                                            otherOrder.setShipAddress(otherOrder.getShipAddress() + " | " + cancelNote);
                                        } else {
                                            otherOrder.setShipAddress(cancelNote);
                                        }
                                        orderRepo.save(otherOrder);
                                        System.out.println("Auto-cancelled order ID " + otherOrder.getId() + " due to vehicle being sold");
                                    }
                                    
                                    if (!otherOrders.isEmpty()) {
                                        System.out.println("Auto-cancelled " + otherOrders.size() + " order(s) with same VIN/Engine");
                                    }
                                }
                            } catch (Exception cancelEx) {
                                System.err.println("Failed to auto-cancel other orders: " + cancelEx.getMessage());
                                cancelEx.printStackTrace();
                                // Don't throw - allow main order update to succeed
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Failed to update product status to SOLDOUT: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
                
                // Send email notification when status changes to "Sẵn sàng giao xe"
                if ("Sẵn sàng giao xe".equals(dto.getStatus()) && !dto.getStatus().equals(oldStatus)) {
                    try {
                        User customer = order.get().getUser();
                        if (customer != null && customer.getEmail() != null) {
                            String customerName = customer.getUsername();
                            String customerEmail = customer.getEmail();
                            String productName = order.get().getProduct() != null ? order.get().getProduct().getName() : "N/A";
                            String dealerName = order.get().getDealer() != null ? order.get().getDealer().getName() : "N/A";
                            String dealerAddress = order.get().getDealer() != null ? order.get().getDealer().getAddress() : "N/A";
                            double totalPrice = order.get().getTotal();
                            double depositPaid = totalPrice * 0.3;
                            double remainingAmount = totalPrice * 0.7;
                            
                            // Get expected delivery date from DTO or from notes (backward compatibility)
                            String expectedDeliveryDate = "N/A";
                            if (dto.getDeliveryDate() != null) {
                                // Format the date from DTO
                                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy");
                                expectedDeliveryDate = sdf.format(dto.getDeliveryDate());
                            } else if (dto.getNotes() != null && dto.getNotes().contains("Ngày giao dự kiến:")) {
                                // Fallback: Extract from notes for backward compatibility
                                try {
                                    int startIndex = dto.getNotes().indexOf("Ngày giao dự kiến:") + "Ngày giao dự kiến:".length();
                                    int endIndex = dto.getNotes().indexOf(".", startIndex);
                                    if (endIndex == -1) endIndex = dto.getNotes().length();
                                    expectedDeliveryDate = dto.getNotes().substring(startIndex, endIndex).trim();
                                } catch (Exception e) {
                                    expectedDeliveryDate = "Sớm nhất có thể";
                                }
                            }
                            
                            // Send vehicle ready notification email
                            emailService.sendVehicleReadyNotification(
                                customerEmail,
                                customerName,
                                productName,
                                dealerName,
                                dealerAddress,
                                totalPrice,
                                depositPaid,
                                remainingAmount,
                                expectedDeliveryDate
                            );
                        }
                    } catch (Exception e) {
                        // Log error but don't fail the order update
                        System.err.println("Failed to send vehicle ready notification email: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
            
            // Update delivery date if provided
            if (dto.getDeliveryDate() != null) {
                order.get().setDeliveryDate(dto.getDeliveryDate());
                System.out.println("Updated delivery date to: " + dto.getDeliveryDate());
            }
            
            if (dto.getProductId() > 0 ){
                Optional<Product> product  = productRepo.findById(dto.getProductId());
                if (product.isPresent()){
                    order.get().setProduct(product.orElse(null));
                    order.get().setTotal(product.get().getDealerPrice());
                }
            }
            if (dto.getContractId() > 0 ){
                Optional<Contract> contract = contractRepo.findById(dto.getContractId());
                if (contract.isPresent()){
                    order.get().getContract().add(contract.get());
                }
            }
            if (dto.getDealerId() > 0){
                Optional<Dealer> dealer = dealerRepo.findById(dto.getDealerId());
                if (dealer.isPresent()){
                    order.get().setDealer(dealer.orElse(null));
                    List<Promotion> promotions = promotionRepo.findByDealer_Id(dealer.get().getId());
                    if (promotions != null){
                        order.get().setPromotions(promotions);
                    }
                }
            }
            orderRepo.save(order.get());
            return convertOrderToOrderRes(order.get());
        }
        return null;
    }

    public OrderRes updateDelivery(int orderId, DeliveryReq dto) {
        Optional<Order> order = orderRepo.findById(orderId);
        if (order.isPresent()){
            if (dto.getShip_address() != null){
                order.get().setShipAddress(dto.getShip_address());
            }
            if (dto.getShip_date() != null){
                order.get().getShipAt(dto.getShip_date());
            }
            if (dto.getShip_status() != null){
                order.get().setShipStatus(dto.getShip_status());
            }
            orderRepo.save(order.get());
            return convertOrderToOrderRes(order.get());
        }
        return null;
    }

    public boolean deleteOrder(int orderId) {
        Optional<Order> order = orderRepo.findById(orderId);
        if (order.isPresent()){
            productRepo.save(order.get().getProduct());
            order.get().getDealer().getOrders().remove(order);
            dealerRepo.save(order.get().getDealer());
            order.get().getUser().getOrders().remove(order);
            userRepo.save(order.get().getUser());
            orderRepo.delete(order.get());
            return true;
        }
        return false;
    }

    public boolean deleteDelivery(int orderId) {
        Optional<Order> order = orderRepo.findById(orderId);
        if (order.isPresent()){
            order.get().setShipAddress(null);
            order.get().getShipAt(null);
            order.get().setShipStatus(null);
            orderRepo.save(order.get());
            return true;
        }
        return false;
    }

    public OrderRes convertOrderToOrderRes(Order order) {
        OrderRes orderRes = new OrderRes();
        if (order != null){
            orderRes.setOrderId(order.getId());
            
            // Customer information
            if (order.getUser() != null){
                orderRes.setCustomerName(order.getUser().getUsername());
                orderRes.setCustomerEmail(order.getUser().getEmail());
                orderRes.setCustomerPhone(order.getUser().getPhone());
                orderRes.setCustomerAddress(order.getUser().getAddress());
            }
            
            if (order.getContract() != null){
                orderRes.setContracts(order.getContract());
            }
            
            // Product information
            if (order.getProduct() != null){
                orderRes.setProductName(order.getProduct().getName());
                orderRes.setProductImage(order.getProduct().getImage());
                orderRes.setProductVin(order.getProduct().getVinNum());
                orderRes.setProductEngine(order.getProduct().getEngineNum());
                orderRes.setProductBattery(order.getProduct().getBattery());
                orderRes.setProductRange(order.getProduct().getRange());
                orderRes.setProductHP(order.getProduct().getHp());
                orderRes.setProductTorque(order.getProduct().getTorque());
                orderRes.setProductColor(order.getProduct().getColor());
            }
            
            if (order.getDealer() != null){
                orderRes.setDealerId(order.getDealer().getId());
            }
            if (order.getTotal() >= 0){
                orderRes.setTotalPrice(order.getTotal());
            }
            if (order.getStatus() != null){
                orderRes.setStatus(order.getStatus());
            } else {
                orderRes.setStatus("Chờ xử lý");
            }
            if (order.getOrderDate() != null){
                orderRes.setOrderDate(order.getOrderDate());
            }
            // Use the dedicated deliveryDate field instead of shipAt
            if (order.getDeliveryDate() != null){
                orderRes.setDeliveryDate(order.getDeliveryDate());
            } else if (order.getShipAt() != null){
                orderRes.setDeliveryDate(order.getShipAt());
            }
            // Notes from shipAddress field (workaround)
            if (order.getShipAddress() != null){
                orderRes.setNotes(order.getShipAddress());
            }
        }
        return orderRes;
    }
}
