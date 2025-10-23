package com.lemon.supershop.swp391fa25evdm.preorder.service;

import java.util.List;
import java.util.Optional;

import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.preorder.model.dto.PreOrderRes;
import com.lemon.supershop.swp391fa25evdm.preorder.model.entity.PreOrder;
import com.lemon.supershop.swp391fa25evdm.preorder.repository.PreOrderRepo;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;

@Service
public class PreOrderService {
    
    @Autowired
    private PreOrderRepo preOrderRepo;
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private UserRepo userRepo;

    public List<PreOrderRes> getAllPreOrders() {
        List<PreOrder> preOrders = preOrderRepo.findAll();
        return preOrders.stream().map(this::convertToRes).toList();
    }

    public List<PreOrderRes> getPreOrdersByUserId(int userId) {
        List<PreOrder> preOrders = preOrderRepo.findByUserId(userId);
        return preOrders.stream().map(this::convertToRes).toList();
    }

    public List<PreOrderRes> getPreOrdersByStatus(String status) {
        List<PreOrder> preOrders = preOrderRepo.findByStatus(status);
        return preOrders.stream().map(this::convertToRes).toList();
    }

    public List<PreOrderRes> getPreOrdersByProductId(int productId) {
        List<PreOrder> preOrders = preOrderRepo.findByProductId(productId);
        return preOrders.stream().map(this::convertToRes).toList();
    }

    public PreOrderRes createPreOrder (PreOrderRes preOrderRes) {
        PreOrder preOrder = new PreOrder();
        PreOrder preorder =  convertToEntity(preOrder, preOrderRes);
        preOrderRepo.save(preorder);
        return convertToRes(preorder);
    }

    public PreOrderRes updatePreOrder (int id, PreOrderRes preOrderRes) {
        Optional<PreOrder> existingPreOrder = preOrderRepo.findById(id);
        if (existingPreOrder.isPresent()) {
            PreOrder preOrder = convertToEntity(existingPreOrder.get(), preOrderRes);
            preOrderRepo.save(preOrder);
            return convertToRes(preOrder);
        }
        return null;
    }

    public boolean deletePreOrder (int id) {
        Optional<PreOrder> existingPreOrder = preOrderRepo.findById(id);
        if (existingPreOrder.isPresent()) {
            preOrderRepo.delete(existingPreOrder.get());
            return true;
        }
        return false;
    }

    private PreOrder convertToEntity (PreOrder preOrder, PreOrderRes preOrderRes) {
        if (preOrder != null || preOrderRes != null){
            if (preOrderRes.getOrderDate() != null){
                preOrder.setOrderDate(preOrderRes.getOrderDate());
            }
            if (preOrderRes.getStatus() != null){
                preOrder.setStatus(preOrderRes.getStatus());
            }
            if (preOrderRes.getDeposit() > 0){
                preOrder.setDeposit(preOrderRes.getDeposit());
            }
            if (preOrderRes.getUserId() != 0) {
                Optional<User> user = userRepo.findById(preOrderRes.getUserId());
                if (user.isPresent()){
                    preOrder.setUser(user.orElse(null));
                }
            }
            if (preOrderRes.getProductId() != 0) {
                Optional<Product> product = productRepo.findById(preOrderRes.getProductId());
                if (product.isPresent()){
                    preOrder.setProduct(product.orElse(null));
                }
            }
            return preOrder;
        }
        return null;
    }

    private PreOrderRes convertToRes (PreOrder preOrder) {
        PreOrderRes preOrderRes = new PreOrderRes();

        preOrderRes.setOrderDate(preOrder.getOrderDate());
        preOrderRes.setStatus(preOrder.getStatus());
        preOrderRes.setDeposit(preOrder.getDeposit());

        if (preOrder.getUser() != null) {
            preOrderRes.setUserId(preOrder.getUser().getId());
        }

        if (preOrder.getProduct() != null) {
            preOrderRes.setProductId(preOrder.getProduct().getId());
        }

        return preOrderRes;
    }
}
