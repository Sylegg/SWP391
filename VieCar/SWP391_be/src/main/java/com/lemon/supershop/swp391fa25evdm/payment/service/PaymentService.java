package com.lemon.supershop.swp391fa25evdm.payment.service;

import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.order.repository.OrderRepo;
import com.lemon.supershop.swp391fa25evdm.payment.model.dto.request.PaymentReq;
import com.lemon.supershop.swp391fa25evdm.payment.model.dto.response.PaymentRes;
import com.lemon.supershop.swp391fa25evdm.payment.model.entity.InstallmentPayment;
import com.lemon.supershop.swp391fa25evdm.payment.model.entity.Payment;
import com.lemon.supershop.swp391fa25evdm.payment.model.enums.PaymentStatus;
import com.lemon.supershop.swp391fa25evdm.payment.repository.InsPaymentRepo;
import com.lemon.supershop.swp391fa25evdm.payment.repository.PaymentRepo;
import com.lemon.supershop.swp391fa25evdm.preorder.model.entity.PreOrder;
import com.lemon.supershop.swp391fa25evdm.preorder.repository.PreOrderRepo;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import com.lemon.supershop.swp391fa25evdm.user.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private PreOrderRepo preOrderRepo;

    @Autowired
    private InsPaymentRepo insPaymentRepo;

    public List<PaymentRes> getAllUserPayments(int id) {
        Optional<User> user = userRepo.findById(id);
        if (user.isPresent()) {
            return paymentRepo.findByUserId(id).stream().map(payment -> {
                return convertPaymentToPaymentRes(payment);
            }).collect(Collectors.toList());
        } else {
            return null;
        }
    }

    public PaymentRes createPaymentOrder(PaymentReq dto) {
        if (dto.getUserId() >= 0){
            Optional<User> user = userRepo.findById(dto.getUserId());
            if (user.isPresent()) {
                Payment payment = new Payment();
                payment.setUser(user.orElse(null));
                if (dto.getPayforId() >= 0){
                    Optional<Order> order = orderRepo.findById(dto.getPayforId());
                    if (order.isPresent()) {
                        payment.setOrder(order.orElse(null));
                    }
                    if (!dto.getMethod().isEmpty()){
                        payment.setMethod(dto.getMethod());
                    }
                    payment.setPaidStatus(PaymentStatus.PENDING);
                    paymentRepo.save(payment);
                    return convertPaymentToPaymentRes(payment);
                }
            }
        }
        return null;
    }

    public PaymentRes createPaymentPreOrder(PaymentReq dto) {
        if (dto.getUserId() >= 0){
            Optional<User> user = userRepo.findById(dto.getUserId());
            if (user.isPresent()) {
                Payment payment = new Payment();
                payment.setUser(user.orElse(null));
                if (dto.getPayforId() >= 0){
                    Optional<PreOrder> preOrder = preOrderRepo.findById(dto.getPayforId());
                    if (preOrder.isPresent()) {
                        payment.setPreOrder(preOrder.orElse(null));
                    }
                    if (!dto.getMethod().isEmpty()){
                        payment.setMethod(dto.getMethod());
                    }
                    payment.setPaidStatus(PaymentStatus.PENDING);
                    paymentRepo.save(payment);
                    return convertPaymentToPaymentRes(payment);
                }
            }
        }
        return null;
    }

    public PaymentRes createPaymentInsPayment(PaymentReq dto) {
        if (dto.getUserId() >= 0){
            Optional<User> user = userRepo.findById(dto.getUserId());
            if (user.isPresent()) {
                Payment payment = new Payment();
                payment.setUser(user.orElse(null));
                if (dto.getPayforId() >= 0){
                    Optional<InstallmentPayment> installmentPayment = insPaymentRepo.findById(dto.getPayforId());
                    if (installmentPayment.isPresent()) {
                        payment.setInstallmentPayment(installmentPayment.orElse(null));
                    }
                    if (!dto.getMethod().isEmpty()){
                        payment.setMethod(dto.getMethod());
                    }
                    paymentRepo.save(payment);
                    return convertPaymentToPaymentRes(payment);
                }
            }
        }
        return null;
    }

    public void markAsPaid(int id) {
        Payment payment = paymentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setPaidStatus(PaymentStatus.PAID);
        payment.setPaidAt(new Date());

        paymentRepo.save(payment);
    }

    public boolean removePayment(int id) {
        Optional<Payment> payment = paymentRepo.findById(id);
        if (payment.isPresent()) {
            paymentRepo.clearUserFromPayments(id);
            paymentRepo.delete(payment.get());
            return true;
        }
        return false;
    }

    public PaymentRes convertPaymentToPaymentRes(Payment payment) {
        if (payment != null) {
            PaymentRes paymentRes = new PaymentRes();
            if (payment.getUser() != null){
                paymentRes.setUserName(payment.getUser().getUsername());
            }
            if (payment.getOrder() != null){
                paymentRes.setOrderId(payment.getOrder().getId());
            }
            if (payment.getPreOrder() != null){
                paymentRes.setPreorderId(payment.getPreOrder().getId());
            }
            if (payment.getMethod() != null){
                paymentRes.setMethod(payment.getMethod());
            }
            if (payment.getPaidAt() != null){
                paymentRes.setPaid_at(payment.getPaidAt());
            }
            paymentRes.setPaidStatus(payment.getPaidStatus());
            return paymentRes;
        }
        return null;
    }
}
