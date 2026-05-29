import { useState } from 'react';
import { Calendar, AlertTriangle, AlertCircle, ArrowLeftRight, Check, CheckCircle2, Phone, Search, Video, User } from 'lucide-react';
import { Rental } from '../types';

interface MyRentalsTabProps {
  rentals: Rental[];
  onReturnMovie: (rentalId: string, movieId: string) => Promise<void>;
}

export default function MyRentalsTab({ rentals, onReturnMovie }: MyRentalsTabProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'returned'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [returningId, setReturningId] = useState<string | null>(null);

  // Filters
  const filteredRentals = rentals.filter((r) => {
    const matchesFilter = filter === 'all' || 
                          (filter === 'active' && r.status === 'active') || 
                          (filter === 'returned' && r.status === 'returned');
    
    const matchesQuery = r.renter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.movie_title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  const handleReturn = async (rentalId: string, movieId: string) => {
    setReturningId(rentalId);
    try {
      await onReturnMovie(rentalId, movieId);
    } catch (e) {
      console.error(e);
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div id="rentals-management" className="space-y-6 text-slate-200">
      {/* Filters Header panel */}
      <div id="rentals-header-pnl" className="bg-[#0d0d0e] border border-zinc-900 p-5 rounded-3xl shadow-lg flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Toggle Rent Filter */}
        <div className="flex bg-[#050505] p-1.5 rounded-xl border border-zinc-800/60 w-full md:w-auto text-xs" id="rentals-filter-pills">
          <button
            id="filter-rent-active"
            onClick={() => setFilter('active')}
            className={`cursor-pointer flex-1 md:flex-none px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'active'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/30'
            }`}
          >
            Ativas (Emprestados)
          </button>
          <button
            id="filter-rent-returned"
            onClick={() => setFilter('returned')}
            className={`cursor-pointer flex-1 md:flex-none px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'returned'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/30'
            }`}
          >
            Histórico (Devolvidos)
          </button>
          <button
            id="filter-rent-all"
            onClick={() => setFilter('all')}
            className={`cursor-pointer flex-1 md:flex-none px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/30'
            }`}
          >
            Todos
          </button>
        </div>

        {/* Local Rental search bar */}
        <div className="relative w-full md:max-w-xs" id="rental-search-wrap">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            id="rental-query-input"
            type="text"
            placeholder="Buscar por cliente ou filme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050505] border border-zinc-800/80 focus:border-blue-500 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-200 transition-colors placeholder:text-zinc-650"
          />
        </div>
      </div>

      {/* Rentals Catalog Deck */}
      {filteredRentals.length === 0 ? (
        <div id="no-rentals" className="text-center py-20 border border-dashed border-zinc-800 bg-[#0d0d0e]/60 rounded-3xl animate-fade-in">
          <ArrowLeftRight className="w-12 h-12 text-zinc-650 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-zinc-350 font-sans">Sem Locações Cadastadas</h3>
          <p className="text-zinc-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed font-mono">
            Nenhuma locação pendente ou histórica correspondeu aos seus filtros na base de dados.
          </p>
        </div>
      ) : (
        <div id="rentals-list-deck" className="space-y-4 animate-fade-in">
          {filteredRentals.map((rental) => {
            const rentDateFormatted = new Date(rental.rent_date).toLocaleDateString('pt-BR');
            const dueDateParsed = new Date(rental.due_date);
            const dueDateFormatted = dueDateParsed.toLocaleDateString('pt-BR');
            
            // Check overdue
            const isOverdue = rental.status === 'active' && new Date() > dueDateParsed;
            const isReturned = rental.status === 'returned';

            return (
              <div
                id={`rental-card-${rental.id}`}
                key={rental.id}
                className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-5 bg-[#0d0d0e] border rounded-2xl gap-6 transition duration-300 hover:border-zinc-700 relative overflow-hidden ${
                  isOverdue ? 'border-rose-500/35 bg-rose-500/5' : 'border-zinc-900'
                }`}
              >
                {/* Visual Accent for overdue item */}
                {isOverdue && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-rose-500" />
                )}

                {/* Left side info (Cover image and renter details) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                  <div className="w-16 h-24 rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden shrink-0 self-center sm:self-auto aspect-[2/3] shadow-md" id="rental-movie-cover">
                    <img 
                      src={rental.movie_image} 
                      alt={rental.movie_title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="space-y-1.5 text-left flex-1 font-sans">
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-900 font-bold tracking-wider text-blue-400">
                      CÓDIGO: {rental.id}
                    </span>
                    <h4 className="text-base font-bold text-white tracking-tight">{rental.movie_title}</h4>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      <div className="flex items-center gap-1 text-zinc-300">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span>Locador:</span> <strong className="text-zinc-200 font-semibold">{rental.renter_name}</strong>
                      </div>

                      {rental.renter_phone && (
                        <a 
                          id={`wp-link-${rental.id}`}
                          href={`https://wa.me/${rental.renter_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-emerald-400 hover:underline hover:brightness-110"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{rental.renter_phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center Side info (Dates and financials) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8 text-left lg:text-right border-y lg:border-none py-4 lg:py-0 border-zinc-900/80 font-mono text-xs text-zinc-400">
                  <div>
                    <span className="block text-[9px] text-zinc-500 uppercase tracking-widest">DATA LOCAÇÃO</span>
                    <div className="flex items-center gap-1 lg:justify-end mt-1 text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{rentDateFormatted}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[9px] text-zinc-500 uppercase tracking-widest">DATA DEVOLUÇÃO</span>
                    <div className="flex items-center gap-1 lg:justify-end mt-1 text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                      <span>{dueDateFormatted}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[9px] text-zinc-500 uppercase tracking-widest">TOTAL PAGO</span>
                    <span className="block font-bold mt-1 text-emerald-400 text-sm">
                      {rental.total_paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>

                {/* Right side info (Status indicators & action button) */}
                <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0" id="rental-action-area">
                  <div className="text-left lg:text-right">
                    {isReturned ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs font-mono">
                        <Check className="w-3.5 h-3.5" />
                        DEVOLVIDO
                      </div>
                    ) : isOverdue ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-xs font-mono animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        ATRASADO
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold text-xs font-mono">
                        <Video className="w-3.5 h-3.5" />
                        EM USO
                      </div>
                    )}

                    {rental.returned_at && (
                      <span className="block text-[10px] text-slate-500 font-mono mt-1">
                        Devolvido em: {new Date(rental.returned_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  {!isReturned && (
                    <button
                      id={`return-btn-${rental.id}`}
                      onClick={() => handleReturn(rental.id, rental.movie_id)}
                      disabled={returningId === rental.id}
                      className="cursor-pointer bg-zinc-950 border border-zinc-800/80 hover:border-blue-500 text-zinc-200 hover:text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 hover:shadow-md hover:shadow-blue-500/10 active:scale-98 disabled:opacity-50 font-mono"
                    >
                      {returningId === rental.id ? (
                        <>Rebobinando...</>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Devolver VHS
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
