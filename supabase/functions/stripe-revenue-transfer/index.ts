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
    console.log(`[${executionId}] 🏦 Starting application balance transfer process...`);
    
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

    // Get application balance AND total revenue from transactions
    const { data: appBalance, error: balanceError } = await supabaseClient
      .from('application_balance')
      .select('*')
      .single();

    if (balanceError) {
      console.error(`[${executionId}] Error getting application balance:`, balanceError);
      throw new Error(`Database error: ${balanceError.message}`);
    }

    // Get total revenue from completed transactions
    const { data: transactions, error: transactionError } = await supabaseClient
      .from('autonomous_revenue_transactions')
      .select('amount, status')
      .eq('status', 'completed');

    if (transactionError) {
      console.error(`[${executionId}] Error getting revenue transactions:`, transactionError);
      throw new Error(`Transaction error: ${transactionError.message}`);
    }

    const applicationBalance = Number(appBalance?.balance_amount || 0);
    const totalRevenue = (transactions || []).reduce((sum, t) => sum + Number(t.amount), 0);
    const balanceAmount = applicationBalance + totalRevenue;
    
    console.log(`[${executionId}] 💰 Application balance: $${applicationBalance.toFixed(2)}`);
    console.log(`[${executionId}] 💰 Total revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`[${executionId}] 💰 Combined transfer amount: $${balanceAmount.toFixed(2)}`);

    if (balanceAmount < 5) {
      console.log(`[${executionId}] Amount below $5 minimum transfer threshold`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Transfer amount $${balanceAmount.toFixed(2)} is below $5 minimum threshold`,
        amount: 0,
        available_amount: balanceAmount,
        threshold_not_met: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`[${executionId}] 🚀 Processing transfer of $${balanceAmount.toFixed(2)} (App: $${applicationBalance.toFixed(2)} + Revenue: $${totalRevenue.toFixed(2)})`);

    // Log transfer attempt BEFORE creating Stripe payout
    const transferId = crypto.randomUUID();
    await supabaseClient
      .from('transfer_attempts')
      .insert({
        id: transferId,
        amount: Math.round(balanceAmount * 100), // Convert to cents
        currency: 'usd',
        description: `Combined balance transfer: App $${applicationBalance.toFixed(2)} + Revenue $${totalRevenue.toFixed(2)} = $${balanceAmount.toFixed(2)}`,
        status: 'processing',
        metadata: {
          execution_id: executionId,
          source: 'combined_balance_revenue',
          application_balance: applicationBalance,
          total_revenue: totalRevenue,
          amount_usd: balanceAmount,
          timestamp: new Date().toISOString()
        }
      });

    // Create Stripe payout
    const amountInCents = Math.round(balanceAmount * 100);
    let payout;
    
    try {
      payout = await stripe.payouts.create({
        amount: amountInCents,
        currency: 'usd',
        method: 'standard',
        description: `Combined Balance Transfer - App: $${applicationBalance.toFixed(2)} + Revenue: $${totalRevenue.toFixed(2)} = $${balanceAmount.toFixed(2)}`,
        metadata: {
          execution_id: executionId,
          source: 'combined_balance_revenue',
          application_balance: applicationBalance,
          total_revenue: totalRevenue,
          amount_usd: balanceAmount.toString(),
          timestamp: new Date().toISOString(),
          transfer_id: transferId
        }
      });

      console.log(`[${executionId}] ✅ Stripe payout created: ${payout.id}`);
      
      // Update transfer attempt with success
      await supabaseClient
        .from('transfer_attempts')
        .update({
          stripe_transfer_id: payout.id,
          status: 'completed',
          metadata: {
            execution_id: executionId,
            source: 'combined_balance_revenue',
            application_balance: applicationBalance,
            total_revenue: totalRevenue,
            amount_usd: balanceAmount,
            timestamp: new Date().toISOString(),
            stripe_payout_id: payout.id,
            arrival_date: new Date(payout.arrival_date * 1000).toISOString()
          }
        })
        .eq('id', transferId);

    } catch (stripeError: any) {
      console.error(`[${executionId}] ❌ Stripe payout failed:`, stripeError);
      
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
            source: 'combined_balance_revenue',
            application_balance: applicationBalance,
            total_revenue: totalRevenue,
            amount_usd: balanceAmount,
            timestamp: new Date().toISOString(),
            error_type: stripeError.type,
            error_code: stripeError.code
          }
        })
        .eq('id', transferId);

      throw new Error(`Stripe payout failed: ${stripeError.message}`);
    }

    // Reset application balance to 0 AND mark revenue transactions as transferred
    const { error: balanceUpdateError } = await supabaseClient
      .from('application_balance')
      .update({ 
        balance_amount: 0,
        pending_transfers: 0,
        last_updated_at: new Date().toISOString()
      })
      .eq('id', appBalance.id);

    if (balanceUpdateError) {
      console.error(`[${executionId}] Error resetting application balance:`, balanceUpdateError);
    }

    // Mark all completed revenue transactions as transferred
    const { error: revenueUpdateError } = await supabaseClient
      .from('autonomous_revenue_transactions')
      .update({ 
        status: 'transferred',
        metadata: {
          transferred_at: new Date().toISOString(),
          stripe_payout_id: payout.id,
          transfer_id: transferId
        }
      })
      .eq('status', 'completed');

    if (revenueUpdateError) {
      console.error(`[${executionId}] Error marking revenue as transferred:`, revenueUpdateError);
    }

    // Log successful transfer
    const { error: logError } = await supabaseClient
      .from('automated_transfer_logs')
      .insert({
        job_name: 'application_balance_transfer',
        status: 'completed',
        execution_time: new Date().toISOString(),
        response: {
          execution_id: executionId,
          stripe_payout_id: payout.id,
          amount_transferred: balanceAmount,
          application_balance: applicationBalance,
          total_revenue: totalRevenue,
          transfer_id: transferId,
          balance_before: applicationBalance,
          revenue_before: totalRevenue,
          combined_amount: balanceAmount,
          arrival_date: new Date(payout.arrival_date * 1000).toISOString()
        }
      });

    if (logError) {
      console.error(`[${executionId}] Error logging transfer:`, logError);
    }

    console.log(`[${executionId}] 🎉 Successfully transferred $${balanceAmount.toFixed(2)} (App: $${applicationBalance.toFixed(2)} + Revenue: $${totalRevenue.toFixed(2)}) to Stripe bank account!`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully transferred $${balanceAmount.toFixed(2)} (App: $${applicationBalance.toFixed(2)} + Revenue: $${totalRevenue.toFixed(2)}) from your account to bank`,
      amount: balanceAmount,
      stripe_payout_id: payout.id,
      transfer_id: transferId,
      payout_details: {
        id: payout.id,
        amount: balanceAmount,
        amount_cents: amountInCents,
        currency: 'usd',
        method: payout.method,
        arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
        description: payout.description
      },
      execution_id: executionId,
      automation_complete: true
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
        job_name: 'application_balance_transfer',
        status: 'failed',
        execution_time: new Date().toISOString(),
        error_message: error.message,
        response: {
          execution_id: executionId,
          error_type: error.name || 'UnknownError',
          error_message: error.message,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      error_type: error.name || 'UnknownError',
      execution_id: executionId,
      timestamp: new Date().toISOString(),
      message: "Application balance transfer failed. Please check your Stripe configuration and try again.",
      troubleshooting: {
        check_stripe_secret: "Verify STRIPE_SECRET_KEY is configured in Edge Function secrets",
        check_stripe_account: "Ensure your Stripe account is properly set up with bank details",
        check_balance: "Verify you have sufficient balance for transfer",
        minimum_amount: "Transfers require minimum $5.00"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});