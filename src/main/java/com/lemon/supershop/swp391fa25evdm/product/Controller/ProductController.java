package com.lemon.supershop.swp391fa25evdm.product.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductReq;
import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductRes;
import com.lemon.supershop.swp391fa25evdm.product.service.ProductService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*")
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

    @GetMapping("/search/dealerCategory/{dealerCategoryId}")
    public ResponseEntity<List<ProductRes>> getProductsByDealerCategoryId(@PathVariable int dealerCategoryId) {
        List<ProductRes> products = productService.getProductByDealerCategoryId(dealerCategoryId);
        return ResponseEntity.ok(products);
    }

    // Get available test drive vehicles (not currently assigned to active test drives)
    @GetMapping("/available-testdrive")
    public ResponseEntity<List<ProductRes>> getAvailableTestDriveProducts() {
        List<ProductRes> products = productService.getAvailableTestDriveProducts();
        return ResponseEntity.ok(products);
    }

    // Get available test drive vehicles by category
    @GetMapping("/available-testdrive/category/{categoryId}")
    public ResponseEntity<List<ProductRes>> getAvailableTestDriveProductsByCategory(@PathVariable int categoryId) {
        List<ProductRes> products = productService.getAvailableTestDriveProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }

    // Get available test drive vehicles by dealer category
    @GetMapping("/available-testdrive/dealerCategory/{dealerCategoryId}")
    public ResponseEntity<List<ProductRes>> getAvailableTestDriveProductsByDealerCategory(@PathVariable int dealerCategoryId) {
        List<ProductRes> products = productService.getAvailableTestDriveProductsByDealerCategory(dealerCategoryId);
        return ResponseEntity.ok(products);
    }

    @PostMapping("/addProduct")
    public ResponseEntity<ProductRes> addProduct(@RequestBody ProductReq productReq) {
        ProductRes createdProduct = productService.createProduct(productReq);
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
