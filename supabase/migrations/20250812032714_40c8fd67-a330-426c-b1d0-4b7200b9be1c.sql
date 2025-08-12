-- Seed active revenue streams and ensure application_balance exists
DO $$
BEGIN
  -- Ensure application_balance has a base row (id=1)
  IF NOT EXISTS (SELECT 1 FROM public.application_balance WHERE id = 1) THEN
    INSERT INTO public.application_balance (id, balance_amount, pending_transfers, last_updated_at)
    VALUES (1, 0, 0, now());
  END IF;

  -- Seed autonomous_revenue_streams if empty
  IF NOT EXISTS (SELECT 1 FROM public.autonomous_revenue_streams) THEN
    INSERT INTO public.autonomous_revenue_streams (name, strategy, status, settings, metrics)
    VALUES
      ('Ad Network - Premium', 'ad_network', 'active', '{}'::jsonb, jsonb_build_object('total_revenue',0,'transaction_count',0,'average_transaction',0)),
      ('Affiliate Marketing - High ROI', 'affiliate_marketing', 'active', '{}'::jsonb, jsonb_build_object('total_revenue',0,'transaction_count',0,'average_transaction',0)),
      ('Digital Products - Flagship', 'digital_products', 'active', '{}'::jsonb, jsonb_build_object('total_revenue',0,'transaction_count',0,'average_transaction',0)),
      ('API Usage - Tiered', 'api_usage', 'active', '{}'::jsonb, jsonb_build_object('total_revenue',0,'transaction_count',0,'average_transaction',0)),
      ('Content Licensing - Global', 'content_licensing', 'active', '{}'::jsonb, jsonb_build_object('total_revenue',0,'transaction_count',0,'average_transaction',0));
  END IF;

  -- Ensure Stripe integration settings baseline exists for transfers
  IF NOT EXISTS (SELECT 1 FROM public.autonomous_revenue_stripe_integration WHERE status = 'active') THEN
    INSERT INTO public.autonomous_revenue_stripe_integration (
      api_key, webhook_secret, account_id, transfer_frequency, status, metadata, minimum_transfer_amount, auto_transfer
    ) VALUES (
      NULL, NULL, NULL, 'daily', 'active', jsonb_build_object('seeded', true, 'note', 'Update via Edge Function secrets'), 10.00, true
    );
  END IF;
END $$;