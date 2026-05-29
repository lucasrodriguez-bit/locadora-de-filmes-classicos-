import { createClient } from '@supabase/supabase-js';

function cleanEnvValue(val: any): string {
  if (!val) return '';
  let s = String(val).trim();
  // Remove wrapping single or double quotes if any (e.g. from env strings)
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.substring(1, s.length - 1).trim();
  }
  // Ignore placeholders or empty strings
  if (
    s === '' ||
    s === '""' ||
    s === "''" ||
    s.includes('sua-url') ||
    s.includes('sua-chave') ||
    s.includes('yourproject') ||
    s.includes('your-') ||
    s.includes('placeholder')
  ) {
    return '';
  }
  return s;
}

const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const rawKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const supabaseUrl = cleanEnvValue(rawUrl);
const supabaseAnonKey = cleanEnvValue(rawKey);

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseClient() {
  return supabase;
}

export function isSupabaseConnected(): boolean {
  return supabase !== null;
}

