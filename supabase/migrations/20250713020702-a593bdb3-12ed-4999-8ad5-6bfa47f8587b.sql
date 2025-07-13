-- First, let's check what cron jobs exist
SELECT jobname, schedule, command FROM cron.job WHERE active = true;

-- Create a log table for cron job monitoring
CREATE TABLE IF NOT EXISTS public.automated_transfer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  execution_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL,
  response JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for the logs table
ALTER TABLE public.automated_transfer_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing logs
CREATE POLICY "Allow authenticated users to view transfer logs" 
ON public.automated_transfer_logs 
FOR SELECT 
USING (true);

-- Set up proper automated payout system using the corrected functions
SELECT cron.schedule(
  'automated-stripe-payout',
  '*/10 * * * *', -- Every 10 minutes for maximum profitability
  $$
  SELECT net.http_post(
    url := 'https://tqbybefpnwxukzqkanip.supabase.co/functions/v1/stripe-revenue-transfer',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYnliZWZwbnd4dWt6cWthbmlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM2MDIwMywiZXhwIjoyMDYzOTM2MjAzfQ.4qD1kSJOOZmgLpW4vgnCeMQ-YnixfpP_2wztCQzp8qA"}'::jsonb,
    body := '{"automated": true, "source": "cron_scheduler"}'::jsonb
  ) as request_id;
  $$
);

-- Insert initial log entry
INSERT INTO public.automated_transfer_logs (job_name, status, response) 
VALUES ('system_setup', 'completed', '{"message": "Fixed Stripe payout error - removed default_for_currency and setup automated payouts", "timestamp": "' || now()::text || '"}');