
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

  try {
    console.log("🏦 Starting Stripe revenue transfer process...");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured in secrets");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get all completed revenue transactions that haven't been transferred
    const { data: transactions, error: transError } = await supabaseClient
      .from('autonomous_revenue_transactions')
      .select('*')
      .eq('status', 'completed')
      .gt('amount', 0);

    if (transError) {
      console.error("Database error:", transError);
      throw transError;
    }

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No pending transactions to transfer',
        amount: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Calculate total amount to transfer (convert to cents)
    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const amountInCents = Math.round(totalAmount * 100);

    // Only transfer if we have at least $1 to make it worthwhile
    if (amountInCents < 100) {
      return new Response(JSON.stringify({
        success: true,
        message: `Amount $${totalAmount.toFixed(2)} below minimum $1.00 threshold`,
        amount: totalAmount
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`💰 Transferring $${totalAmount.toFixed(2)} (${amountInCents} cents) to bank account`);

    // Create a transfer to your connected bank account
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'usd',
      destination: 'default_for_currency', // This uses your default bank account
      description: `Real Revenue Transfer - ${transactions.length} transactions`,
      metadata: {
        transaction_count: transactions.length.toString(),
        source: 'autonomous_revenue_system',
        revenue_type: 'real_business_income'
      }
    });

    console.log(`✅ Stripe transfer created: ${transfer.id}`);

    // Log the successful transfer
    const { error: logError } = await supabaseClient
      .from('autonomous_revenue_transfer_logs')
      .insert({
        source_account: 'autonomous_revenue_system',
        destination_account: 'stripe_bank_account',
        amount: totalAmount,
        status: 'completed',
        metadata: {
          stripe_transfer_id: transfer.id,
          transaction_ids: transactions.map(t => t.id),
          transfer_created: transfer.created,
          arrival_date: transfer.arrival_date,
          transfer_amount_cents: amountInCents
        }
      });

    if (logError) {
      console.error('Error logging transfer:', logError);
      // Continue execution - logging failure shouldn't stop the transfer
    }

    // Mark transactions as transferred
    const { error: updateError } = await supabaseClient
      .from('autonomous_revenue_transactions')
      .update({ 
        status: 'transferred',
        metadata: { 
          stripe_transfer_id: transfer.id,
          transferred_at: new Date().toISOString(),
          bank_arrival_date: new Date(transfer.arrival_date * 1000).toISOString()
        }
      })
      .in('id', transactions.map(t => t.id));

    if (updateError) {
      console.error('Error updating transaction status:', updateError);
      throw updateError;
    }

    console.log(`🎉 Successfully transferred $${totalAmount.toFixed(2)} to bank account`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully transferred $${totalAmount.toFixed(2)} to bank account`,
      amount: totalAmount,
      stripe_transfer_id: transfer.id,
      transaction_count: transactions.length,
      arrival_date: new Date(transfer.arrival_date * 1000).toISOString(),
      bank_account_credited: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Transfer error:', error);
    
    // Log the failed transfer attempt with detailed error info
    try {
      await supabaseClient
        .from('autonomous_revenue_transfer_logs')
        .insert({
          source_account: 'autonomous_revenue_system',
          destination_account: 'stripe_bank_account',
          amount: 0,
          status: 'failed',
          metadata: {
            error: error.message,
            error_type: error.type || 'unknown',
            timestamp: new Date().toISOString(),
            failure_reason: 'stripe_api_error'
          }
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      error_type: error.type || 'unknown_error',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
