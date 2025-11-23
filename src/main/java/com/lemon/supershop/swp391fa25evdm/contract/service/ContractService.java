package com.lemon.supershop.swp391fa25evdm.contract.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.contract.model.dto.ContractReq;
import com.lemon.supershop.swp391fa25evdm.contract.model.dto.ContractRes;
import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;
import com.lemon.supershop.swp391fa25evdm.contract.repository.ContractRepo;
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

        Optional<User> user = userRepo.findById(dto.getUserId());
        if (user.isPresent()) {
            contract.setUser(user.get());
            user.get().getContracts().add(contract);
        }
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

    public ContractRes updateContract(int id, ContractReq dto) throws Exception {
        Optional<Contract> existingContract = contractRepo.findById(id);
        if (existingContract.isPresent()) {
            if (dto.getFileUrl() != null) {
                existingContract.get().setFileUrl(dto.getFileUrl());
            }
            if (dto.getStatus() != null) {
                existingContract.get().setStatus(dto.getStatus());
            }
            Optional<User> user = userRepo.findById(dto.getUserId());
            if (user.isPresent()) {
                existingContract.get().setUser(user.orElse(null));
            }
            contractRepo.save(existingContract.get());
            return convertToRes(existingContract.orElse(null));
        }
        return null;
    }

    private ContractRes convertToRes(Contract contract) {
        ContractRes dto = new ContractRes();
        if (contract != null){
            dto.setId(contract.getId());
            dto.setSignedDate(contract.getSignedDate());
            dto.setFileUrl(contract.getFileUrl());
            dto.setUserId(contract.getUser().getId());
            dto.setStatus(contract.getStatus());
            return dto;
        }
        return null;
    }
}