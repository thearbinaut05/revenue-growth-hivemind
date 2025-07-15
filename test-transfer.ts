import { createClient } from '@supabase/supabase-js';

async function testTransfer() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase.functions.invoke('stripe-revenue-transfer');
    if (error) {
      console.error('Transfer function error:', error);
    } else {
      console.log('Transfer function response:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testTransfer();
