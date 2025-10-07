package com.lemon.supershop.swp391fa25evdm.order.service;

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

    public List<OrderRes> ListAllOrders() {
            return orderRepo.findAll().stream().map(order -> {
                return convertOrderToOrderRes(order);
            }).collect(Collectors.toList());
    }

    public OrderRes createOrder(int userId, OrderReq dto) {
        Optional<User> user = userRepo.findById(userId);
        if (user.isPresent()){
            Order order = new Order();
            order.setUser(user.orElse(null));
            if (dto.getProductId() > 0 ){
                Optional<Product> product  = productRepo.findById(dto.getProductId());
                if (product.isPresent()){
                    order.setProduct(product.orElse(null));
                    order.setTotal(product.get().getDealerPrice());
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
                order.get().setShipStatus("Wait for delivery");
            }
            orderRepo.save(order.get());
            return convertOrderToOrderRes(order.get());
        }
        return null;
    }

    public OrderRes updateOrder(int orderId, UpdateOrderReq dto) {
        Optional<Order> order = orderRepo.findById(orderId);
        if (order.isPresent()){
            if (dto.getProductId() > 0 ){
                Optional<Product> product  = productRepo.findById(dto.getProductId());
                if (product.isPresent()){
                    order.get().setProduct(product.orElse(null));
                    order.get().setTotal(product.get().getDealerPrice());
                }
            }
            if (dto.getContractId() > 0 ){
                Contract contract = contractRepo.findById(dto.getContractId()).get();
                if (contract != null){
                    order.get().setContract(contract);
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
            contractRepo.delete(order.get().getContract());
            order.get().getProduct().getOrders().remove(order);
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
            if (order.getUser() != null){
                orderRes.setCustomerName(order.getUser().getUsername());
            }
            if (order.getContract() != null){
                orderRes.setContractId(order.getContract().getId());
            }
            if (order.getProduct() != null){
                orderRes.setProductName(order.getProduct().getName());
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
                orderRes.setStatus("Processing");
            }
        }
        return orderRes;
    }
}
