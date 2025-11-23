package com.lemon.supershop.swp391fa25evdm.order.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.lemon.supershop.swp391fa25evdm.product.model.enums.ProductStatus;
import com.lemon.supershop.swp391fa25evdm.refra.email.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;
import com.lemon.supershop.swp391fa25evdm.contract.repository.ContractRepo;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.order.model.dto.request.DeliveryReq;
import com.lemon.supershop.swp391fa25evdm.order.model.dto.request.OrderReq;
import com.lemon.supershop.swp391fa25evdm.order.model.dto.response.OrderRes;
import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.order.repository.OrderRepo;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
import com.lemon.supershop.swp391fa25evdm.promotion.model.entity.Promotion;
import com.lemon.supershop.swp391fa25evdm.promotion.repository.PromotionRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;

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
                return convertoRes(order);
            }).collect(Collectors.toList());
        }else {
            return null;
        }
    }

    public List<OrderRes> ListAllOrders() {
            return orderRepo.findAll().stream().map(order -> {
                return convertoRes(order);
            }).collect(Collectors.toList());
    }

    public OrderRes createOrder(int userId, OrderReq dto) {
        Optional<User> user = userRepo.findById(userId);
        if (user.isPresent()){
            Order order = new Order();
            order.setUser(user.get());
            Order newOrder = converttoEntity(order, dto);
            orderRepo.save(newOrder);
            return convertoRes(newOrder);
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
            }
            orderRepo.save(order.get());
            return convertoRes(order.get());
        }
        return null;
    }

    public OrderRes updateOrder(int orderId, OrderReq dto) {
        Optional<Order> order = orderRepo.findById(orderId);
        if (order.isPresent()){
            if ("Đã giao".equals(order.get().getStatus())) {
                throw new IllegalStateException("Không thể chỉnh sửa đơn hàng đã giao. Đơn hàng này đã hoàn tất.");
            }
            Order updateOrder = converttoEntity(order.get(), dto);
            orderRepo.save(updateOrder);
            return convertoRes(order.get());
        }
        return null;
    }

    public OrderRes updateDelivery(int orderId, DeliveryReq dto) {
        Optional<Order> order = orderRepo.findById(orderId);
        if (order.isPresent()){
            String oldStatus = order.get().getStatus();

            if ("Đã giao".equals(oldStatus)) {
                throw new IllegalStateException("Không thể chỉnh sửa đơn hàng đã giao. Đơn hàng này đã hoàn tất.");
            }

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
            return convertoRes(order.get());
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

    public OrderRes convertoRes(Order order) {
        OrderRes orderRes = new OrderRes();
        if (order != null){
            orderRes.setOrderId(order.getId());
            if (order.getUser() != null){
                orderRes.setCustomerName(order.getUser().getUsername());
                orderRes.setCustomerEmail(order.getUser().getEmail());
                orderRes.setCustomerPhone(order.getUser().getPhone());
                orderRes.setCustomerAddress(order.getUser().getAddress());
            }
            if (order.getContract() != null){
                orderRes.setContracts(order.getContract());
            }
            if (order.getProduct() != null){
                orderRes.setProductName(order.getProduct().getName());
                orderRes.setProductVin(order.getProduct().getVinNum());
                orderRes.setProductEngine(order.getProduct().getEngineNum());
                orderRes.setProductBattery(order.getProduct().getBattery());
                orderRes.setProductRange(order.getProduct().getRange());
                orderRes.setProductHP(order.getProduct().getHp());
                orderRes.setProductTorque(order.getProduct().getTorque());
                orderRes.setProductColor(order.getProduct().getColor());
                orderRes.setProductImage(order.getProduct().getImage());
            }
            if (order.getDealer() != null){
                orderRes.setDealerId(order.getDealer().getId());
            }
            if (order.getTotal() >= 0){
                orderRes.setTotalPrice(order.getTotal());
            }
            if (order.getDescription() != null){
                orderRes.setDescription(order.getDescription());
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
            if (order.getShipAddress() != null){
                orderRes.setNotes(order.getShipAddress());
            }
        }
        return orderRes;
    }
    public Order converttoEntity(Order order, OrderReq dto) {

        if (order == null) return null;

        String oldStatus = (order.getStatus() != null) ? order.getStatus() : "Chờ xử lý";

        // 1) UPDATE BASE FIELDS
        if (dto.getDescription() != null) {
            order.setDescription(dto.getDescription());
        }

        if (dto.getDeliveryDate() != null) {
            order.setDeliveryDate(dto.getDeliveryDate());
        }

        // 2) UPDATE PRODUCT
        if (dto.getProductId() > 0) {
            productRepo.findById(dto.getProductId()).ifPresent(product -> {
                order.setProduct(product);
                order.setTotal(product.getDealerPrice());
            });
        }

        // 3) UPDATE CONTRACT
        if (dto.getContractId() > 0) {
            contractRepo.findById(dto.getContractId()).ifPresent(contract -> {
                contract.setOrder(order);

                if (order.getContract() == null) {
                    order.setContract(new ArrayList<>());
                }

                order.getContract().add(contract);
                contractRepo.save(contract);
            });
        }

        // 4) UPDATE DEALER + PROMO
        if (dto.getDealerId() > 0) {
            dealerRepo.findById(dto.getDealerId()).ifPresent(dealer -> {
                order.setDealer(dealer);
                List<Promotion> promotions = promotionRepo.findByDealer_Id(dealer.getId());
                order.setPromotions(promotions);
            });
        }

        // 5) STATUS UPDATE LOGIC
        if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {

            // 5.1 — Reserved
            if (("Đã đặt cọc".equals(dto.getStatus()) || "Đã yêu cầu đại lý".equals(dto.getStatus()))
                    && !dto.getStatus().equals(oldStatus)) {

                Product product = order.getProduct();
                if (product != null) {
                    product.setStatus(ProductStatus.RESERVED);
                    productRepo.save(product);
                }
            }

            // 5.2 — Delivered + Cancel các đơn cùng mã số khung, số máy
            if ("Đã giao".equals(dto.getStatus()) && !oldStatus.equals("Đã giao")) {

                Product product = order.getProduct();
                if (product != null) {
                    product.setStatus(ProductStatus.SOLDOUT);
                    productRepo.save(product);

                    String vin = product.getVinNum();
                    String engine = product.getEngineNum();

                    List<Order> allOrders = orderRepo.findAll();

                    for (Order o : allOrders) {
                        if (o.getId() == order.getId()) continue;
                        if (o.getProduct() == null) continue;

                        boolean sameVin = vin != null && vin.equals(o.getProduct().getVinNum());
                        boolean sameEngine = engine != null && engine.equals(o.getProduct().getEngineNum());

                        if (sameVin || sameEngine) {
                            if (!"Đã giao".equals(o.getStatus()) && !"Đã hủy".equals(o.getStatus())) {
                                o.setStatus("Đã hủy");
                                o.setShipAddress("Xe đã bán cho khách khác (VIN: " + vin + ")");
                                orderRepo.save(o);
                            }
                        }
                    }
                }
            }

            // 5.3 — Send Email khi xe chuẩn bị giao
            if ("Sẵn sàng giao xe".equals(dto.getStatus()) && !oldStatus.equals("Sẵn sàng giao xe")) {
                sendEmail(order, dto);
            }

            order.setStatus(dto.getStatus());
        }

        return order;
    }

//    public Order converttoEntity(Order order, OrderReq dto){
//        if (order != null){
//            if (order.getStatus() != null){
//                String oldStatus = order.getStatus();
//            } else {
//                order.setStatus("Chờ xử lý");
//            }
//
//            if (dto.getProductId() > 0 ){
//                Optional<Product> product  = productRepo.findById(dto.getProductId());
//                if (product.isPresent()){
//                    order.setProduct(product.orElse(null));
//                    order.setTotal(product.get().getDealerPrice());
//                }
//            }
//            if (dto.getContractId() > 0 ){
//                Optional<Contract> contract = contractRepo.findById(dto.getContractId());
//                if (contract.isPresent()){
//                    contract.get().setOrder(order);
//                    if (order.getContract() != null){
//                        order.getContract().add(contract.get());
//                        contractRepo.save(contract.get());
//                    } else {
//                        List<Contract> contracts = new ArrayList<Contract>();
//                        order.setContract(contracts);
//                    }
//                }
//            }
//            if (dto.getDealerId() > 0){
//                Optional<Dealer> dealer = dealerRepo.findById(dto.getDealerId());
//                if (dealer.isPresent()){
//                    order.setDealer(dealer.orElse(null));
//                    List<Promotion> promotions = promotionRepo.findByDealer_Id(dealer.get().getId());
//                    if (promotions != null){
//                        order.setPromotions(promotions);
//                    }
//                }
//            }
//            if (dto.getDescription() != null){
//                order.setDescription(dto.getDescription());
//            }
//            // Update delivery date if provided
//            if (dto.getDeliveryDate() != null) {
//                order.setDeliveryDate(dto.getDeliveryDate());
//                System.out.println("Updated delivery date to: " + dto.getDeliveryDate());
//            }
//
//            if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
//                // Update product status in showroom when deposit is confirmed
//                if (("Đã đặt cọc".equals(dto.getStatus()) || "Đã yêu cầu đại lý".equals(dto.getStatus()))
//                        && !dto.getStatus().equals(order.getStatus())) {
//                    try {
//                        Product product = order.getProduct();
//                        if (product != null) {
//                            product.setStatus(ProductStatus.RESERVED); // Đánh dấu xe đã được đặt cọc
//                            productRepo.save(product);
//                        }
//                    } catch (Exception e) {
//                        System.err.println("Failed to update product status: " + e.getMessage());
//                        e.printStackTrace();
//                    }
//                }
//
//                // Update product status to SOLDOUT when vehicle is delivered
//                if ("Đã giao".equals(dto.getStatus()) && !dto.getStatus().equals(order.getStatus())) {
//                    try {
//                        Product product = order.getProduct();
//                        if (product != null) {
//                            product.setStatus(ProductStatus.SOLDOUT); // Đánh dấu xe đã bán
//                            productRepo.save(product);
//                        }
//                    } catch (Exception e) {
//                        System.err.println("Failed to update product status to SOLDOUT: " + e.getMessage());
//                        e.printStackTrace();
//                    }
//                }
//            }
//
//            // Send email notification when status changes to "Sẵn sàng giao xe"
//            if ("Sẵn sàng giao xe".equals(dto.getStatus()) && !dto.getStatus().equals(order.getStatus())) {
//                sendEmail(order, dto);
//            }
//
//            // Update status if provided
//            if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
//                order.setStatus(dto.getStatus());
//            }
//
//            return order;
//        }
//        return null;
//    }

    public void sendEmail(Order order, OrderReq dto){
        try {
            Optional<User> customer = userRepo.findById(order.getUser().getId());
            if (customer.isPresent() && customer.get().getEmail() != null) {
                String customerName = customer.get().getUsername();
                String customerEmail = customer.get().getEmail();
                String productName = order.getProduct() != null ? order.getProduct().getName() : "N/A";
                String dealerName = order.getDealer() != null ? order.getDealer().getName() : "N/A";
                String dealerAddress = order.getDealer() != null ? order.getDealer().getAddress() : "N/A";
                double totalPrice = order.getTotal();
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
