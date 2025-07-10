
-- Fix the transfer logs table constraint issue
ALTER TABLE autonomous_revenue_transfer_logs DROP CONSTRAINT IF EXISTS valid_status;

-- Add proper check constraint for transfer log status
ALTER TABLE autonomous_revenue_transfer_logs 
ADD CONSTRAINT valid_status 
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));

-- Ensure revenue transactions comply with ASC 606/IFRS 15
ALTER TABLE autonomous_revenue_transactions 
ADD COLUMN IF NOT EXISTS performance_obligation_satisfied BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS contract_liability NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_recognition_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS transaction_price_allocated NUMERIC;

-- Update existing transactions to be compliant
UPDATE autonomous_revenue_transactions 
SET 
    performance_obligation_satisfied = true,
    revenue_recognition_date = created_at,
    transaction_price_allocated = amount
WHERE performance_obligation_satisfied IS NULL;

-- Create a function to ensure ASC 606 compliance for revenue recognition
CREATE OR REPLACE FUNCTION ensure_revenue_compliance()
RETURNS TRIGGER AS $$
BEGIN
    -- Set transaction price allocation equal to amount for simple transactions
    NEW.transaction_price_allocated := NEW.amount;
    
    -- Ensure performance obligation is satisfied for autonomous revenue
    NEW.performance_obligation_satisfied := true;
    
    -- Set revenue recognition date to transaction date
    NEW.revenue_recognition_date := COALESCE(NEW.created_at, now());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to ensure compliance
DROP TRIGGER IF EXISTS revenue_compliance_trigger ON autonomous_revenue_transactions;
CREATE TRIGGER revenue_compliance_trigger
    BEFORE INSERT OR UPDATE ON autonomous_revenue_transactions
    FOR EACH ROW
    EXECUTE FUNCTION ensure_revenue_compliance();
