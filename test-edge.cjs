const fetch = require('node-fetch') || global.fetch;
fetch('https://vkfzyzsnkdlybexfqjmt.supabase.co/functions/v1/edfali-init', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZnp5enNua2RseWJleGZxam10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2ODY2OTcsImV4cCI6MjA4MjI2MjY5N30.Six2ALm3s6C8sM8ti18N3hnWM7FjQgH919pL7enp2Ho'
  },
  body: JSON.stringify({ customerPhone: '0912345678', amount: 10 })
}).then(r => r.text()).then(console.log).catch(console.error);
