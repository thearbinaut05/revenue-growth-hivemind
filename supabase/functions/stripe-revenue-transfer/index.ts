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

    console.log(`[${executionId}] 🚀 Processing transfer of $${revenueAmount.toFixed(2)} from revenue to application balance, then to bank`);

    // Log transfer attempt BEFORE any operations
    const transferId = crypto.randomUUID();
    await supabaseClient
      .from('transfer_attempts')
      .insert({
        id: transferId,
        amount: Math.round(revenueAmount * 100), // Convert to cents
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

    // Step 1: Move money from revenue balance to application balance
    const newAppBalance = currentAppBalance + revenueAmount;
    
    console.log(`[${executionId}] 📊 Moving $${revenueAmount.toFixed(2)} from revenue to application balance`);
    
    // Update revenue balance to 0
    const { error: revenueUpdateError } = await supabaseClient
      .from('revenue_balance')
      .update({ 
        balance_amount: 0,
        last_updated_at: new Date().toISOString()
      })
      .eq('id', revenueBalance.id);

    if (revenueUpdateError) {
      console.error(`[${executionId}] Error updating revenue balance:`, revenueUpdateError);
      throw new Error(`Failed to update revenue balance: ${revenueUpdateError.message}`);
    }

    // Update application balance with the transfer amount
    const { error: appUpdateError } = await supabaseClient
      .from('application_balance')
      .update({ 
        balance_amount: newAppBalance,
        last_updated_at: new Date().toISOString()
      })
      .eq('id', appBalance.id);

    if (appUpdateError) {
      console.error(`[${executionId}] Error updating application balance:`, appUpdateError);
      
      // Rollback revenue balance if application balance update fails
      await supabaseClient
        .from('revenue_balance')
        .update({ 
          balance_amount: revenueAmount,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', revenueBalance.id);
      
      throw new Error(`Failed to update application balance: ${appUpdateError.message}`);
    }

    console.log(`[${executionId}] ✅ Successfully moved funds to application balance: $${newAppBalance.toFixed(2)}`);

    // Step 2: Create bank transfer using Stripe
    const amountInCents = Math.round(revenueAmount * 100);
    let transfer;
    
    try {
      // Create a transfer to bank account instead of payout
      transfer = await stripe.transfers.create({
        amount: amountInCents,
        currency: 'usd',
        destination: 'bank_account', // This would be your connected bank account ID
        description: `Revenue to Bank Transfer - $${revenueAmount.toFixed(2)}`,
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
            application_balance_before: currentAppBalance,
            application_balance_after: newAppBalance - revenueAmount // Will be 0 after final step
          }
        })
        .eq('id', transferId);

    } catch (stripeError: any) {
      console.error(`[${executionId}] ❌ Stripe transfer failed:`, stripeError);
      
      // Rollback both balances if Stripe transfer fails
      await supabaseClient
        .from('revenue_balance')
        .update({ 
          balance_amount: revenueAmount,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', revenueBalance.id);
        
      await supabaseClient
        .from('application_balance')
        .update({ 
          balance_amount: currentAppBalance,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', appBalance.id);
      
      // Log the failed transfer
      await supabaseClient
        .from('transfer_attempts')
        .update({
          status: 'failed',
          error_code: stripeError.code || 'unknown_error',
          error_message: stripeError.message,
          retry_count: 1,
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

    // Step 3: Only after successful Stripe transfer, deduct from application balance
    const finalAppBalance = newAppBalance - revenueAmount; // Should be back to original amount
    
    const { error: finalBalanceUpdateError } = await supabaseClient
      .from('application_balance')
      .update({ 
        balance_amount: finalAppBalance,
        pending_transfers: 0,
        last_updated_at: new Date().toISOString()
      })
      .eq('id', appBalance.id);

    if (finalBalanceUpdateError) {
      console.error(`[${executionId}] Error updating final application balance:`, finalBalanceUpdateError);
      // Note: At this point the Stripe transfer succeeded, so we log but don't rollback
    }

    console.log(`[${executionId}] 💰 Final application balance: $${finalAppBalance.toFixed(2)}`);

    // Log successful transfer
    const { error: logError } = await supabaseClient
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

    if (logError) {
      console.error(`[${executionId}] Error logging transfer:`, logError);
    }

    console.log(`[${executionId}] 🎉 Successfully transferred $${revenueAmount.toFixed(2)} from revenue to bank account!`);

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
      message: "Revenue to bank transfer failed. Please check your Stripe configuration and try again.",
      troubleshooting: {
        check_stripe_secret: "Verify STRIPE_SECRET_KEY is configured in Edge Function secrets",
        check_stripe_account: "Ensure your Stripe account is properly set up with bank details",
        check_balance: "Verify you have sufficient revenue balance for transfer",
        minimum_amount: "Transfers require minimum $5.00"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});