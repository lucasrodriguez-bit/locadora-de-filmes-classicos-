import { useState, useEffect } from 'react';
import { Film, ListCollapse, Sparkles, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import { Movie, Rental } from './types';
import { MovieService, getLastSupabaseError } from './lib/movieService';
import { isSupabaseConnected } from './lib/supabase';

// Component imports
import MovieGrid from './components/MovieGrid';
import MovieDetailModal from './components/MovieDetailModal';
import MyRentalsTab from './components/MyRentalsTab';
import CreateMovieModal from './components/CreateMovieModal';
import SupabaseGuideModal from './components/SupabaseGuideModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'rentals'>('catalog');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [supabaseActive, setSupabaseActive] = useState(false);
  
  // Modals state
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSupabaseGuide, setShowSupabaseGuide] = useState(false);

  // Load movies and rentals
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const fetchedMovies = await MovieService.fetchMovies();
      const fetchedRentals = await MovieService.fetchRentals();
      setMovies(fetchedMovies);
      setRentals(fetchedRentals);
      setSupabaseActive(isSupabaseConnected());
    } catch (err) {
      console.error('Falha ao carregar catálogo/transações:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Transaction: Rent a VHS
  const handleRentMovie = async (movieId: string, name: string, phone: string, days: number) => {
    const res = await MovieService.rentMovie(movieId, name, phone, days);
    if (res.success) {
      // Fetch fresh data
      await loadData(true);
    }
    return res;
  };

  // Transaction: Return a VHS
  const handleReturnMovie = async (rentalId: string, movieId: string) => {
    const res = await MovieService.returnMovie(rentalId, movieId);
    if (res.success) {
      await loadData(true);
    } else {
      alert(`Falha ao registrar devolução: ${res.error}`);
    }
  };

  // Transaction: Add new movie
  const handleSaveMovie = async (newMovie: Omit<Movie, 'id'>) => {
    const res = await MovieService.addMovie(newMovie);
    if (res.success) {
      await loadData(true);
    }
    return res;
  };

  // Count active/pending rentals
  const activeRentalsCount = rentals.filter((r) => r.status === 'active').length;

  return (
    <div id="app-root-shell" className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white pb-10">
      
      {/* Upper Navigation and Branding Bar */}
      <header id="main-header" className="sticky top-0 z-40 bg-[#050505]/85 backdrop-blur-md border-b border-zinc-900/80 px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Store banner */}
          <div className="flex items-center gap-3" id="logo-block">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Film className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <h1 className="text-xl font-extrabold tracking-tight text-white mb-0">CINE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">RETRO</span></h1>
                <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest font-bold">Blockbuster</span>
              </div>
              <span className="text-xs text-zinc-400 font-mono tracking-wide">Videolocadora de Clássicos VHS</span>
            </div>
          </div>

          {/* Core App Navigation Tabs */}
          <nav id="app-nav" className="flex items-center bg-[#0d0d0e] border border-zinc-800/80 p-1 rounded-xl text-xs sm:text-sm font-semibold">
            <button
              id="tab-catalog"
              onClick={() => setActiveTab('catalog')}
              className={`cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all duration-250 ${
                activeTab === 'catalog'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Catálogo
            </button>
            <button
              id="tab-rentals"
              onClick={() => setActiveTab('rentals')}
              className={`cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all duration-250 relative ${
                activeTab === 'rentals'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <ListCollapse className="w-4 h-4" />
              Alugados
              {activeRentalsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#050505] animate-bounce">
                  {activeRentalsCount}
                </span>
              )}
            </button>
          </nav>

          <div id="storage-mode-indicator" onClick={() => setShowSupabaseGuide(true)} className="cursor-pointer hover:scale-103 active:scale-98 transition-all">
            {getLastSupabaseError() ? (
              <div className="flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/25 px-3 py-1.5 rounded-full text-xs font-mono font-medium hover:bg-rose-500/25 transition-all">
                <span className="w-2 h-2 bg-rose-400 rounded-full animate-ping"></span>
                <span>⚠️ Erro no Banco (Clique para auxílio)</span>
              </div>
            ) : supabaseActive ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-mono font-medium hover:bg-emerald-500/25 transition-all">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                <span>● Supabase Ativo</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-zinc-950 text-zinc-400 border border-zinc-800/80 px-3 py-1.5 rounded-full text-xs font-mono font-medium hover:bg-zinc-900 transition-all">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span>Armazenamento Local Ativo</span>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Hero Marquee Promo Section */}
      {activeTab === 'catalog' && (
        <section id="marquee-hero" className="max-w-7xl mx-auto w-full px-4 pt-6">
          <div className="relative border border-blue-500/20 bg-gradient-to-b from-[#0d0d0e] to-[#080809] rounded-3xl p-6 sm:p-8 overflow-hidden text-left glowing-box-purple">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl -z-10" />
            
            <div className="max-w-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold tracking-widest uppercase">
                <Sparkles className="w-4 h-4 fill-blue-400/25" />
                <span>Promoção de Fim de Semana</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight font-sans">Alugue duas Fitas VHS e fique com elas por 3 dias!</h2>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                Nostalgia magnética com o melhor acervo de ficção científica, anime cyberpunk e terror dos anos 80! Gerencie a devolução das fitas e os dados dos locadores diretamente no seu navegador.
              </p>
              <div className="pt-2 text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>AVISO COZY: Por favor, rebobine as fitas antes de efetuar a devolução!</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Container Core Switcher */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1" id="main-content-hub">
        {loading ? (
          <div id="global-loading" className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-zinc-400 text-xs font-mono">Carregando catálogo CineRetro...</p>
          </div>
        ) : (
          <div id="tab-viewport">
            {activeTab === 'catalog' && (
              <MovieGrid
                movies={movies}
                onSelectMovie={(movie) => setSelectedMovie(movie)}
                onOpenAddModal={() => setShowAddModal(true)}
              />
            )}

            {activeTab === 'rentals' && (
              <MyRentalsTab
                rentals={rentals}
                onReturnMovie={handleReturnMovie}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer Vintage rules panel */}
      <footer id="main-footer" className="max-w-7xl mx-auto w-full px-4 border-t border-zinc-900/80 pt-6 mt-12 text-zinc-500 text-xs flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
        <div>
          <span>© 1989-2026 CineRetro Ltda. Todos os direitos reservados.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-[10px] text-zinc-500">
          <span>Multa por fita não rebobinada: R$ 2,00</span>
          <span>•</span>
          <span>Atraso por dia: R$ 4,00</span>
          <span>•</span>
          <span>{supabaseActive ? 'Nuvem Supabase Ativa' : 'Sessão Local Segura'}</span>
        </div>
      </footer>

      {/* Detail cassette focusing modal */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onRent={handleRentMovie}
        />
      )}

      {/* File wizard add movie title modal */}
      {showAddModal && (
        <CreateMovieModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveMovie}
        />
      )}

      {/* Supabase Connection Setup & Guide Modal */}
      {showSupabaseGuide && (
        <SupabaseGuideModal
          isConnected={supabaseActive}
          onClose={() => setShowSupabaseGuide(false)}
        />
      )}

    </div>
  );
}
