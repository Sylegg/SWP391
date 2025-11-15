package com.lemon.supershop.swp391fa25evdm.distribution.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.category.repository.CategoryRepository;
import com.lemon.supershop.swp391fa25evdm.category.service.CategoryService;
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
    @Autowired
    private CategoryService categoryService;

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
                    // Cách 2: Đặt theo categoryId - KHÔNG tạo product, chỉ lưu categoryId
                    Optional<Category> categoryOpt = categoryRepository.findById(item.getCategoryId());
                    if (categoryOpt.isEmpty()) {
                        throw new RuntimeException("Category không tồn tại với ID: " + item.getCategoryId());
                    }

                    // ❌ KHÔNG tạo product template nữa
                    // ✅ Tìm product mẫu nếu có (để hiển thị thông tin)
                    List<Product> productsInCategory = productRepo.findByCategoryId(item.getCategoryId());
                    if (!productsInCategory.isEmpty()) {
                        productTemplate = productsInCategory.get(0); // Dùng làm reference
                    }
                    // Nếu chưa có product nào → productTemplate = null, sẽ lưu categoryId
                } else {
                    // Không có productId và categoryId → skip
                    continue;
                }

                // Tạo DistributionItem
                DistributionItem di = new DistributionItem();
                di.setDistribution(distribution);
                
                if (productTemplate != null) {
                    di.setProduct(productTemplate);
                } else if (item.getCategoryId() != null) {
                    // Đặt theo category nhưng chưa có product → lưu categoryId
                    di.setCategoryId(item.getCategoryId());
                }
                
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
                    // Cách 2: Đặt theo categoryId - KHÔNG tạo product
                    Optional<Category> categoryOpt = categoryRepository.findById(item.getCategoryId());
                    if (categoryOpt.isEmpty()) {
                        throw new RuntimeException("Category không tồn tại với ID: " + item.getCategoryId());
                    }
                    
                    // ❌ KHÔNG tạo product template nữa
                    // ✅ Tìm product mẫu nếu có (để hiển thị thông tin)
                    List<Product> productsInCategory = productRepo.findByCategoryId(item.getCategoryId());
                    if (!productsInCategory.isEmpty()) {
                        productTemplate = productsInCategory.get(0);
                    }
                    // Nếu chưa có product nào → productTemplate = null
                } else {
                    // Không có productId và categoryId → skip
                    continue;
                }
                
                // Tạo DistributionItem
                DistributionItem di = new DistributionItem();
                di.setDistribution(distribution);
                
                if (productTemplate != null) {
                    di.setProduct(productTemplate);
                } else if (item.getCategoryId() != null) {
                    // Đặt theo category nhưng chưa có product → lưu categoryId
                    di.setCategoryId(item.getCategoryId());
                }
                
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

    // Step 4b: EVM Staff gửi lại giá mới (khi dealer từ chối giá cũ)
    public DistributionRes resendPrice(int id, DistributionApprovalReq req) {
        Optional<Distribution> opt = distributionRepo.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Distribution not found with id: " + id);
        }
        
        Distribution distribution = opt.get();
        
        // Validate status - chỉ cho phép khi dealer đã từ chối giá
        if (!"PRICE_REJECTED".equals(distribution.getStatus())) {
            throw new RuntimeException("Invalid status. Expected PRICE_REJECTED, got: " + distribution.getStatus());
        }
        
        // Validate input
        if (req.getManufacturerPrice() == null || req.getManufacturerPrice() <= 0) {
            throw new RuntimeException("Manufacturer price is required when resending price");
        }
        if (req.getApprovedQuantity() == null || req.getApprovedQuantity() <= 0) {
            throw new RuntimeException("Approved quantity is required");
        }
        
        // 🔥 XỬ LÝ GIÁ RIÊNG CHO TỪNG ITEM (nếu có)
        if (req.getItems() != null && !req.getItems().isEmpty() && distribution.getItems() != null) {
            for (DistributionItemPriceReq itemPrice : req.getItems()) {
                if (itemPrice.getDistributionItemId() != null) {
                    for (DistributionItem dItem : distribution.getItems()) {
                        if (dItem.getId() == itemPrice.getDistributionItemId()) {
                            // Update dealer price
                            if (itemPrice.getDealerPrice() != null) {
                                dItem.setDealerPrice(itemPrice.getDealerPrice());
                            }
                            // Update approved quantity
                            if (itemPrice.getApprovedQuantity() != null && itemPrice.getApprovedQuantity() > 0) {
                                dItem.setQuantity(itemPrice.getApprovedQuantity());
                            }
                            break;
                        }
                    }
                }
            }
            distributionRepo.save(distribution);
        }
        
        // Update category base price
        updateCategoryBasePriceFromDistribution(distribution, req.getManufacturerPrice());
        
        // 🔥 GIỮ NGUYÊN phần "Duyệt theo dòng" gốc, chỉ cập nhật GIÁ mới
        String existingEvmNotes = distribution.getEvmNotes();
        String newEvmNotes = req.getEvmNotes();
        
        if (existingEvmNotes != null && existingEvmNotes.contains("Duyệt theo dòng:")) {
            // Tách phần "Duyệt theo dòng: ..." từ evmNotes cũ
            String approvalPart = existingEvmNotes;
            if (existingEvmNotes.contains(" | Ghi chú:")) {
                approvalPart = existingEvmNotes.split(" \\| Ghi chú:")[0];
            } else if (existingEvmNotes.contains(" | Dealer:")) {
                approvalPart = existingEvmNotes.split(" \\| Dealer:")[0];
            }
            
            // Cập nhật lại GIÁ trong approvalPart nếu có thông tin mới từ req.getEvmNotes()
            if (newEvmNotes != null && newEvmNotes.contains("Duyệt theo dòng:")) {
                // Lấy phần giá mới từ newEvmNotes
                String newApprovalPart = newEvmNotes;
                if (newEvmNotes.contains(" | Ghi chú:")) {
                    newApprovalPart = newEvmNotes.split(" \\| Ghi chú:")[0];
                }
                approvalPart = newApprovalPart; // Dùng giá mới
            }
            
            // Thêm ghi chú mới (nếu có)
            String additionalNote = "";
            if (newEvmNotes != null && newEvmNotes.contains(" | Ghi chú:")) {
                additionalNote = newEvmNotes.substring(newEvmNotes.indexOf(" | Ghi chú:"));
            }
            
            // Ghép lại: approvalPart (có giá mới) + ghi chú mới
            distribution.setEvmNotes(approvalPart + (additionalNote.isEmpty() ? "" : additionalNote));
        } else {
            // Nếu chưa có evmNotes hoặc không có format chuẩn → dùng mới
            distribution.setEvmNotes(newEvmNotes);
        }
        
        // Gửi lại giá mới cho dealer
        distribution.setStatus("PRICE_SENT");
        distribution.setManufacturerPrice(req.getManufacturerPrice());
        
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
                    // Lấy template từ item.product HOẶC tìm từ categoryId
                    Product template = orderedItem.getProduct();
                    Category category = null;
                    
                    if (template == null && orderedItem.getCategoryId() != null) {
                        // Item đặt theo categoryId (không có product template)
                        Optional<Category> catOpt = categoryRepository.findById(orderedItem.getCategoryId());
                        if (catOpt.isPresent()) {
                            category = catOpt.get();
                            
                            // Tìm product mẫu trong category (nếu có) để copy thông tin
                            List<Product> productsInCategory = productRepo.findByCategoryId(orderedItem.getCategoryId());
                            if (!productsInCategory.isEmpty()) {
                                template = productsInCategory.get(0);
                            }
                        } else {
                            throw new RuntimeException("Category không tồn tại với ID: " + orderedItem.getCategoryId());
                        }
                    }
                    
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
                    } else if (category != null) {
                        manufacturerPriceValue = category.getBasePrice();
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
                        } else if (category != null) {
                            // Không có template → tạo từ category
                            p.setName(category.getName());
                            p.setCategory(category);
                            p.setBattery(0);
                            p.setHp(0);
                            p.setTorque(0);
                            p.setRange(0);
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
        
        // ✅ Cập nhật Category basePrice = GIÁ CAO NHẤT từ các items (kể cả khác màu)
        updateCategoryPriceFromDistributionItems(distribution);
        
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

    /**
     * ✅ PHƯƠNG THỨC MỚI: Cập nhật giá Category từ các DistributionItem khi confirmReceived
     * - Tìm GIÁ CAO NHẤT từ tất cả các items (kể cả khác màu)
     * - Cập nhật Category.basePrice nếu giá mới cao hơn giá hiện tại
     */
    private void updateCategoryPriceFromDistributionItems(Distribution distribution) {
        if (distribution.getItems() == null || distribution.getItems().isEmpty()) {
            return;
        }
        
        // Group items by category
        java.util.Map<Integer, Long> categoryMaxPrices = new java.util.HashMap<>();
        
        for (DistributionItem item : distribution.getItems()) {
            Integer categoryId = null;
            
            // Lấy categoryId từ product hoặc trực tiếp từ item
            if (item.getProduct() != null && item.getProduct().getCategory() != null) {
                categoryId = item.getProduct().getCategory().getId();
            } else if (item.getCategoryId() != null) {
                categoryId = item.getCategoryId();
            }
            
            if (categoryId != null) {
                // Lấy giá từ item
                long itemPrice = 0L;
                if (item.getDealerPrice() != null) {
                    itemPrice = item.getDealerPrice().longValue();
                } else if (distribution.getManufacturerPrice() != null) {
                    itemPrice = distribution.getManufacturerPrice().longValue();
                }
                
                // Cập nhật giá cao nhất cho category này
                if (itemPrice > 0) {
                    categoryMaxPrices.put(categoryId, 
                        Math.max(categoryMaxPrices.getOrDefault(categoryId, 0L), itemPrice));
                }
            }
        }
        
        // Cập nhật basePrice cho từng category (chỉ cập nhật nếu giá mới cao hơn)
        for (java.util.Map.Entry<Integer, Long> entry : categoryMaxPrices.entrySet()) {
            Integer categoryId = entry.getKey();
            Long maxPrice = entry.getValue();
            
            Optional<Category> catOpt = categoryRepository.findById(categoryId);
            if (catOpt.isPresent()) {
                Category category = catOpt.get();
                long currentPrice = category.getBasePrice();
                
                // Chỉ cập nhật nếu giá mới cao hơn giá hiện tại
                if (maxPrice > currentPrice) {
                    category.setBasePrice(maxPrice);
                    categoryRepository.save(category);
                    
                    System.out.println("✅ Updated Category #" + categoryId + " (" + category.getName() + ")");
                    System.out.println("   Old basePrice: " + currentPrice);
                    System.out.println("   New basePrice: " + maxPrice + " (GIÁ CAO NHẤT từ items, kể cả khác màu)");
                }
            }
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
                ir.setCategoryId(di.getCategoryId()); // ✅ Set categoryId (có thể null)
                
                // ✅ Populate category object nếu có categoryId
                if (di.getCategoryId() != null) {
                    var categoryRes = categoryService.getCategoryById(di.getCategoryId());
                    ir.setCategory(categoryRes);
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
        
        // Set supplementary fields
        res.setParentDistributionId(distribution.getParentDistributionId());
        res.setIsSupplementary(distribution.getIsSupplementary());
        
        // Set payment information
        res.setPaidAmount(distribution.getPaidAmount());
        res.setTransactionNo(distribution.getTransactionNo());
        res.setPaidAt(distribution.getPaidAt());
        
        return res;
    }

    // ===== SUPPLEMENTARY DISTRIBUTION =====
    /**
     * Tạo đơn phân phối bổ sung cho số lượng thiếu
     * Được gọi khi EVM Staff duyệt đơn với số lượng < yêu cầu
     * 
     * @param parentDistributionId ID của đơn gốc
     * @return Đơn bổ sung mới được tạo với status PENDING
     */
    public DistributionRes createSupplementaryDistribution(int parentDistributionId) {
        // 1. Lấy distribution gốc
        Optional<Distribution> parentOpt = distributionRepo.findById(parentDistributionId);
        if (!parentOpt.isPresent()) {
            throw new RuntimeException("Distribution gốc không tồn tại với ID: " + parentDistributionId);
        }
        Distribution parent = parentOpt.get();

        // 2. Validate: Chỉ tạo bổ sung nếu đơn gốc đã được duyệt (PRICE_SENT, CONFIRMED, hoặc sau đó)
        if (!"PRICE_SENT".equals(parent.getStatus()) && 
            !"PRICE_ACCEPTED".equals(parent.getStatus()) &&
            !"CONFIRMED".equals(parent.getStatus()) && 
            !"PLANNED".equals(parent.getStatus()) &&
            !"COMPLETED".equals(parent.getStatus())) {
            throw new RuntimeException("Chỉ có thể tạo đơn bổ sung khi đơn gốc đã được duyệt (status: PRICE_SENT trở đi)");
        }

        // 3. Kiểm tra evmNotes để parse số lượng đã duyệt
        // QUAN TRỌNG: evmNotes phải có format "Duyệt theo dòng: ..." để biết số yêu cầu ban đầu
        if (parent.getEvmNotes() == null || !parent.getEvmNotes().contains("Duyệt theo dòng:")) {
            throw new RuntimeException("Không thể tạo đơn bổ sung: Đơn gốc chưa được duyệt với chi tiết số lượng từng item. " +
                                     "Vui lòng đảm bảo EVM Staff đã duyệt đơn với ghi chú chi tiết 'Duyệt theo dòng: ...'");
        }
        
        // Tính số lượng thiếu từ items của đơn gốc
        if (parent.getItems() == null || parent.getItems().isEmpty()) {
            throw new RuntimeException("Đơn gốc không có items để tạo đơn bổ sung");
        }

        int totalShortage = 0;
        List<DistributionItem> supplementaryItems = new ArrayList<>();

        // Parse evmNotes để lấy số lượng đã duyệt cho từng item
        // Format: "Duyệt theo dòng: vf3 (Đen): 5/10 xe @ 10.000 VND; vf3 (Xanh): 3/5 xe @ 20.000 VND | Ghi chú: ..."
        java.util.Map<String, Integer> approvedQuantitiesMap = new java.util.HashMap<>();
        java.util.Map<String, Integer> requestedQuantitiesMap = new java.util.HashMap<>(); // Lưu requested từ evmNotes
        boolean parsedFromEvmNotes = false;
        
        // Parse evmNotes - BẮT BUỘC phải thành công
        if (parent.getEvmNotes() != null && parent.getEvmNotes().contains("Duyệt theo dòng:")) {
            try {
                String evmNotes = parent.getEvmNotes();
                int startIdx = evmNotes.indexOf("Duyệt theo dòng:") + "Duyệt theo dòng:".length();
                int endIdx = evmNotes.indexOf("|", startIdx);
                if (endIdx == -1) endIdx = evmNotes.length();
                
                String itemsText = evmNotes.substring(startIdx, endIdx).trim();
                String[] itemParts = itemsText.split(";");
                
                for (String part : itemParts) {
                    part = part.trim();
                    if (part.isEmpty()) continue;
                    
                    // Parse: "vf3 (Đen): 5/10 xe @ 10.000 VND" hoặc "vf3 (Đen): 5/10 xe"
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("^(.+?):\\s*(\\d+)/(\\d+)\\s*xe");
                    java.util.regex.Matcher matcher = pattern.matcher(part);
                    
                    if (matcher.find()) {
                        String itemKey = matcher.group(1).trim(); // "vf3 (Đen)"
                        int approved = Integer.parseInt(matcher.group(2)); // 5
                        int requested = Integer.parseInt(matcher.group(3)); // 10
                        approvedQuantitiesMap.put(itemKey, approved);
                        requestedQuantitiesMap.put(itemKey, requested);
                        parsedFromEvmNotes = true;
                        
                        System.out.println("📊 Parsed evmNotes: " + itemKey + " = " + approved + "/" + requested + " xe");
                    }
                }
                
                // Nếu parse được nhưng không có item nào match
                if (!parsedFromEvmNotes) {
                    throw new RuntimeException("Không thể parse số lượng từ evmNotes. Format: 'Duyệt theo dòng: Tên (Màu): X/Y xe; ...'");
                }
                
            } catch (Exception e) {
                System.err.println("⚠️ Lỗi khi parse evmNotes: " + e.getMessage());
                throw new RuntimeException("Không thể parse số lượng từ evmNotes: " + e.getMessage() + 
                                         ". Vui lòng đảm bảo format đúng: 'Duyệt theo dòng: Tên (Màu): X/Y xe; ...'");
            }
        }

        // Tạo supplementary items với số lượng = số lượng thiếu
        for (DistributionItem parentItem : parent.getItems()) {
            // Tìm số lượng đã duyệt từ evmNotes
            // Ưu tiên Product name, fallback về Category name (load từ categoryId)
            String itemName = "Unknown";
            if (parentItem.getProduct() != null && parentItem.getProduct().getName() != null) {
                itemName = parentItem.getProduct().getName();
            } else if (parentItem.getCategoryId() != null) {
                // Nếu chỉ có categoryId, cố gắng load category name
                try {
                    Optional<Category> catOpt = categoryRepository.findById(parentItem.getCategoryId());
                    if (catOpt.isPresent()) {
                        itemName = catOpt.get().getName();
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Cannot load category for categoryId: " + parentItem.getCategoryId());
                }
            }
            
            String itemKey = itemName + (parentItem.getColor() != null ? " (" + parentItem.getColor() + ")" : "");
            
            System.out.println("🔍 Checking item: " + itemKey + " (Product: " + 
                             (parentItem.getProduct() != null ? parentItem.getProduct().getName() : "null") + 
                             ", CategoryId: " + parentItem.getCategoryId() + ")");
            
            // BẮT BUỘC phải có trong parsed map
            if (!requestedQuantitiesMap.containsKey(itemKey)) {
                throw new RuntimeException("Không tìm thấy thông tin số lượng cho item: " + itemKey + 
                                         " trong evmNotes. Vui lòng kiểm tra lại ghi chú duyệt đơn. " +
                                         "Available keys: " + requestedQuantitiesMap.keySet());
            }
            
            int requested = requestedQuantitiesMap.get(itemKey);
            int approved = approvedQuantitiesMap.get(itemKey);
            int shortage = requested - approved;
            
            System.out.println("🔍 Item: " + itemKey + " → Requested=" + requested + ", Approved=" + approved + ", Shortage=" + shortage);
            
            if (shortage > 0) {
                // Clone item với số lượng = số lượng thiếu
                DistributionItem suppItem = new DistributionItem();
                suppItem.setProduct(parentItem.getProduct());
                suppItem.setColor(parentItem.getColor());
                suppItem.setQuantity(shortage);
                suppItem.setDealerPrice(parentItem.getDealerPrice());
                supplementaryItems.add(suppItem);
                totalShortage += shortage;
            }
        }

        if (supplementaryItems.isEmpty()) {
            // Debug: In ra thông tin chi tiết để biết tại sao không có items thiếu
            System.err.println("❌ Không tạo được đơn bổ sung - Chi tiết:");
            System.err.println("   Parent Distribution ID: " + parentDistributionId);
            System.err.println("   Parent Status: " + parent.getStatus());
            System.err.println("   Requested Quantity: " + parent.getRequestedQuantity());
            System.err.println("   Received Quantity: " + parent.getReceivedQuantity());
            System.err.println("   Total Items: " + (parent.getItems() != null ? parent.getItems().size() : 0));
            System.err.println("   Parsed from evmNotes: " + parsedFromEvmNotes);
            System.err.println("   EvmNotes: " + (parent.getEvmNotes() != null ? parent.getEvmNotes() : "null"));
            
            if (parent.getItems() != null) {
                for (DistributionItem item : parent.getItems()) {
                    String name = (item.getProduct() != null && item.getProduct().getName() != null) 
                                ? item.getProduct().getName() : "Unknown";
                    String color = item.getColor() != null ? item.getColor() : "null";
                    int qty = item.getQuantity() != null ? item.getQuantity() : 0;
                    System.err.println("   - Item: " + name + " (" + color + ") → Quantity: " + qty);
                }
            }
            
            throw new RuntimeException("Không có items thiếu để tạo đơn bổ sung. Kiểm tra console logs để biết chi tiết.");
        }

        // 4. Tạo distribution bổ sung
        Distribution supplementary = new Distribution();
        supplementary.setDealer(parent.getDealer());
        supplementary.setStatus("PENDING"); // Đơn bổ sung bắt đầu ở PENDING
        supplementary.setInvitedAt(LocalDateTime.now());
        
        // Set supplementary fields
        supplementary.setParentDistributionId(parentDistributionId);
        supplementary.setIsSupplementary(true);
        
        // Set items
        for (DistributionItem item : supplementaryItems) {
            item.setDistribution(supplementary);
        }
        supplementary.setItems(supplementaryItems);
        
        // Set quantities
        supplementary.setRequestedQuantity(totalShortage);
        
        // Copy thông tin từ đơn gốc
        supplementary.setManufacturerPrice(parent.getManufacturerPrice());
        supplementary.setRequestedDeliveryDate(parent.getRequestedDeliveryDate());
        
        // Set notes
        String suppNote = "Đơn bổ sung cho đơn gốc #" + parentDistributionId + " (" + totalShortage + " xe thiếu)";
        supplementary.setEvmNotes(suppNote);
        
        // Save
        distributionRepo.save(supplementary);
        
        System.out.println("✅ Tạo đơn bổ sung thành công: ID=" + supplementary.getId() + 
                         ", Parent=" + parentDistributionId + ", Shortage=" + totalShortage + " xe");
        
        return convertToRes(supplementary);
    }
}
