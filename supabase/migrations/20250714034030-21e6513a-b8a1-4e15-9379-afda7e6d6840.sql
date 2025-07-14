-- First, let me examine the current database structure and create the failed transfer fix system
-- based on the actual application balance transfer method

-- Create tables for tracking transfers and destinations
CREATE TABLE IF NOT EXISTS transfer_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_transfer_id TEXT UNIQUE,
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  description TEXT,
  destination TEXT,
  status TEXT DEFAULT 'pending',
  error_code TEXT,
  error_message TEXT,
  corrected_transfer_id TEXT,
  correction_error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  corrected_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0
);

-- Table for valid destinations by currency
CREATE TABLE IF NOT EXISTS stripe_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT NOT NULL,
  account_id TEXT NOT NULL,
  account_type TEXT DEFAULT 'express',
  is_active BOOLEAN DEFAULT true,
  capabilities JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(currency, account_id)
);

-- Analytics table for workflow runs
CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_type TEXT NOT NULL,
  total_processed INTEGER DEFAULT 0,
  successful_fixes INTEGER DEFAULT 0,
  failed_fixes INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  total_amount_recovered BIGINT DEFAULT 0,
  execution_time_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- RLS policies
ALTER TABLE transfer_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role access" ON transfer_attempts FOR ALL USING (true);
CREATE POLICY "Allow service role access" ON stripe_destinations FOR ALL USING (true);
CREATE POLICY "Allow service role access" ON workflow_runs FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transfer_attempts_status ON transfer_attempts(status);
CREATE INDEX IF NOT EXISTS idx_transfer_attempts_currency ON transfer_attempts(currency);
CREATE INDEX IF NOT EXISTS idx_transfer_attempts_created_at ON transfer_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_stripe_destinations_currency ON stripe_destinations(currency);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_type_date ON workflow_runs(workflow_type, started_at);

-- Function to get failed transfers that need fixes
CREATE OR REPLACE FUNCTION get_failed_transfers_for_fix()
RETURNS TABLE (
  transfer_id UUID,
  stripe_transfer_id TEXT,
  amount BIGINT,
  currency TEXT,
  description TEXT,
  destination TEXT,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    stripe_transfer_id,
    amount,
    currency,
    description,
    destination,
    error_code,
    error_message,
    metadata,
    created_at,
    retry_count
  FROM transfer_attempts
  WHERE status = 'failed'
    AND error_code = 'resource_missing'
    AND destination = 'default_for_currency'
    AND retry_count < 3  -- Prevent infinite retries
    AND created_at >= NOW() - INTERVAL '7 days'  -- Only recent failures
  ORDER BY amount DESC, created_at DESC;
$$;

-- Function to mark transfer as corrected
CREATE OR REPLACE FUNCTION mark_transfer_corrected(
  original_id UUID,
  new_stripe_id TEXT,
  corrected_destination TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE transfer_attempts
  SET 
    status = 'corrected',
    corrected_transfer_id = new_stripe_id,
    corrected_at = NOW(),
    metadata = metadata || jsonb_build_object(
      'corrected_destination', corrected_destination,
      'correction_method', 'sql_workflow',
      'corrected_at', NOW()
    )
  WHERE id = original_id;
  
  SELECT true;
$$;

-- Function to handle proper application balance transfers
CREATE OR REPLACE FUNCTION process_application_balance_transfer()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance_record RECORD;
  transfer_amount NUMERIC;
  transfer_id UUID := gen_random_uuid();
  result JSONB;
BEGIN
  -- Get current application balance
  SELECT * INTO balance_record FROM application_balance WHERE id = 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'BALANCE_NOT_FOUND',
      'message', 'Application balance record not found'
    );
  END IF;
  
  transfer_amount := balance_record.balance_amount;
  
  -- Check if balance is sufficient for transfer
  IF transfer_amount < 5.00 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_BALANCE',
      'message', format('Balance $%s is below $5.00 minimum', transfer_amount),
      'balance', transfer_amount
    );
  END IF;
  
  -- Log the transfer attempt
  INSERT INTO transfer_attempts (
    id,
    amount,
    currency,
    description,
    status,
    metadata
  ) VALUES (
    transfer_id,
    (transfer_amount * 100)::BIGINT, -- Convert to cents
    'usd',
    format('Application balance transfer: $%s', transfer_amount),
    'ready_for_stripe',
    jsonb_build_object(
      'source', 'application_balance',
      'amount_usd', transfer_amount,
      'timestamp', NOW(),
      'transfer_type', 'balance_payout'
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'transfer_id', transfer_id,
    'amount', transfer_amount,
    'status', 'ready_for_stripe',
    'message', format('Transfer of $%s prepared for Stripe processing', transfer_amount)
  );
END;
$$;