-- Set up proper automated payout system using the corrected functions
SELECT cron.schedule(
  'automated-stripe-payout-fixed',
  '*/10 * * * *', -- Every 10 minutes for maximum profitability
  $$
  SELECT net.http_post(
    url := 'https://tqbybefpnwxukzqkanip.supabase.co/functions/v1/stripe-revenue-transfer',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxYnliZWZwbnd4dWt6cWthbmlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM2MDIwMywiZXhwIjoyMDYzOTM2MjAzfQ.4qD1kSJOOZmgLpW4vgnCeMQ-YnixfpP_2wztCQzp8qA"}'::jsonb,
    body := '{"automated": true, "source": "cron_scheduler"}'::jsonb
  ) as request_id;
  $$
);