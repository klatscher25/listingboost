// Debug script to check environment variables in browser context
console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('All NEXT_PUBLIC_ vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));