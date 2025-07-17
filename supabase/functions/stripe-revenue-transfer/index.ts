import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Exponential backoff delay
const getRetryDelay = (attempt: number) => INITIAL_RETRY_DELAY * Math.pow(2, attempt);

// Sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const executionId = `transfer_${Date.now()}`;

  try {
    console.log(`[${executionId}] 🏦 Starting application balance to bank transfer process...`);
    
    // 1. Validate Stripe configuration
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not found in environment");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "STRIPE_SECRET_KEY not configured",
        message: "Please configure your Stripe secret key in Supabase Edge Function secrets",
        setup_required: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16",
      typescript: true 
    });

    // 2. Get application balance (DO NOT deduct yet)
    const { data: appBalance, error: appBalanceError } = await supabaseClient
      .from('application_balance')
      .select('*')
      .single();

    if (appBalanceError) {
      console.error(`[${executionId}] Error getting application balance:`, appBalanceError);
      throw new Error(`Database error: ${appBalanceError.message}`);
    }

    const currentAppBalance = Number(appBalance?.balance_amount || 0);
    console.log(`[${executionId}] 💰 Application balance: $${currentAppBalance.toFixed(2)} (NOT deducted yet)`);

    // 3. Validate application has sufficient balance
    if (currentAppBalance < 5) {
      console.log(`[${executionId}] Application balance below $5 minimum transfer threshold`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Application balance $${currentAppBalance.toFixed(2)} is below $5 minimum threshold`,
        amount: 0,
        available_amount: currentAppBalance,
        threshold_not_met: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`[${executionId}] 🚀 Starting transfer process for $${currentAppBalance.toFixed(2)}`);

    // Log transfer attempt
    const transferId = crypto.randomUUID();
    await supabaseClient
      .from('transfer_attempts')
      .insert({
        id: transferId,
        amount: Math.round(currentAppBalance * 100),
        currency: 'usd',
        description: `Application balance to bank transfer: $${currentAppBalance.toFixed(2)}`,
        status: 'processing',
        metadata: {
          execution_id: executionId,
          source: 'application_balance',
          amount_usd: currentAppBalance,
          timestamp: new Date().toISOString(),
          flow: 'application_to_bank'
        }
      });

    // 4. Attempt Stripe transfer using Transfer API WITH RETRY LOGIC
    console.log(`[${executionId}] 🏦 Attempting Stripe transfer to bank account (with retry logic)...`);
    
    const amountInCents = Math.round(currentAppBalance * 100);
    let transfer;
    let lastError;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[${executionId}] 🔄 Transfer attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
        
        transfer = await stripe.transfers.create({
          amount: amountInCents,
          currency: 'usd',
          destination: 'default_for_currency', // This sends to your default bank account
          description: `Application Balance Transfer - $${currentAppBalance.toFixed(2)}`,
          metadata: {
            execution_id: executionId,
            source: 'application_balance',
            amount_usd: currentAppBalance.toString(),
            timestamp: new Date().toISOString(),
            transfer_id: transferId,
            attempt: (attempt + 1).toString(),
            flow: 'application_to_bank'
          }
        });

        console.log(`[${executionId}] ✅ Stripe transfer created successfully: ${transfer.id}`);
        break; // Success, exit retry loop

      } catch (stripeError: any) {
        lastError = stripeError;
        console.error(`[${executionId}] ❌ Stripe transfer attempt ${attempt + 1} failed:`, stripeError);
        
        // Handle specific Stripe errors
        const errorCode = stripeError.code;
        const errorType = stripeError.type;
        
        // Determine if retry is appropriate
        const isRetryableError = 
          errorCode === 'rate_limit' ||
          errorType === 'api_connection_error' ||
          errorType === 'api_error' ||
          (errorCode && ['lock_timeout', 'temporary_unavailable'].includes(errorCode));

        // Don't retry for certain errors
        const isNonRetryableError = 
          errorCode === 'insufficient_funds' ||
          errorCode === 'account_invalid' ||
          errorCode === 'invalid_request_error' ||
          errorCode === 'authentication_error';

        if (isNonRetryableError) {
          console.error(`[${executionId}] 🚫 Non-retryable error detected: ${errorCode}`);
          break; // Don't retry
        }

        if (attempt < MAX_RETRIES && isRetryableError) {
          const delay = getRetryDelay(attempt);
          console.log(`[${executionId}] ⏳ Waiting ${delay}ms before retry...`);
          await sleep(delay);
          continue; // Retry
        } else {
          // Final attempt failed or non-retryable error
          break;
        }
      }
    }

    // If transfer failed after all retries
    if (!transfer) {
      console.error(`[${executionId}] 💥 All transfer attempts failed`);
      
      // Log failed transfer with detailed error information
      await supabaseClient
        .from('transfer_attempts')
        .update({
          status: 'failed',
          error_code: lastError?.code || 'unknown_error',
          error_message: lastError?.message || 'Unknown error',
          metadata: {
            execution_id: executionId,
            source: 'application_balance',
            amount_usd: currentAppBalance,
            timestamp: new Date().toISOString(),
            error_type: lastError?.type,
            error_code: lastError?.code,
            flow: 'application_to_bank',
            retries_attempted: MAX_RETRIES + 1,
            final_error: lastError?.message
          }
        })
        .eq('id', transferId);

      // Return error response with specific error handling guidance
      return new Response(JSON.stringify({ 
        success: false,
        error: lastError?.message || 'Transfer failed after all retries',
        error_code: lastError?.code,
        error_type: lastError?.type,
        execution_id: executionId,
        retries_attempted: MAX_RETRIES + 1,
        timestamp: new Date().toISOString(),
        message: "Transfer to bank account failed. Application balance unchanged.",
        balance_unchanged: true,
        available_balance: currentAppBalance,
        troubleshooting: {
          insufficient_funds: lastError?.code === 'insufficient_funds' ? "Your Stripe account has insufficient funds" : null,
          invalid_destination: lastError?.code === 'account_invalid' ? "Check your Stripe account bank details configuration" : null,
          rate_limits: lastError?.code === 'rate_limit' ? "Stripe API rate limit reached, try again later" : null,
          network_timeout: lastError?.type === 'api_connection_error' ? "Network connectivity issue, check connection" : null,
          check_stripe_secret: "Verify STRIPE_SECRET_KEY is configured correctly",
          check_stripe_account: "Ensure Stripe account has bank details configured",
          minimum_amount: "Transfers require minimum $5.00"
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // 5. ON SUCCESS: Deduct amount from application's internal balance
    console.log(`[${executionId}] 💰 SUCCESS: Deducting $${currentAppBalance.toFixed(2)} from application balance`);
    
    const { error: balanceUpdateError } = await supabaseClient
      .from('application_balance')
      .update({ 
        balance_amount: 0, // Reset to zero after successful transfer
        pending_transfers: 0,
        last_updated_at: new Date().toISOString()
      })
      .eq('id', appBalance.id);

    if (balanceUpdateError) {
      console.error(`[${executionId}] ⚠️  CRITICAL: Transfer succeeded but failed to update balance:`, balanceUpdateError);
      // This is critical but don't fail the request since money was transferred
    }

    // Update transfer attempt with success
    await supabaseClient
      .from('transfer_attempts')
      .update({
        stripe_transfer_id: transfer.id,
        status: 'completed',
        metadata: {
          execution_id: executionId,
          source: 'application_balance',
          amount_usd: currentAppBalance,
          timestamp: new Date().toISOString(),
          stripe_transfer_id: transfer.id,
          flow: 'application_to_bank',
          application_balance_before: currentAppBalance,
          application_balance_after: 0
        }
      })
      .eq('id', transferId);

    // Log successful transfer
    await supabaseClient
      .from('automated_transfer_logs')
      .insert({
        job_name: 'application_to_bank_transfer',
        status: 'completed',
        execution_time: new Date().toISOString(),
        response: {
          execution_id: executionId,
          stripe_transfer_id: transfer.id,
          amount_transferred: currentAppBalance,
          transfer_id: transferId,
          application_balance_before: currentAppBalance,
          application_balance_after: 0,
          flow: 'application_to_bank'
        }
      });

    console.log(`[${executionId}] 🎉 Transfer completed successfully!`);
    console.log(`[${executionId}] 📊 Application balance reset to $0.00 after $${currentAppBalance.toFixed(2)} transfer`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully transferred $${currentAppBalance.toFixed(2)} from application balance to your bank account`,
      amount: currentAppBalance,
      stripe_transfer_id: transfer.id,
      transfer_id: transferId,
      transfer_details: {
        id: transfer.id,
        amount: currentAppBalance,
        amount_cents: amountInCents,
        currency: 'usd',
        destination: transfer.destination,
        description: transfer.description
      },
      balance_changes: {
        application_balance: {
          before: currentAppBalance,
          after: 0
        }
      },
      execution_id: executionId,
      flow: 'application_to_bank'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error(`[${executionId}] 💥 Transfer failed:`, error);
    
    // Log error
    await supabaseClient
      .from('automated_transfer_logs')
      .insert({
        job_name: 'application_to_bank_transfer',
        status: 'failed',
        execution_time: new Date().toISOString(),
        error_message: error.message,
        response: {
          execution_id: executionId,
          error_type: error.name || 'UnknownError',
          error_message: error.message,
          timestamp: new Date().toISOString(),
          flow: 'application_to_bank'
        }
      });

    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      error_type: error.name || 'UnknownError',
      execution_id: executionId,
      timestamp: new Date().toISOString(),
      message: "Application balance to bank transfer failed. Check logs for details.",
      balance_unchanged: true,
      troubleshooting: {
        check_stripe_secret: "Verify STRIPE_SECRET_KEY is configured correctly",
        check_stripe_account: "Ensure Stripe account has bank details configured",
        check_balance: "Verify sufficient application balance exists",
        minimum_amount: "Transfers require minimum $5.00",
        check_logs: "Review transfer_attempts table for detailed error info"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});