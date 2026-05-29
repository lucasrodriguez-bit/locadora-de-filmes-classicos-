import { useState } from 'react';
import { Search, Film, Star, Sparkles, PlusCircle } from 'lucide-react';
import { Movie } from '../types';
import { GENRES } from '../data/movies';

interface MovieGridProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onOpenAddModal: () => void;
}

export default function MovieGrid({ movies, onSelectMovie, onOpenAddModal }: MovieGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [showOnlyClassic, setShowOnlyClassic] = useState(false);

  // Filters
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (movie.original_title && movie.original_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          movie.director.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = selectedGenre === 'Todos' || movie.genre === selectedGenre;
    const matchesClassic = !showOnlyClassic || movie.is_retro_classic;

    return matchesSearch && matchesGenre && matchesClassic;
  });

  return (
    <div id="movie-catalog-container" className="space-y-8 animate-fade-in">
      {/* Bento Grid Header & Filter Layout */}
      <div id="filter-hub-bento" className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Box 1: Search and Retro Switcher */}
        <div className="bento-card p-5 md:col-span-4 flex flex-col justify-between gap-4 bg-[#0d0d0e] border border-zinc-900 rounded-3xl">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 block mb-2">Acervo CineRetro</span>
            <h3 className="text-base font-bold text-white leading-tight mb-3">Pesquisar Catálogo</h3>
          </div>
          <div className="space-y-3">
            <div className="relative w-full" id="search-wrapper">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="vhs-search-input"
                type="text"
                placeholder="Buscar título, diretor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#050505] border border-zinc-800/80 focus:border-blue-500 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-200 transition-all placeholder:text-zinc-650"
              />
            </div>

            <label className="cursor-pointer flex items-center gap-2 text-xs text-zinc-400 select-none bg-[#050505] border border-zinc-800/80 px-3 py-2 rounded-xl hover:text-white hover:border-zinc-700 transition">
              <input
                id="classics-checkbox"
                type="checkbox"
                checked={showOnlyClassic}
                onChange={(e) => setShowOnlyClassic(e.target.checked)}
                className="accent-blue-500 rounded"
              />
              <span className="font-mono text-[10.5px]">Apenas Clássicos VHS</span>
            </label>
          </div>
        </div>

        {/* Box 2: Genre Picker Bento */}
        <div className="bento-card p-5 md:col-span-5 flex flex-col justify-between gap-4 bg-[#0d0d0e] border border-zinc-900 rounded-3xl">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block mb-1">Filtrar por Gênero</span>
            <h3 className="text-base font-bold text-white leading-tight">Escolha uma Categoria</h3>
          </div>
          <div id="genres-carousel" className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
            {GENRES.map((g) => {
              const isActive = selectedGenre === g;
              return (
                <button
                  id={`genre-btn-${g.replace(/\s+/g, '-').toLowerCase()}`}
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`cursor-pointer text-[10.5px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500/35 text-white shadow-md shadow-blue-500/10'
                      : 'bg-[#050505] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Box 3: Statistics & Actions Bento */}
        <div className="bento-card p-5 md:col-span-3 flex flex-col justify-between bg-[#0d0d0e] border border-zinc-900 rounded-3xl">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block mb-1">Status do Acervo</span>
            <h3 className="text-base font-bold text-white leading-tight mb-2">Painel</h3>
          </div>

          <div className="py-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-mono">
              {filteredMovies.length}
            </span>
            <span className="text-xs text-zinc-500 font-mono">fitas filtradas</span>
          </div>

          <button
            id="add-movie-btn"
            onClick={onOpenAddModal}
            className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold py-2.5 rounded-xl hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/10"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar VHS</span>
          </button>
        </div>

      </div>

      {/* Grid Shelf */}
      {filteredMovies.length === 0 ? (
        <div id="empty-catalog-state" className="text-center py-20 border border-dashed border-zinc-800 bg-[#0d0d0e]/60 rounded-3xl">
          <Film className="w-12 h-12 text-zinc-700 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-zinc-300 font-sans">Nenhum VHS Encontrado</h3>
          <p className="text-zinc-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed font-mono">
            Não encontramos fitas correspondentes aos filtros selecionados. Altere os termos da busca ou crie um novo título!
          </p>
        </div>
      ) : (
        <div id="vhs-grid-shelf" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {filteredMovies.map((movie) => {
            const hasCopies = movie.available_copies > 0;
            const spineBg = movie.vhs_box_color || '#3b82f6';
            return (
              <div
                id={`vhs-card-${movie.id}`}
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                className="group cursor-pointer flex flex-col bg-[#0d0d0e] border border-zinc-900/90 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/5 relative"
              >
                {/* Simulated VHS Spine / Tape Box Side highlight */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-1.5 z-20 group-hover:scale-x-125 transition-transform"
                  style={{ backgroundColor: spineBg }}
                />

                {/* Movie Cover Media Container */}
                <div className="aspect-[2/3] w-full overflow-hidden relative bg-zinc-950" id="poster-box">
                  <img
                    src={movie.image_url}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* VHS Label overlays */}
                  <div className="absolute top-3 right-3 bg-black/90 border border-zinc-800 px-2 py-0.5 rounded text-[8.5px] font-mono text-zinc-300 tracking-wider backdrop-blur-sm shadow z-10 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    VHS
                  </div>

                  {movie.is_retro_classic && (
                    <div className="absolute bottom-2 left-4 bg-yellow-500/95 text-zinc-950 px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider z-10 flex items-center gap-0.5 shadow-sm font-sans">
                      <Sparkles className="w-2.5 h-2.5 fill-zinc-950" />
                      CLÁSSICO
                    </div>
                  )}

                  {/* Dark hover details overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider">Direção</span>
                    <p className="text-xs text-white font-medium truncate mb-1">{movie.director}</p>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider font-mono">Ver Fita VHS →</span>
                  </div>
                </div>

                {/* Cover Info Footer */}
                <div className="p-3 pl-4 flex-1 flex flex-col justify-between" id="card-meta">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 tracking-tight uppercase">{movie.genre}</span>
                    <h4 className="text-xs font-bold text-zinc-200 leading-snug group-hover:text-blue-400 transition-colors mt-0.5 line-clamp-2">
                      {movie.title}
                    </h4>
                  </div>
                  
                  <div className="mt-3 pt-2.5 border-t border-zinc-900/80 flex justify-between items-center">
                    <div>
                      <span className="text-[8px] text-zinc-500 block uppercase font-mono">Diária</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {movie.price_per_day.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    <div className="text-right">
                      {hasCopies ? (
                        <div className="text-right">
                          <span className="text-[8px] text-zinc-500 block uppercase font-mono">Estoque</span>
                          <span className="text-[10.5px] font-medium text-indigo-300 font-mono">{movie.available_copies} fitas</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                          Esgotado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
