import { useState } from 'react';
import { X, Database, Key, Terminal, Copy, Check, Settings, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getLastSupabaseError } from '../lib/movieService';

interface SupabaseGuideModalProps {
  onClose: () => void;
  isConnected: boolean;
}

export default function SupabaseGuideModal({ onClose, isConnected }: SupabaseGuideModalProps) {
  const [copied, setCopied] = useState(false);
  const lastError = getLastSupabaseError();

  const sqlCode = `-- 🎬 CINERETRO - SCRIPT SQL DE BANCO DE DADOS (SUPABASE)
-- Execute este script completo no seu "SQL Editor" no painel do Supabase para limpar tabelas antigas e criar o banco corretamente.

-- ⚠️ IMPORTANTE: Execute o bloco completo clicando em "Run"!

-- 1. REMOVER TABELAS ANTIGAS CONFLITANTES (Caso existam)
DROP TABLE IF EXISTS rentals CASCADE;
DROP TABLE IF EXISTS movies CASCADE;

-- 2. CRIAR TABELA DE FILMES (movies)
CREATE TABLE movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  original_title TEXT,
  genre TEXT NOT NULL,
  year INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  director TEXT NOT NULL,
  rating NUMERIC NOT NULL,
  synopsis TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price_per_day NUMERIC NOT NULL,
  available_copies INTEGER NOT NULL,
  is_retro_classic BOOLEAN DEFAULT false,
  vhs_box_color TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CRIAR TABELA DE LOCAÇÕES (rentals)
CREATE TABLE rentals (
  id TEXT PRIMARY KEY,
  movie_id TEXT REFERENCES movies(id) ON DELETE CASCADE,
  movie_title TEXT NOT NULL,
  movie_image TEXT NOT NULL,
  rent_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('active', 'returned')),
  total_paid NUMERIC NOT NULL,
  renter_name TEXT NOT NULL,
  renter_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CONFIGURAÇÃO DE SEGURANÇA (RLS) COMPLETA E INFALÍVEL
-- Habilitamos e forçamos políticas públicas irrestritas (Leitura/Escrita) para conexões anônimas:

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas que possam reexistir
DROP POLICY IF EXISTS "Permitir leitura publica de movies" ON movies;
DROP POLICY IF EXISTS "Permitir insercao publica de movies" ON movies;
DROP POLICY IF EXISTS "Permitir atualizacao publica de movies" ON movies;
DROP POLICY IF EXISTS "Permitir exclusao publica de movies" ON movies;

DROP POLICY IF EXISTS "Permitir leitura publica de rentals" ON rentals;
DROP POLICY IF EXISTS "Permitir insercao publica de rentals" ON rentals;
DROP POLICY IF EXISTS "Permitir atualizacao publica de rentals" ON rentals;
DROP POLICY IF EXISTS "Permitir exclusao publica de rentals" ON rentals;

-- Criação de novas políticas sem restrição de autenticação (anon_key) para Movies
CREATE POLICY "Permitir leitura publica de movies" ON movies FOR SELECT USING (true);
CREATE POLICY "Permitir insercao publica de movies" ON movies FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao publica de movies" ON movies FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusao publica de movies" ON movies FOR DELETE USING (true);

-- Criação de novas políticas sem restrição de autenticação (anon_key) para Rentals
CREATE POLICY "Permitir leitura publica de rentals" ON rentals FOR SELECT USING (true);
CREATE POLICY "Permitir insercao publica de rentals" ON rentals FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao publica de rentals" ON rentals FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir exclusao publica de rentals" ON rentals FOR DELETE USING (true);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-[#0d0d0e] border border-zinc-800/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-0">Integração com Supabase</h3>
              <p className="text-[10px] font-mono text-zinc-400 tracking-wide uppercase">Configurações do Banco de Dados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm text-zinc-300 leading-relaxed">
          
          {/* Status Badge */}
          <div className="p-4 rounded-xl border flex items-start gap-3 bg-zinc-950/40 border-zinc-900">
            {isConnected ? (
              <>
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse mt-1"></span>
                <div>
                  <h4 className="font-semibold text-emerald-400">Conectado ao Supabase! ✔️</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Sua videolocadora CineRetro está sincronizando perfeitamente na nuvem! Filmes cadastrados e locações estão salvos com segurança.
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse mt-1"></span>
                <div>
                  <h4 className="font-semibold text-amber-400">Modo Local Ativo (Sem Conexão Cloud)</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Os dados estão sendo salvos apenas no seu navegador atual (localStorage). Siga os passos abaixo para conectar seu Supabase gratuitamente.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Último Erro do Supabase Detectado */}
          {lastError && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3 text-xs leading-relaxed text-rose-400">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1.5 w-full">
                <h5 className="font-bold text-rose-300">Erro de Banco Detectado pelo Sistema:</h5>
                <p className="font-mono bg-zinc-950/80 p-2.5 rounded border border-rose-500/10 text-[11px] text-zinc-300 whitespace-pre-wrap break-all select-all selection:bg-rose-600">
                  {lastError}
                </p>
                <div className="text-zinc-400 text-[11px] leading-normal space-y-1">
                  {lastError.toLowerCase().includes('relation') && lastError.toLowerCase().includes('does not exist') ? (
                    <p>
                      💡 <strong>Como Corrigir:</strong> Este erro indica que as tabelas necessárias não existem em seu projeto do Supabase. Por favor, <strong>copie o Script SQL abaixo (Passo 2)</strong>, cole-o no <strong>SQL Editor</strong> do painel do seu Supabase e clique em <strong>Run</strong>!
                    </p>
                  ) : lastError.toLowerCase().includes('row-level security') || lastError.toLowerCase().includes('policy') ? (
                    <p>
                      💡 <strong>Como Corrigir:</strong> A política de segurança de linhas (RLS) do Supabase está bloqueando suas interações públicas sem login. Execute o comando SQL na seção inferior para <strong>desativar o RLS</strong> ou configurar regras de acesso público leitura/gravação nas tabelas.
                    </p>
                  ) : lastError.toLowerCase().includes('apikey') || lastError.toLowerCase().includes('key') ? (
                    <p>
                      💡 <strong>Como Corrigir:</strong> Sua URL do Supabase ou Token AnonKey está inválido ou mal formatado. Certifique-se de que os salvou no painel Secrets do AI Studio sem aspas ou caracteres estranhos, e de reiniciar o servidor de desenvolvimento.
                    </p>
                  ) : (
                    <p>
                      💡 <strong>Dica:</strong> Certifique-se de ter executado com sucesso o Script SQL do Passo 2 no painel do Supabase para criar as tabelas com os campos corretos e desativar restrições RLS.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Guide Steps */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-blue-500" />
              <span>Passo 1: Variáveis de Ambiente</span>
            </h4>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              No painel lateral do seu editor de código no <strong>Google AI Studio</strong> (ou nas configurações de Secrets do applet), configure as seguintes chaves de segredo (Secrets):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 flex items-start gap-2.5">
                <Key className="w-4 h-4 text-zinc-400 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-white selection:bg-blue-600">VITE_SUPABASE_URL</div>
                  <div className="text-[10px] font-mono text-zinc-500">A URL do seu projeto do tipo https://xxxx.supabase.co</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-zinc-400 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-white selection:bg-blue-600">VITE_SUPABASE_ANON_KEY</div>
                  <div className="text-[10px] font-mono text-zinc-500">A chave pública anon/public (key secreta do projeto)</div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-blue-500/5 text-blue-400 border border-blue-500/10 p-3.5 rounded-xl text-xs">
              <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">⚠️ Chaves salvas mas sem efeito?</span>
                <p className="text-zinc-400 leading-normal">
                  Como o Vite roda no lado do cliente, as variáveis são injetadas estaticamente. Após salvar suas chaves, peça para mim no chat: <strong className="text-blue-300 font-mono">"reinicie o servidor"</strong> ou <strong className="text-blue-300 font-mono">"restart dev server"</strong> para recarregar o processo!
                </p>
              </div>
            </div>
          </div>

          {/* SQL Editor Step */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-pink-500" />
                <span>Passo 2: Script SQL do Banco</span>
              </h4>
              <button
                onClick={handleCopy}
                className="cursor-pointer flex items-center gap-1.5 text-[10px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2 py-1 rounded transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-zinc-400">
              Entre no dashboard do seu Supabase, crie uma consulta no <strong className="text-zinc-250">SQL Editor</strong>, cole o código abaixo e execute-o (clicando em <strong className="text-zinc-250">Run</strong>) para gerar as tabelas:
            </p>

            <pre className="p-3.5 bg-zinc-950 border border-zinc-900 rounded-xl max-h-48 overflow-y-auto text-[11px] font-mono text-sky-400/90 whitespace-pre scrollbar-thin selection:bg-blue-600 selection:text-white">
              {sqlCode}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-zinc-900 bg-zinc-950 px-6 py-4.5 gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs py-2 px-5 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-blue-600/10"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
