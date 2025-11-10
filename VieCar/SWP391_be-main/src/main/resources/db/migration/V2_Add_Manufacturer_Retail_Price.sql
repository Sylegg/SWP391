-- Migration script to add manufacturer_price and retail_price columns to product table
-- Date: 2025-11-08
-- Description: 
--   - manufacturer_price: Giá gốc từ hãng (KHÔNG được thay đổi sau khi set)
--   - retail_price: Giá bán lẻ của đại lý (CÓ THỂ thay đổi)

-- Add ManufacturerPrice column (read-only after first set)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[product]') AND name = 'ManufacturerPrice')
BEGIN
    ALTER TABLE [dbo].[product]
    ADD [ManufacturerPrice] BIGINT NULL;
    
    PRINT 'Added ManufacturerPrice column to product table';
END
ELSE
BEGIN
    PRINT 'ManufacturerPrice column already exists in product table';
END
GO

-- Add RetailPrice column (updateable)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[product]') AND name = 'RetailPrice')
BEGIN
    ALTER TABLE [dbo].[product]
    ADD [RetailPrice] BIGINT NULL;
    
    PRINT 'Added RetailPrice column to product table';
END
ELSE
BEGIN
    PRINT 'RetailPrice column already exists in product table';
END
GO

-- Optional: Migrate existing DealerPrice to RetailPrice for existing products
-- Uncomment if you want to migrate data
/*
UPDATE [dbo].[product]
SET [RetailPrice] = [DealerPrice],
    [ManufacturerPrice] = [DealerPrice]
WHERE [DealerPrice] > 0 
  AND ([RetailPrice] IS NULL OR [ManufacturerPrice] IS NULL);

PRINT 'Migrated existing DealerPrice to ManufacturerPrice and RetailPrice';
*/
GO

-- Add comment/description (SQL Server 2012+)
EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Giá gốc từ hãng sản xuất. Không được thay đổi sau khi set lần đầu.', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'product',
    @level2type = N'COLUMN', @level2name = N'ManufacturerPrice';
GO

EXEC sys.sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Giá bán lẻ của đại lý. Có thể cập nhật bất kỳ lúc nào.', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'product',
    @level2type = N'COLUMN', @level2name = N'RetailPrice';
GO

PRINT 'Migration completed successfully!';
