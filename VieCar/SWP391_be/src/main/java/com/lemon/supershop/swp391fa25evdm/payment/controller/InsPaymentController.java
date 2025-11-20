//package com.lemon.supershop.swp391fa25evdm.payment.controller;
//
//import com.lemon.supershop.swp391fa25evdm.payment.model.dto.request.InsPaymentReq;
//import com.lemon.supershop.swp391fa25evdm.payment.model.dto.response.InsPaymentRes;
//import com.lemon.supershop.swp391fa25evdm.payment.service.InsPaymentService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/installmentPayment")
//public class InsPaymentController {
//
//    @Autowired
//    private InsPaymentService insPaymentService;
//
//    @GetMapping("/plan/{planId}")
//    public ResponseEntity<List<InsPaymentRes>> getByPlanId(@PathVariable("planId") int planId) {
//        List<InsPaymentRes> payments = insPaymentService.getInstallmentPaymentByInsPlanId(planId);
//        return ResponseEntity.ok(payments);
//    }
//
//    @PostMapping("/{id}")
//    public ResponseEntity<List<InsPaymentRes>> createInstallmentPayments(@PathVariable("id") int id) {
//        List<InsPaymentRes> insPaymentResList = insPaymentService.createInstallmentPaymentbyPlanId(id);
//        return ResponseEntity.ok(insPaymentResList);
//    }
//
//    @DeleteMapping("remove/{id}")
//    public ResponseEntity<String> deleteInstallmentPayment(@PathVariable("id") int id) {
//        insPaymentService.deleteInstallmentPayment(id);
//        return ResponseEntity.ok("Installment payment deleted successfully");
//    }
//    @DeleteMapping("remove/installmentPlan/{id}")
//    public ResponseEntity<String> deleteAllInstallmentPaymentinPlan(@PathVariable("id") int id) {
//        insPaymentService.deleteAllInstallmentPayment(id);
//        return ResponseEntity.ok("Installment payment in Plan deleted successfully");
//    }
//}
