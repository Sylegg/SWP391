package com.lemon.supershop.swp391fa25evdm.contract.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lemon.supershop.swp391fa25evdm.contract.model.dto.ContractReq;
import com.lemon.supershop.swp391fa25evdm.contract.model.dto.ContractRes;
import com.lemon.supershop.swp391fa25evdm.contract.service.ContractService;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin("*")
public class ContractController {

    @Autowired
    private ContractService contractService;

    @GetMapping ("/listContracts")
    public ResponseEntity<List<ContractRes>> getAllContracts() {
        List<ContractRes> contracts = contractService.getAllContracts();
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/search/id/{id}")
    public ResponseEntity<ContractRes> getContractById(@PathVariable int id) {
        ContractRes contract = contractService.getContractById(id);
        return ResponseEntity.ok(contract);
    }

    @GetMapping("/search/userId/{userId}")
    public ResponseEntity<List<ContractRes>> getContractsByUserId(@PathVariable int userId) {
        List<ContractRes> contracts = contractService.getContractsByUserId(userId);
        return ResponseEntity.ok(contracts);
    }  

    @GetMapping("/search/orderId/{orderId}")
    public ResponseEntity<List<ContractRes>> getContractsByOrderId(@PathVariable int orderId) {
        List<ContractRes> contracts = contractService.getContractsByOrderId(orderId);
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/search/status/{status}")
    public ResponseEntity<List<ContractRes>> getContractsByStatus(@PathVariable String status) {
        List<ContractRes> contracts = contractService.getContractsByStatus(status);
        return ResponseEntity.ok(contracts);
    }

    @PostMapping("/create")
    public ResponseEntity<ContractRes> createContract(@RequestBody ContractReq contractReq) {
        ContractRes contract = contractService.createContract(contractReq);
        if (contract != null) {
            return ResponseEntity.ok(contract);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateContract(@PathVariable int id, @RequestBody ContractReq contractReq) throws Exception {
        contractService.updateContract(id, contractReq);
        return ResponseEntity.ok("Contract updated successfully");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteContract(@PathVariable int id) {
        if (contractService.deleteContract(id)){
            return ResponseEntity.ok("Contract deleted successfully");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
