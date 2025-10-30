package com.lemon.supershop.swp391fa25evdm.order.controller;

import com.lemon.supershop.swp391fa25evdm.order.model.dto.request.DeliveryReq;
import com.lemon.supershop.swp391fa25evdm.order.model.dto.request.OrderReq;
import com.lemon.supershop.swp391fa25evdm.order.model.dto.response.OrderRes;
import com.lemon.supershop.swp391fa25evdm.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderRes>> getOrdersByUser(@PathVariable int userId) {
        List<OrderRes> orders = orderService.ListOrderbyUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    public ResponseEntity<List<OrderRes>> getAllOrders() {
        List<OrderRes> orders = orderService.ListAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<OrderRes> createOrder(@PathVariable int userId, @RequestBody OrderReq dto) {
        OrderRes order = orderService.createOrder(userId, dto);
        if (order != null) {
            return ResponseEntity.ok(order);
        } else {
            return ResponseEntity.badRequest().body(order);
        }
    }

    @PostMapping("/{orderId}/delivery")
    public ResponseEntity<String> createDelivery(@PathVariable int orderId, @RequestBody DeliveryReq dto) {
        orderService.createDelivery(orderId, dto);
        return ResponseEntity.ok("Delivery created successfully!");
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<String> updateOrder(@PathVariable int orderId, @RequestBody OrderReq dto) {
        orderService.updateOrder(orderId, dto);
        return ResponseEntity.ok("Order updated successfully!");
    }

    @PutMapping("/{orderId}/delivery")
    public ResponseEntity<String> updateDelivery(@PathVariable int orderId, @RequestBody DeliveryReq dto) {
        orderService.updateDelivery(orderId, dto);
        return ResponseEntity.ok("Delivery updated successfully!");
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<String> deleteOrder(@PathVariable int orderId) {
        if (orderService.deleteOrder(orderId)){
            return ResponseEntity.ok("Order deleted successfully!");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{orderId}/delivery")
    public ResponseEntity<String> deleteDelivery(@PathVariable int orderId) {
        if (orderService.deleteDelivery(orderId)){
            return ResponseEntity.ok("Delivery deleted successfully!");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
