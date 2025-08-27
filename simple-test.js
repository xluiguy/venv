console.log('=== TESTE SIMPLES ===');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('ANON KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log('SERVICE ROLE:', process.env.SUPABASE_SERVICE_ROLE ? 'DEFINIDA' : 'NÃO DEFINIDA');

console.log('=== FIM ===');
