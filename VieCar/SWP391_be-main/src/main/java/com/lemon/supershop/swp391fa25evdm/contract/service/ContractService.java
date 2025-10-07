package com.lemon.supershop.swp391fa25evdm.contract.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.contract.model.dto.ContractReq;
import com.lemon.supershop.swp391fa25evdm.contract.model.dto.ContractRes;
import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;
import com.lemon.supershop.swp391fa25evdm.contract.repository.ContractRepo;
import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.order.repository.OrderRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;


@Service
public class ContractService {

    @Autowired
    private ContractRepo contractRepo;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private UserRepo userRepo;

    public List<ContractRes> getAllContracts() {
        List<Contract> contracts = contractRepo.findAll();
        return contracts.stream().map(this::convertToRes).toList();
    }

    public ContractRes getContractById(int id) {
        return contractRepo.findById(id)
                .map(this::convertToRes)
                .orElse(null);
    }

    public List<ContractRes> getContractsByUserId(int userId) {
        List<Contract> contracts = contractRepo.findByUserId(userId);
        return contracts.stream().map(this::convertToRes).toList();
    }

    public List<ContractRes> getContractsByOrderId(int orderId) {
        List<Contract> contracts = contractRepo.findByOrderId(orderId);
        return contracts.stream().map(this::convertToRes).toList();
    }

    public List<ContractRes> getContractsByStatus(String status) {
        List<Contract> contracts = contractRepo.findByStatus(status);
        return contracts.stream().map(this::convertToRes).toList();
    }

    public ContractRes createContract (ContractReq dto) {
        Contract contract = new Contract();
        contract.setSignedDate(dto.getSignedDate());
        contract.setFileUrl(dto.getFileUrl());

        Order order = orderRepo.findById(dto.getOrderId()).orElseThrow(() -> new RuntimeException("Order not found with id: " + dto.getOrderId()));
        contract.setOrders(List.of(order));

        User user = userRepo.findById(dto.getUserId()).orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getUserId()));
        contract.setUser(user);

        contract.setStatus(dto.getStatus());
        contractRepo.save(contract);
        return convertToRes(contract);
    }

    public boolean deleteContract(int id) {
        if (contractRepo.existsById(id)){
            contractRepo.deleteById(id);
            return true;
        }
        return false;
    }

    public void updateContract(int id, ContractReq dto) throws Exception {
        Contract existingContract = contractRepo.findById(id)
                .orElseThrow(() -> new Exception("Contract not found with id: " + id));
        existingContract.setSignedDate(dto.getSignedDate());
        existingContract.setFileUrl(dto.getFileUrl());

        Order order = orderRepo.findById(dto.getOrderId())
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + dto.getOrderId()));
        existingContract.setOrders(new ArrayList<>(List.of(order)));

        User user = userRepo.findById(dto.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getUserId()));
        existingContract.setUser(user);

        existingContract.setStatus(dto.getStatus());
        contractRepo.save(existingContract);
    }

    private ContractRes convertToRes(Contract contract) {
        ContractRes dto = new ContractRes();
        dto.setId(contract.getId());
        dto.setSignedDate(contract.getSignedDate());
        dto.setFileUrl(contract.getFileUrl());

        List<Order> orders = contract.getOrders();
        if (orders != null && !orders.isEmpty()){
            dto.setOrderId(orders.get(0).getId());
        } else {
            dto.setOrderId(null);
        }

        if (contract.getUser() != null) {
            dto.setUserId(contract.getUser().getId());
        } else {
            dto.setUserId(null);
        }

        dto.setStatus(contract.getStatus());
        return dto;
    }
}