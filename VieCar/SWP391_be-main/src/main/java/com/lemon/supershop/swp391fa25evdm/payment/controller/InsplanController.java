//package com.lemon.supershop.swp391fa25evdm.payment.controller;
//
//import com.lemon.supershop.swp391fa25evdm.payment.model.dto.request.InsPlanReq;
//import com.lemon.supershop.swp391fa25evdm.payment.model.dto.response.InsPlanRes;
//import com.lemon.supershop.swp391fa25evdm.payment.service.InsplanService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/installmentPlan")
//public class InsplanController {
//    @Autowired
//    private InsplanService insplanService;
//
//    @GetMapping("/listInstallmentPlan")
//    public ResponseEntity<List<InsPlanRes>> getAllUsers() {
//        List<InsPlanRes> insPlanList = insplanService.getAllInstallmentPlans();
//        return ResponseEntity.ok(insPlanList);
//    }
//
//    @GetMapping("/{productId}/listInstallmentPlan")
//    public ResponseEntity<List<InsPlanRes>> getAllProductInsPlan(@PathVariable("productId") int productId) {
//        List<InsPlanRes> insPlanList = insplanService.getInstallmentPlanByProductId(productId);
//        return ResponseEntity.ok(insPlanList);
//    }
//
//    @PostMapping("/addInstallmentPlan")
//    public ResponseEntity<String> addInsPlan(@RequestBody InsPlanReq dto) {
//        insplanService.addInstallmentPlan(dto);
//        return ResponseEntity.ok("InstallmentPlan applied successfully");
//    }
//
//    @PutMapping("installmentPlan/{id}")
//    public ResponseEntity<String> updateInsPlan(@PathVariable("id") int id, @RequestBody InsPlanReq dto) throws Exception {
//        insplanService.updateInstallmentPlan(id, dto);
//        return ResponseEntity.ok("InstallmentPlan Updated successfully");
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<String> deleteInsPlan(@PathVariable("id") int id) {
//        insplanService.deleteInstallmentPlan(id);
//        return ResponseEntity.ok("InstallmentPlan Removed successfully");
//    }
//}
