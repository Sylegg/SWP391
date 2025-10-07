package com.lemon.supershop.swp391fa25evdm.product.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductReq;
import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductRes;
import com.lemon.supershop.swp391fa25evdm.product.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/listProducts")
    public ResponseEntity<List<ProductRes>> getAllProducts() {
        List<ProductRes> products = productService.findAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search/id/{id}")
    public ResponseEntity<ProductRes> getProductById(@PathVariable int id) {
        ProductRes product = productService.findProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/search/name/{name}")
    public ResponseEntity<List<ProductRes>> getProductByName(@PathVariable String name) {
        List<ProductRes> products = productService.getProductByName(name);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search/vin/{vinNum}")
    public ResponseEntity<List<ProductRes>> getProductByVinNum(@PathVariable String vinNum) {
        List<ProductRes> products = productService.getProductByVinNum(vinNum);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search/engine/{engineNum}")
    public ResponseEntity<List<ProductRes>> getProductByEngineNum(@PathVariable String engineNum) {
        List<ProductRes> products = productService.getProductByEngineNum(engineNum);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search/category/{categoryId}")
    public ResponseEntity<List<ProductRes>> getProductsByCategoryId(@PathVariable Integer categoryId) {
        List<ProductRes> products = productService.getProductByCategoryId(categoryId);
        return ResponseEntity.ok(products);
    }

    @PostMapping("/addProduct")
    public ResponseEntity<ProductRes> addProduct(@RequestBody ProductReq productReq) {
        ProductRes createdProduct = productService.addProduct(productReq);
        if (createdProduct != null) {
            return ResponseEntity.ok(createdProduct);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductRes> updateProduct(@PathVariable int id, @RequestBody ProductReq productReq) {
        ProductRes updatedProduct = productService.updateProduct(id, productReq);
        if (updatedProduct != null) {
            return ResponseEntity.ok(updatedProduct);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id) {
        if (productService.deleteProductById(id)){
            return ResponseEntity.ok("Product deleted successfully");
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
