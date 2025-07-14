import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    console.log(`[${executionId}] 🏦 Starting revenue to bank transfer process...`);
    
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

    // Get both revenue and application balances
    const { data: revenueBalance, error: revenueError } = await supabaseClient
      .from('revenue_balance')
      .select('*')
      .single();

    const { data: appBalance, error: appBalanceError } = await supabaseClient
      .from('application_balance')
      .select('*')
      .single();

    if (revenueError) {
      console.error(`[${executionId}] Error getting revenue balance:`, revenueError);
      throw new Error(`Database error: ${revenueError.message}`);
    }

    if (appBalanceError) {
      console.error(`[${executionId}] Error getting application balance:`, appBalanceError);
      throw new Error(`Database error: ${appBalanceError.message}`);
    }

    const revenueAmount = Number(revenueBalance?.balance_amount || 0);
    const currentAppBalance = Number(appBalance?.balance_amount || 0);
    
    console.log(`[${executionId}] 💰 Revenue balance: $${revenueAmount.toFixed(2)}`);
    console.log(`[${executionId}] 💰 Current application balance: $${currentAppBalance.toFixed(2)}`);

    if (revenueAmount < 5) {
      console.log(`[${executionId}] Revenue amount below $5 minimum transfer threshold`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Transfer amount $${revenueAmount.toFixed(2)} is below $5 minimum threshold`,
        amount: 0,
        available_amount: revenueAmount,
        threshold_not_met: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`[${executionId}] 🚀 Starting transfer process for $${revenueAmount.toFixed(2)}`);

    // Log transfer attempt
    const transferId = crypto.randomUUID();
    await supabaseClient
      .from('transfer_attempts')
      .insert({
        id: transferId,
        amount: Math.round(revenueAmount * 100),
        currency: 'usd',
        description: `Revenue to bank transfer: $${revenueAmount.toFixed(2)}`,
        status: 'processing',
        metadata: {
          execution_id: executionId,
          source: 'revenue_balance',
          amount_usd: revenueAmount,
          timestamp: new Date().toISOString(),
          flow: 'revenue_to_application_to_bank'
        }
      });

    // STEP 1: Move funds from revenue balance to application balance
    console.log(`[${executionId}] 📊 Step 1: Moving $${revenueAmount.toFixed(2)} from revenue to application balance`);
    
    const newAppBalance = currentAppBalance + revenueAmount;
    
    // Use a database transaction to ensure atomicity
    const { error: balanceTransferError } = await supabaseClient.rpc('transfer_revenue_to_application', {
      p_revenue_id: revenueBalance.id,
      p_application_id: appBalance.id,
      p_transfer_amount: revenueAmount,
      p_new_app_balance: newAppBalance
    });

    if (balanceTransferError) {
      console.error(`[${executionId}] Error in balance transfer:`, balanceTransferError);
      
      // If you don't have the stored procedure, do it manually with error handling
      const { error: revenueUpdateError } = await supabaseClient
        .from('revenue_balance')
        .update({ 
          balance_amount: 0,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', revenueBalance.id);

      if (revenueUpdateError) {
        throw new Error(`Failed to update revenue balance: ${revenueUpdateError.message}`);
      }

      const { error: appUpdateError } = await supabaseClient
        .from('application_balance')
        .update({ 
          balance_amount: newAppBalance,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', appBalance.id);

      if (appUpdateError) {
        // Rollback revenue balance
        await supabaseClient
          .from('revenue_balance')
          .update({ 
            balance_amount: revenueAmount,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', revenueBalance.id);
        
        throw new Error(`Failed to update application balance: ${appUpdateError.message}`);
      }
    }

    console.log(`[${executionId}] ✅ Step 1 complete: Application balance now $${newAppBalance.toFixed(2)}`);

    // STEP 2: Create Stripe transfer to bank account
    console.log(`[${executionId}] 🏦 Step 2: Creating Stripe transfer to bank account`);
    
    const amountInCents = Math.round(revenueAmount * 100);
    let transfer;
    
    try {
      // Use transfer for bank account transfers
      transfer = await stripe.transfers.create({
        amount: amountInCents,
        currency: 'usd',
        destination: 'default_for_currency', // This sends to your default bank account
        description: `Revenue Transfer - $${revenueAmount.toFixed(2)}`,
        metadata: {
          execution_id: executionId,
          source: 'revenue_balance',
          amount_usd: revenueAmount.toString(),
          timestamp: new Date().toISOString(),
          transfer_id: transferId,
          flow: 'revenue_to_application_to_bank'
        }
      });

      console.log(`[${executionId}] ✅ Stripe transfer created: ${transfer.id}`);

    } catch (stripeError: any) {
      console.error(`[${executionId}] ❌ Stripe transfer failed:`, stripeError);
      
      // ROLLBACK: Move money back from application to revenue
      console.log(`[${executionId}] 🔄 Rolling back balance changes...`);
      
      await supabaseClient
        .from('application_balance')
        .update({ 
          balance_amount: currentAppBalance,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', appBalance.id);
        
      await supabaseClient
        .from('revenue_balance')
        .update({ 
          balance_amount: revenueAmount,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', revenueBalance.id);
      
      // Log failed transfer
      await supabaseClient
        .from('transfer_attempts')
        .update({
          status: 'failed',
          error_code: stripeError.code || 'unknown_error',
          error_message: stripeError.message,
          metadata: {
            execution_id: executionId,
            source: 'revenue_balance',
            amount_usd: revenueAmount,
            timestamp: new Date().toISOString(),
            error_type: stripeError.type,
            error_code: stripeError.code,
            flow: 'revenue_to_application_to_bank',
            rollback_performed: true
          }
        })
        .eq('id', transferId);

      throw new Error(`Stripe transfer failed: ${stripeError.message}`);
    }

    // STEP 3: Only after successful transfer, deduct from application balance
    console.log(`[${executionId}] 💰 Step 3: Deducting $${revenueAmount.toFixed(2)} from application balance`);
    
    const finalAppBalance = newAppBalance - revenueAmount;
    
    const { error: finalBalanceError } = await supabaseClient
      .from('application_balance')
      .update({ 
        balance_amount: finalAppBalance,
        pending_transfers: 0,
        last_updated_at: new Date().toISOString()
      })
      .eq('id', appBalance.id);

    if (finalBalanceError) {
      console.error(`[${executionId}] ⚠️  Warning: Transfer succeeded but failed to update final balance:`, finalBalanceError);
      // Don't throw here since transfer succeeded
    }

    // Update transfer attempt with success
    await supabaseClient
      .from('transfer_attempts')
      .update({
        stripe_transfer_id: transfer.id,
        status: 'completed',
        metadata: {
          execution_id: executionId,
          source: 'revenue_balance',
          amount_usd: revenueAmount,
          timestamp: new Date().toISOString(),
          stripe_transfer_id: transfer.id,
          flow: 'revenue_to_application_to_bank',
          final_app_balance: finalAppBalance
        }
      })
      .eq('id', transferId);

    // Log successful transfer
    await supabaseClient
      .from('automated_transfer_logs')
      .insert({
        job_name: 'revenue_to_bank_transfer',
        status: 'completed',
        execution_time: new Date().toISOString(),
        response: {
          execution_id: executionId,
          stripe_transfer_id: transfer.id,
          amount_transferred: revenueAmount,
          transfer_id: transferId,
          revenue_balance_before: revenueAmount,
          revenue_balance_after: 0,
          application_balance_before: currentAppBalance,
          application_balance_after: finalAppBalance,
          flow: 'revenue_to_application_to_bank'
        }
      });

    console.log(`[${executionId}] 🎉 Transfer completed successfully!`);
    console.log(`[${executionId}] 📊 Final balances - Revenue: $0.00, Application: $${finalAppBalance.toFixed(2)}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully transferred $${revenueAmount.toFixed(2)} from revenue balance to your bank account`,
      amount: revenueAmount,
      stripe_transfer_id: transfer.id,
      transfer_id: transferId,
      transfer_details: {
        id: transfer.id,
        amount: revenueAmount,
        amount_cents: amountInCents,
        currency: 'usd',
        destination: transfer.destination,
        description: transfer.description
      },
      balance_changes: {
        revenue_balance: {
          before: revenueAmount,
          after: 0
        },
        application_balance: {
          before: currentAppBalance,
          after: finalAppBalance
        }
      },
      execution_id: executionId,
      automation_complete: true,
      flow: 'revenue_to_application_to_bank'
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
        job_name: 'revenue_to_bank_transfer',
        status: 'failed',
        execution_time: new Date().toISOString(),
        error_message: error.message,
        response: {
          execution_id: executionId,
          error_type: error.name || 'UnknownError',
          error_message: error.message,
          timestamp: new Date().toISOString(),
          flow: 'revenue_to_application_to_bank'
        }
      });

    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      error_type: error.name || 'UnknownError',
      execution_id: executionId,
      timestamp: new Date().toISOString(),
      message: "Revenue to bank transfer failed. Check logs for details.",
      troubleshooting: {
        check_stripe_secret: "Verify STRIPE_SECRET_KEY is configured correctly",
        check_stripe_account: "Ensure Stripe account has bank details configured",
        check_balance: "Verify sufficient revenue balance exists",
        minimum_amount: "Transfers require minimum $5.00",
        check_logs: "Review transfer_attempts table for detailed error info"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});