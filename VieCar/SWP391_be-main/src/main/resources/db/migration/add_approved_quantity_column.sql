-- Migration: Add ApprovedQuantity column to distribution_item table
-- Date: 2025-11-21
-- Description: Add approved quantity field to track EVM Staff approved quantity (may differ from requested quantity)

-- Check if column exists before adding
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'distribution_item') 
    AND name = 'ApprovedQuantity'
)
BEGIN
    ALTER TABLE distribution_item
    ADD ApprovedQuantity INT NULL;
    
    PRINT 'Column ApprovedQuantity added successfully to distribution_item table';
END
ELSE
BEGIN
    PRINT 'Column ApprovedQuantity already exists in distribution_item table';
END
GO

-- Optional: Update existing records to set ApprovedQuantity = Quantity for historical data
UPDATE distribution_item
SET ApprovedQuantity = Quantity
WHERE ApprovedQuantity IS NULL;

PRINT 'Migration completed: ApprovedQuantity column added and initialized';
GO
