package com.lemon.supershop.swp391fa25evdm.payment.controller;

import com.lemon.supershop.swp391fa25evdm.payment.model.dto.request.PaymentReq;
import com.lemon.supershop.swp391fa25evdm.payment.model.dto.response.PaymentRes;
import com.lemon.supershop.swp391fa25evdm.payment.model.entity.Payment;
import com.lemon.supershop.swp391fa25evdm.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentRes>> getPaymentsByUser(@PathVariable int userId) {
        List<PaymentRes> payments = paymentService.getAllUserPayments(userId);
        return ResponseEntity.ok(payments);
    }

    @PostMapping("/order")
    public ResponseEntity<PaymentRes> createPaymentOrder(@RequestBody PaymentReq dto) {
        PaymentRes payment = paymentService.createPaymentOrder(dto);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/preorder")
    public ResponseEntity<PaymentRes> createPaymentPreOrder(@RequestBody PaymentReq dto) {
        PaymentRes payment = paymentService.createPaymentPreOrder(dto);
        return ResponseEntity.ok(payment);
    }

//    @PostMapping("/installment")
//    public ResponseEntity<PaymentRes> createPaymentInstallment(@RequestBody PaymentReq dto) {
//        PaymentRes payment = paymentService.createPaymentInsPayment(dto);
//        return ResponseEntity.ok(payment);
//    }

    @PutMapping("/{id}/mark-paid")
    public ResponseEntity<String> markAsPaid(@PathVariable int id) {
        paymentService.markAsPaid(id);
        return ResponseEntity.ok("Payment marked as paid.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePayment(@PathVariable int id) {
        if (paymentService.removePayment(id)){
            return ResponseEntity.ok("Payment removed successfully.");
        } else {
            return ResponseEntity.badRequest().build();
        }

    }
}
