require('dotenv').config({ path: '.env.local' });

console.log('=== TESTE DE VARIÁVEIS DE AMBIENTE ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
  `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50)}...` : 'NÃO DEFINIDA');
console.log('SUPABASE_SERVICE_ROLE:', process.env.SUPABASE_SERVICE_ROLE ? 
  `${process.env.SUPABASE_SERVICE_ROLE.substring(0, 50)}...` : 'NÃO DEFINIDA');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Verificar se as chaves são válidas
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

console.log('\n=== VALIDAÇÃO ===');
console.log('URL válida:', url && url.startsWith('https://'));
console.log('Chave anônima válida:', anonKey && anonKey.startsWith('eyJ'));
console.log('Service role válida:', serviceRole && serviceRole.startsWith('eyJ'));

// Verificar se as chaves são diferentes do env.example
const exampleAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqeWh4emp6b2JrdXZ3ZHFkdGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY0ODQ2MzIsImV4cCI6MjAzMjA2MDYzMn0.Y3_V245SPIOc4-iOYt2-V2pI-40qSoN224-T0-L_gqg";

console.log('\n=== COMPARAÇÃO COM ENV.EXAMPLE ===');
console.log('Chave anônima igual ao exemplo:', anonKey === exampleAnonKey);
console.log('Chave anônima atual:', anonKey ? anonKey.substring(0, 100) + '...' : 'NÃO DEFINIDA');
console.log('Chave anônima exemplo:', exampleAnonKey.substring(0, 100) + '...');
