package com.lemon.supershop.swp391fa25evdm.distribution.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.category.repository.CategoryRepository;
import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerRes;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.distribution.model.dto.*;
import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductRes;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;
import com.lemon.supershop.swp391fa25evdm.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// ❌ Xóa CategoryRepository import - không dùng
// import com.lemon.supershop.swp391fa25evdm.category.repository.CategoryRepository;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import com.lemon.supershop.swp391fa25evdm.distribution.model.entity.Distribution;
import com.lemon.supershop.swp391fa25evdm.distribution.model.entity.DistributionItem;
import com.lemon.supershop.swp391fa25evdm.distribution.repository.DistributionRepo;

@Service
public class DistributionService {

    @Autowired
    private DistributionRepo distributionRepo;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private DealerRepo dealerRepo;
    // ❌ Xóa: @Autowired private ContractRepo contractRepo;
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private ProductService productService;

    // ===== WORKFLOW METHODS =====

    // Step 1: EVM Staff gửi lời mời
    public DistributionRes sendInvitation(DistributionInvitationReq req) {
        Distribution distribution = new Distribution();
        
        // Set dealer
        Optional<Dealer> dealer = dealerRepo.findById(req.getDealerId());
        if (!dealer.isPresent()) {
            throw new RuntimeException("Dealer not found with id: " + req.getDealerId());
        }
        distribution.setDealer(dealer.get());
        
        // Category is optional - will be set later when dealer submits order
        // distribution.setCategory(category.get());
        
        // Set invitation details
        distribution.setInvitationMessage(req.getInvitationMessage());
        distribution.setDeadline(req.getDeadline());
        distribution.setStatus("INVITED");
        distribution.setInvitedAt(LocalDateTime.now());
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // Step 2: Dealer Manager phản hồi lời mời
    public DistributionRes respondToInvitation(int id, DistributionResponseReq req) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status
        if (!"INVITED".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected INVITED, got: " + distribution.getStatus());
        }
        
        // Update status based on response
        distribution.setStatus(req.getResponse()); // "ACCEPTED" or "DECLINED"
        distribution.setDealerNotes(req.getDealerNotes());
        // ❌ Xóa: distribution.setRespondedAt(LocalDateTime.now());
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // LUỒNG MỚI: Dealer Manager tạo yêu cầu xe trực tiếp (Pull Model)
    // Bỏ qua bước invitation, trực tiếp tạo distribution với status PENDING
    public DistributionRes createDealerRequest(DistributionOrderReq req) {
        // Validate dealerId
        if (req.getDealerId() == null) {
            throw new RuntimeException("Dealer ID is required");
        }

        // Validate dealer exists
        Optional<Dealer> dealer = dealerRepo.findById(req.getDealerId());
        if (!dealer.isPresent()) {
            throw new RuntimeException("Dealer not found with id: " + req.getDealerId());
        }

        // Create new distribution
        Distribution distribution = new Distribution();
        distribution.setDealer(dealer.get());
        distribution.setStatus("PENDING"); // Directly set to PENDING (bypass invitation flow)
        distribution.setInvitedAt(LocalDateTime.now());

        // Build items and aggregate quantity
        int totalQty = 0;
        List<DistributionItem> targetItems = new ArrayList<>();

        if (req.getItems() != null && !req.getItems().isEmpty()) {
            for (DistributionOrderItemReq item : req.getItems()) {
                // Validate quantity first
                if (item.getQuantity() == null || item.getQuantity() <= 0) {
                    continue; // skip invalid rows silently
                }

                // ✅ HỖ TRỢ CẢ 2 CÁCH: productId HOẶC categoryId
                Product productTemplate = null;

                if (item.getProductId() != null) {
                    // Cách 1: Đặt theo productId cụ thể
                    Optional<Product> productOpt = productRepo.findById(item.getProductId());
                    if (productOpt.isEmpty()) {
                        continue; // skip if product not found
                    }
                    productTemplate = productOpt.get();
                } else if (item.getCategoryId() != null) {
                    // Cách 2: Đặt theo categoryId
                    Optional<Category> categoryOpt = categoryRepository.findById(item.getCategoryId());
                    if (categoryOpt.isEmpty()) {
                        throw new RuntimeException("Category không tồn tại với ID: " + item.getCategoryId());
                    }

                    // Tìm product mẫu trong category này (để hiển thị thông tin)
                    List<Product> productsInCategory = productRepo.findByCategoryId(item.getCategoryId());
                    if (!productsInCategory.isEmpty()) {
                        productTemplate = productsInCategory.get(0); // Lấy product đầu tiên làm template
                    } else {
                        // Tạo template product để lưu thông tin category
                        // Product thật sẽ được tạo khi dealer xác nhận nhận hàng
                        Product template = new Product();
                        template.setName(categoryOpt.get().getName());
                        template.setCategory(categoryOpt.get());
                        template.setStatus(com.lemon.supershop.swp391fa25evdm.product.model.enums.ProductStatus.INACTIVE);
                        template.setBattery(0);
                        template.setHp(0);
                        template.setTorque(0);
                        template.setRange(0);
                        template.setDealerPrice(categoryOpt.get().getBasePrice());
                        template.setManufacture_date(new java.util.Date());
                        template.setVinNum(null); // Không hiển thị
                        template.setEngineNum(null); // Không hiển thị
                        productTemplate = productRepo.save(template);
                    }
                } else {
                    // Không có productId và categoryId → skip
                    continue;
                }

                // Tạo DistributionItem
                DistributionItem di = new DistributionItem();
                di.setDistribution(distribution);
                di.setProduct(productTemplate);
                di.setColor(item.getColor());
                di.setQuantity(item.getQuantity());
                targetItems.add(di);
                totalQty += item.getQuantity();
            }
        }

        // If no valid items, reject
        if (targetItems.isEmpty()) {
            throw new RuntimeException("Không có sản phẩm hợp lệ trong đơn hàng (productId/categoryId không tồn tại hoặc số lượng không hợp lệ)");
        }

        // Set items
        distribution.setItems(targetItems);

        // Set order details
        distribution.setRequestedQuantity(totalQty > 0 ? totalQty : null);
        distribution.setRequestedDeliveryDate(req.getRequestedDeliveryDate());
        distribution.setDealerNotes(req.getDealerNotes());

        // Save and return
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // Step 3: Dealer Manager tạo đơn hàng (nếu đã ACCEPTED)
    public DistributionRes submitOrder(int id, DistributionOrderReq req) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status
        if (!"ACCEPTED".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected ACCEPTED, got: " + distribution.getStatus());
        }
        
        // Build items and aggregate quantity (update collection IN-PLACE to avoid orphanRemoval issues)
        int totalQty = 0;
        List<DistributionItem> targetItems = distribution.getItems();
        if (targetItems == null) {
            targetItems = new ArrayList<>();
            distribution.setItems(targetItems);
        } else {
            targetItems.clear();
        }
        
        if (req.getItems() != null && !req.getItems().isEmpty()) {
            for (DistributionOrderItemReq item : req.getItems()) {
                // Validate quantity first
                if (item.getQuantity() == null || item.getQuantity() <= 0) {
                    continue; // skip invalid rows silently
                }
                
                // ✅ HỖ TRỢ CẢ 2 CÁCH: productId HOẶC categoryId
                Product productTemplate = null;
                
                if (item.getProductId() != null) {
                    // Cách 1: Đặt theo productId cụ thể
                    Optional<Product> productOpt = productRepo.findById(item.getProductId());
                    if (productOpt.isEmpty()) {
                        continue; // skip if product not found
                    }
                    productTemplate = productOpt.get();
                } else if (item.getCategoryId() != null) {
                    // Cách 2: Đặt theo categoryId
                    // Tìm 1 product template trong category (để hiển thị thông tin)
                    Optional<Category> categoryOpt = categoryRepository.findById(item.getCategoryId());
                    if (categoryOpt.isEmpty()) {
                        throw new RuntimeException("Category không tồn tại với ID: " + item.getCategoryId());
                    }
                    
                    // Tìm product mẫu trong category này
                    List<Product> productsInCategory = productRepo.findByCategoryId(item.getCategoryId());
                    if (!productsInCategory.isEmpty()) {
                        productTemplate = productsInCategory.get(0); // Lấy product đầu tiên làm template
                    } else {
                        // Tạo template product để lưu thông tin category
                        // Product thật sẽ được tạo khi dealer xác nhận nhận hàng
                        Product template = new Product();
                        template.setName(categoryOpt.get().getName());
                        template.setCategory(categoryOpt.get());
                        template.setStatus(com.lemon.supershop.swp391fa25evdm.product.model.enums.ProductStatus.INACTIVE);
                        template.setBattery(0);
                        template.setHp(0);
                        template.setTorque(0);
                        template.setRange(0);
                        template.setDealerPrice(categoryOpt.get().getBasePrice());
                        template.setManufacture_date(new java.util.Date());
                        template.setVinNum(null); // Không hiển thị
                        template.setEngineNum(null); // Không hiển thị
                        productTemplate = productRepo.save(template);
                    }
                } else {
                    // Không có productId và categoryId → skip
                    continue;
                }
                
                // Tạo DistributionItem
                DistributionItem di = new DistributionItem();
                di.setDistribution(distribution);
                di.setProduct(productTemplate);
                di.setColor(item.getColor());
                di.setQuantity(item.getQuantity());
                targetItems.add(di);
                totalQty += item.getQuantity();
            }
        }

        // If no valid items, reject to avoid saving empty orders silently
        if (targetItems.isEmpty()) {
            throw new RuntimeException("Không có sản phẩm hợp lệ trong đơn hàng (productId/categoryId không tồn tại hoặc số lượng không hợp lệ)");
        }

        // Set order details
        distribution.setRequestedQuantity(totalQty > 0 ? totalQty : null);
        distribution.setRequestedDeliveryDate(req.getRequestedDeliveryDate());
        if (req.getDealerNotes() != null) {
            distribution.setDealerNotes(req.getDealerNotes());
        }
        distribution.setStatus("PENDING");
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // Step 4: EVM Staff duyệt đơn
    public DistributionRes approveOrder(int id, DistributionApprovalReq req) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status
        if (!"PENDING".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected PENDING, got: " + distribution.getStatus());
        }
        
        // If CONFIRMED, require manufacturerPrice and approvedQuantity
        if ("CONFIRMED".equals(req.getDecision())) {
            if (req.getManufacturerPrice() == null || req.getManufacturerPrice() <= 0) {
                throw new RuntimeException("Manufacturer price is required when approving");
            }
            if (req.getApprovedQuantity() == null || req.getApprovedQuantity() <= 0) {
                throw new RuntimeException("Approved quantity is required when approving");
            }
            
            // 🔥 XỬ LÝ GIÁ RIÊNG CHO TỪNG ITEM (nếu có)
            if (req.getItems() != null && !req.getItems().isEmpty() && distribution.getItems() != null) {
                // EVM đã set giá riêng cho từng item
                for (DistributionItemPriceReq itemPrice : req.getItems()) {
                    if (itemPrice.getDistributionItemId() != null) {
                        // Tìm DistributionItem tương ứng
                        for (DistributionItem dItem : distribution.getItems()) {
                            if (dItem.getId() == itemPrice.getDistributionItemId()) {
                                // Update dealer price if provided
                                if (itemPrice.getDealerPrice() != null) {
                                    dItem.setDealerPrice(itemPrice.getDealerPrice());
                                }
                                // Update approved quantity if provided
                                if (itemPrice.getApprovedQuantity() != null && itemPrice.getApprovedQuantity() > 0) {
                                    dItem.setQuantity(itemPrice.getApprovedQuantity());
                                }
                                break;
                            }
                        }
                    }
                }
                // Lưu lại các items đã cập nhật giá
                distributionRepo.save(distribution);
            }
            
            // Update category base price with manufacturer price (giá cao nhất để tham khảo)
            updateCategoryBasePriceFromDistribution(distribution, req.getManufacturerPrice());
            
            // Always send price to dealer for confirmation (regardless of quantity match)
            // Dealer must accept the price before proceeding to delivery planning
            distribution.setStatus("PRICE_SENT");
            
            // Giá chung (sẽ là giá cao nhất hoặc giá trung bình để tham khảo)
            distribution.setManufacturerPrice(req.getManufacturerPrice());
            distribution.setEvmNotes(req.getEvmNotes());
        } else {
            // CANCELED
            distribution.setStatus(req.getDecision());
            distribution.setEvmNotes(req.getEvmNotes());
        }
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // Step 4a: Dealer Manager phản hồi về giá hãng (chấp nhận hoặc từ chối)
    public DistributionRes respondToPrice(int id, String decision, String dealerNotes) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status
        if (!"PRICE_SENT".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected PRICE_SENT, got: " + distribution.getStatus());
        }
        
        if ("PRICE_ACCEPTED".equals(decision)) {
            distribution.setStatus("CONFIRMED");
        } else if ("PRICE_REJECTED".equals(decision)) {
            distribution.setStatus("PRICE_REJECTED");
        } else {
            throw new RuntimeException("Invalid decision. Expected PRICE_ACCEPTED or PRICE_REJECTED");
        }
        
        if (dealerNotes != null && !dealerNotes.isEmpty()) {
            String existing = distribution.getDealerNotes();
            distribution.setDealerNotes(existing != null ? existing + " | " + dealerNotes : dealerNotes);
        }
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // Step 5: EVM Staff lên kế hoạch giao hàng
    public DistributionRes planDelivery(int id, DistributionPlanningReq req) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status
        if (!"CONFIRMED".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected CONFIRMED, got: " + distribution.getStatus());
        }
        
        // Set planning details
        distribution.setEstimatedDeliveryDate(req.getEstimatedDeliveryDate());
        // ❌ Xóa: distribution.setActualQuantity(req.getActualQuantity());
        if (req.getEvmNotes() != null) {
            distribution.setEvmNotes(req.getEvmNotes());
        }
        distribution.setStatus("PLANNED");
        // ❌ Xóa: distribution.setPlannedAt(LocalDateTime.now());
        
        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    // Step 6: Dealer Manager xác nhận nhận hàng
    public DistributionRes confirmReceived(int id, DistributionCompletionReq req) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status
        if (!"PLANNED".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected PLANNED, got: " + distribution.getStatus());
        }
        
        // Ensure received quantities and auto create products if item breakdown provided
        int totalReceived = req.getReceivedQuantity() != null ? req.getReceivedQuantity() : 0;
        if (req.getItems() != null && distribution.getItems() != null) {
            // Build map for quick lookup of order quantities by distributionItemId
            java.util.Map<Integer, DistributionItem> orderMap = new java.util.HashMap<>();
            for (DistributionItem di : distribution.getItems()) {
                orderMap.put(di.getId(), di);
            }

            // Validate and sum received, and auto-create products
            int calcSum = 0;
            for (DistributionReceivedItemReq ir : req.getItems()) {
                if (ir == null || ir.getDistributionItemId() == null) continue;
                DistributionItem orderedItem = orderMap.get(ir.getDistributionItemId());
                if (orderedItem == null) {
                    throw new RuntimeException("Distribution item not found: " + ir.getDistributionItemId());
                }
                int orderedQty = orderedItem.getQuantity() != null ? orderedItem.getQuantity() : 0;
                int recv = ir.getReceivedQuantity() != null ? ir.getReceivedQuantity() : 0;
                if (recv < 0) recv = 0;
                if (recv > orderedQty) {
                    throw new RuntimeException("Số lượng nhận vượt quá số đã đặt cho dòng: " + orderedItem.getId());
                }
                calcSum += recv;

                if (recv > 0) {
                    Product template = orderedItem.getProduct();
                    
                    // Xác định giá HÃNG (manufacturer price) - Ưu tiên:
                    // 1. Giá từ DistributionReceivedItemReq (dealer có thể cập nhật khi nhận hàng)
                    // 2. Giá từ DistributionItem (giá đã set cho từng item)
                    // 3. Giá chung từ Distribution.manufacturerPrice (fallback)
                    // 4. Giá từ Category basePrice (fallback cuối)
                    long manufacturerPriceValue = 0L;
                    if (ir.getDealerPrice() != null) {
                        manufacturerPriceValue = ir.getDealerPrice().longValue();
                    } else if (orderedItem.getDealerPrice() != null) {
                        manufacturerPriceValue = orderedItem.getDealerPrice().longValue();
                    } else if (distribution.getManufacturerPrice() != null) {
                        manufacturerPriceValue = distribution.getManufacturerPrice().longValue();
                    } else if (template != null && template.getCategory() != null) {
                        manufacturerPriceValue = template.getCategory().getBasePrice();
                    }
                    
                    for (int i = 0; i < recv; i++) {
                        Product p = new Product();
                        // Copy basics from template if available
                        if (template != null) {
                            p.setName(template.getName());
                            p.setBattery(Math.max(0, template.getBattery()));
                            p.setHp(Math.max(0, template.getHp()));
                            p.setTorque(Math.max(0, template.getTorque()));
                            p.setImage(template.getImage());
                            p.setDescription(template.getDescription());
                            if (template.getCategory() != null) {
                                p.setCategory(template.getCategory());
                            }
                        }
                        
                        // ✅ SET MANUFACTURER PRICE (chỉ set 1 lần duy nhất, không được đổi)
                        if (manufacturerPriceValue > 0) {
                            p.setManufacturerPrice(manufacturerPriceValue);
                        }
                        
                        // ✅ SET RETAIL PRICE = MANUFACTURER PRICE (dealer có thể update sau)
                        if (manufacturerPriceValue > 0) {
                            p.setRetailPrice(manufacturerPriceValue);
                        }
                        
                        // Legacy dealer price (backward compatibility)
                        p.setDealerPrice(manufacturerPriceValue);
                        
                        // Link to this distribution and set color from item
                        p.setDistribution(distribution);
                        p.setColor(orderedItem.getColor());
                        // Defaults requested: VIN/Engine auto in SAME pattern as UI, range 0, manufacture date today, status ACTIVE
                        String uniqueCode = generateUniqueCode();
                        p.setVinNum("VIN-" + uniqueCode);
                        p.setEngineNum("ENG-" + uniqueCode);
                        p.setRange(0);
                        // Manufacture date giữ nguyên theo template hoặc set hôm nay
                        p.setManufacture_date(new java.util.Date());
                        // Tự động set ngày nhập kho = actualDeliveryDate (nếu có) hoặc ngày hiện tại
                        java.util.Date stockIn = (req.getActualDeliveryDate() != null)
                                ? java.util.Date.from(req.getActualDeliveryDate().atZone(ZoneId.systemDefault()).toInstant())
                                : new java.util.Date();
                        p.setStockInDate(stockIn);
                        // 🔧 SỬA: Set INACTIVE khi nhập kho - Dealer staff sẽ đăng lên showroom sau
                        p.setStatus(com.lemon.supershop.swp391fa25evdm.product.model.enums.ProductStatus.INACTIVE);
                        productRepo.save(p);
                    }
                }
            }
            totalReceived = calcSum; // derive total from items to avoid mismatch
        }

        // Set completion details using derived totals
        distribution.setReceivedQuantity(totalReceived > 0 ? totalReceived : null);
        distribution.setActualDeliveryDate(req.getActualDeliveryDate());
        distribution.setFeedback(req.getFeedback());
        distribution.setStatus("COMPLETED");
        // ❌ Xóa: distribution.setCompletedAt(LocalDateTime.now());

        distributionRepo.save(distribution);
        return convertToRes(distribution);
    }

    private static final Random RNG = new Random();

    // Match UI pattern: VIN-<timestamp><3-digit-random> and ENG- same suffix
    private String generateUniqueCode() {
        long ts = System.currentTimeMillis();
        int rnd = RNG.nextInt(1000); // 0..999
        return String.valueOf(ts) + String.format("%03d", rnd);
    }

    // Generate mã cố định từ ID (hash deterministic - không đổi khi load lại)
    // Ví dụ: ID=13 → luôn ra "7K3M", ID=42 → luôn ra "G9X2"
    private String generateCodeFromId(int id) {
        String chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        // Dùng ID làm seed để hash thành 4 ký tự
        int hash = id * 31 + 12345; // Prime multiplier cho distribution tốt
        StringBuilder sb = new StringBuilder(4);
        for (int i = 0; i < 4; i++) {
            hash = hash * 1103515245 + 12345; // Linear congruential generator
            int index = Math.abs(hash) % chars.length();
            sb.append(chars.charAt(index));
        }
        return sb.toString();
    }

    /**
     * Helper: Cập nhật giá tham khảo của Category từ Distribution
     * 
     * LƯU Ý VỀ CƠ CHẾ GIÁ:
     * - Category.basePrice: Giá tham khảo/mặc định của danh mục = GIÁ CAO NHẤT từ các DistributionItem
     * - DistributionItem.dealerPrice: Giá RIÊNG của từng item (mỗi xe một giá)
     * - Product.dealerPrice: Giá thực tế của từng xe khi nhập kho (copy từ DistributionItem)
     * 
     * => MỖI XE CÓ GIÁ RIÊNG, Category.basePrice chỉ để tham khảo (lấy giá cao nhất)!
     */
    private void updateCategoryBasePriceFromDistribution(Distribution distribution, Double manufacturerPrice) {
        if (distribution.getItems() == null || distribution.getItems().isEmpty()) {
            return; // No items, cannot determine category
        }
        
        // ✅ TÌM GIÁ CAO NHẤT từ các DistributionItem
        long maxPrice = 0L;
        Category targetCategory = null;
        
        for (DistributionItem item : distribution.getItems()) {
            if (item.getProduct() != null && item.getProduct().getCategory() != null) {
                if (targetCategory == null) {
                    targetCategory = item.getProduct().getCategory();
                }
                
                // Lấy giá từ DistributionItem (ưu tiên) hoặc manufacturerPrice (fallback)
                long itemPrice = 0L;
                if (item.getDealerPrice() != null) {
                    itemPrice = item.getDealerPrice().longValue();
                } else if (manufacturerPrice != null) {
                    itemPrice = manufacturerPrice.longValue();
                }
                
                // Cập nhật giá cao nhất
                if (itemPrice > maxPrice) {
                    maxPrice = itemPrice;
                }
            }
        }
        
        // Cập nhật Category basePrice = giá cao nhất
        if (targetCategory != null && maxPrice > 0) {
            long oldBasePrice = targetCategory.getBasePrice();
            targetCategory.setBasePrice(maxPrice);
            categoryRepository.save(targetCategory);
            
            // Log the update với giá cũ và mới
            System.out.println("✅ Updated Category ID " + targetCategory.getId() + " (" + targetCategory.getName() + ")");
            System.out.println("   Old basePrice: " + oldBasePrice);
            System.out.println("   New basePrice: " + maxPrice + " (GIÁ CAO NHẤT từ distribution items)");
        }
    }

    // ===== EXISTING METHODS (updated) =====


    public List<DistributionRes> getAllDistributions() {
        List<Distribution> distributions = distributionRepo.findAll();
        return distributions.stream().map(this::convertToRes).toList();
    }

    public DistributionRes getDistributionById(int id) {
        return distributionRepo.findById(id)
                .map(this::convertToRes)
                .orElseThrow(() -> new RuntimeException("Distribution not found with id: " + id));
    }

    // ❌ Xóa method không dùng
    // public List<DistributionRes> getDistributionsByCategoryId(int categoryId) {
    //     List<Distribution> distributions = distributionRepo.findByCategoryId(categoryId);
    //     return distributions.stream().map(this::convertToRes).toList();
    // }

    public List<DistributionRes> getDistributionsByDealerId(int dealerId) {
        List<Distribution> distributions = distributionRepo.findByDealerId(dealerId);
        return distributions.stream().map(this::convertToRes).toList();
    }

    // ❌ Xóa method không dùng Contract
    // public List<DistributionRes> getDistributionsByContractId(int contractId) {
    //     List<Distribution> distributions = distributionRepo.findByContractId(contractId);
    //     return distributions.stream().map(this::convertToRes).toList();
    // }

    public DistributionRes createDistribution(DistributionReq req) {
        Distribution distribution = new Distribution();
        Distribution distribution1 = convertToEntity(distribution, req);
        distributionRepo.save(distribution1);
        return convertToRes(distribution1);
    }

    public DistributionRes updateDistribution(int id, DistributionReq req) {
        Optional<Distribution> distribution = distributionRepo.findById(id);
        if (distribution.isPresent()) {
            Distribution distribution1 = convertToEntity(distribution.get(), req);
            distributionRepo.save(distribution1);
            return convertToRes(distribution1);
        }
        return null;
    }

    public boolean deleteDistribution(int id) {
        if (distributionRepo.existsById(id)) {
            distributionRepo.deleteById(id);
            return true;
        }
        return false;
    }

    private Distribution convertToEntity(Distribution distribution ,DistributionReq req) {
        if (distribution != null){
            if (!req.getProductId().isEmpty()){
                List<Product> validProducts = new ArrayList<>();
                for (Integer Req : req.getProductId()) {
                    Optional<Product> productOpt = productRepo.findById(Req);
                    if (productOpt.isPresent()) {
                        validProducts.add(productOpt.get());
                    }
                }
                if (!validProducts.isEmpty()){
                    distribution.setProducts(validProducts);
                }
            }
            // ❌ Xóa Category handling - không dùng
            // if (req.getCategoryId() > 0){
            //     Optional<Category> category = categoryRepository.findById(req.getCategoryId());
            //     if (category.isPresent()){
            //         distribution.setCategory(category.get());
            //     }
            // }
            if (req.getDealerId() > 0){
                Optional<Dealer> dealer = dealerRepo.findById(req.getDealerId());
                if (dealer.isPresent()){
                    distribution.setDealer(dealer.get());
                }
            }
            // ❌ Xóa Contract handling
            // if (req.getContractId() > 0){
            //     Optional<Contract> contract = contractRepo.findById(req.getContractId());
            //     if (contract.isPresent()){
            //         distribution.setContract(contract.get());
            //     }
            // }
            return distribution;
        }
        return null;
    }

    private DistributionRes convertToRes(Distribution distribution) {
        DistributionRes res = new DistributionRes();
        res.setId(distribution.getId());
        
        // Generate mã phân phối cố định từ ID: PP{year}-{hash4} (ví dụ: PP2025-7K3M)
        // Mã không đổi mỗi lần load vì hash từ ID
        int year = java.time.Year.now().getValue();
        String hashCode = generateCodeFromId(distribution.getId());
        String code = String.format("PP%d-%s", year, hashCode);
        res.setCode(code);
        
        res.setStatus(distribution.getStatus());
        
        // ❌ Xóa Category conversion - không dùng
        // if (distribution.getCategory() != null) {
        //     CategoryRes categoryRes = new CategoryRes();
        //     categoryRes.setId(distribution.getCategory().getId());
        //     categoryRes.setName(distribution.getCategory().getName());
        //     res.setCategory(categoryRes);
        // }
        
        // Convert Dealer
        if (distribution.getDealer() != null) {
            DealerRes dealerRes = new DealerRes();
            dealerRes.setId(distribution.getDealer().getId());
            dealerRes.setName(distribution.getDealer().getName());
            res.setDealer(dealerRes);
        }
        
        // Convert Products (legacy)
        if (distribution.getProducts() != null && !distribution.getProducts().isEmpty()) {
            List<ProductRes> productResList = new ArrayList<>();
            for (Product product : distribution.getProducts()) {
                ProductRes productRes = productService.convertToRes(product);
                productResList.add(productRes);
            }
            res.setProducts(productResList);
        }
        // Convert Items (new)
        if (distribution.getItems() != null && !distribution.getItems().isEmpty()) {
            List<DistributionItemRes> itemResList = new ArrayList<>();
            for (DistributionItem di : distribution.getItems()) {
                DistributionItemRes ir = new DistributionItemRes();
                ir.setId(di.getId());
                if (di.getProduct() != null) {
                    ProductRes pr = productService.convertToRes(di.getProduct());
                    ir.setProduct(pr);
                }
                ir.setColor(di.getColor());
                ir.setQuantity(di.getQuantity());
                ir.setDealerPrice(di.getDealerPrice()); // 🔥 SET DEALER PRICE
                itemResList.add(ir);
            }
            res.setItems(itemResList);
        }
        
        // Set messages/notes
        res.setInvitationMessage(distribution.getInvitationMessage());
        res.setDealerNotes(distribution.getDealerNotes());
        res.setEvmNotes(distribution.getEvmNotes());
        res.setFeedback(distribution.getFeedback());
        
        // Set timeline - CHỈ 2 FIELD ĐANG DÙNG
        res.setCreatedAt(distribution.getCreatedAt());
        res.setInvitedAt(distribution.getInvitedAt());
        // ❌ Xóa 5 timeline fields không dùng
        // res.setRespondedAt(distribution.getRespondedAt());
        // res.setSubmittedAt(distribution.getSubmittedAt());
        // res.setApprovedAt(distribution.getApprovedAt());
        // res.setPlannedAt(distribution.getPlannedAt());
        // res.setCompletedAt(distribution.getCompletedAt());
        
        // Set dates
        res.setDeadline(distribution.getDeadline());
        res.setRequestedDeliveryDate(distribution.getRequestedDeliveryDate());
        res.setEstimatedDeliveryDate(distribution.getEstimatedDeliveryDate());
        res.setActualDeliveryDate(distribution.getActualDeliveryDate());
        
        // Set quantities - CHỈ 2 FIELD ĐANG DÙNG
        res.setRequestedQuantity(distribution.getRequestedQuantity());
        res.setReceivedQuantity(distribution.getReceivedQuantity());
        // ❌ Xóa 2 quantity fields không dùng
        // res.setApprovedQuantity(distribution.getApprovedQuantity());
        // res.setActualQuantity(distribution.getActualQuantity());
        
        res.setManufacturerPrice(distribution.getManufacturerPrice());
        
        return res;
    }
}
