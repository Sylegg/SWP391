package com.lemon.supershop.swp391fa25evdm.preorder.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;
import com.lemon.supershop.swp391fa25evdm.contract.repository.ContractRepo;
import com.lemon.supershop.swp391fa25evdm.preorder.model.dto.PreOrderReq;
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
    @Autowired
    private ContractRepo contractRepo;

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

    public PreOrderRes createPreOrder (PreOrderReq preOrderReq) {
        PreOrder preOrder = new PreOrder();
        PreOrder preorder =  convertToEntity(preOrder, preOrderReq);
        preOrderRepo.save(preorder);
        return convertToRes(preorder);
    }

    public PreOrderRes updatePreOrder (int id, PreOrderReq preOrderReq) {
        Optional<PreOrder> existingPreOrder = preOrderRepo.findById(id);
        if (existingPreOrder.isPresent()) {
            PreOrder preOrder = convertToEntity(existingPreOrder.get(), preOrderReq);
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

    private PreOrder convertToEntity (PreOrder preOrder, PreOrderReq preOrderReq) {
        if (preOrder != null || preOrderReq != null){
            if (preOrderReq.getOrderDate() != null){
                preOrder.setOrderDate(preOrderReq.getOrderDate());
            }
            if (preOrderReq.getStatus() != null){
                preOrder.setStatus(preOrderReq.getStatus());
            }
            if (preOrderReq.getDeposit() > 0){
                preOrder.setDeposit(preOrderReq.getDeposit());
            }
            if (preOrderReq.getContractId() > 0){
                Optional<Contract> contract  = contractRepo.findById(preOrderReq.getContractId());
                if (contract.isPresent()){
                    List<Contract> contracts = new ArrayList<>();
                    contracts.add(contract.get());
                    preOrder.setContract(contracts);
                }
            }
            if (preOrderReq.getUserId() != 0) {
                Optional<User> user = userRepo.findById(preOrderReq.getUserId());
                if (user.isPresent()){
                    preOrder.setUser(user.orElse(null));
                }
            }
            if (preOrderReq.getProductId() != 0) {
                Optional<Product> product = productRepo.findById(preOrderReq.getProductId());
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

        if (preOrder.getUser() != null){
            preOrderRes.setUserId(preOrder.getUser().getId());
        }
        if (preOrder.getProduct() != null) {
            preOrderRes.setProductId(preOrder.getProduct().getId());
        }
        preOrderRes.setOrderDate(preOrder.getOrderDate());
        preOrderRes.setStatus(preOrder.getStatus());
        preOrderRes.setDeposit(preOrder.getDeposit());
        if (preOrder.getContract() != null){
            preOrderRes.setContracts(preOrder.getContract());
        }
        return preOrderRes;
    }
}
