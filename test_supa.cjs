require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

(async () => {
  const { data, error } = await supabase.from('transactions').select(`
    id, amount, payment_method, course_id, pdf_id,
    profiles!transactions_user_id_fkey(full_name),
    courses_new:course_id(title, teacher_id, teachers(profiles(full_name))),
    pdf_lectures:pdf_id(title, teacher_id, teachers(profiles(full_name)))
  `).limit(1);
  console.log("Result:");
  console.log(JSON.stringify({data, error}, null, 2));
})();
