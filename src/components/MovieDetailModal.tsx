import React, { useState } from 'react';
import { X, Calendar, Clock, Star, Film, CircleDollarSign, ShieldAlert, Sparkles, User, Phone, CheckCircle2 } from 'lucide-react';
import { Movie } from '../types';

interface MovieDetailModalProps {
  movie: Movie;
  onClose: () => void;
  onRent: (movieId: string, name: string, phone: string, days: number) => Promise<{ success: boolean; error?: string }>;
}

export default function MovieDetailModal({ movie, onClose, onRent }: MovieDetailModalProps) {
  const [renterName, setRenterName] = useState('');
  const [renterPhone, setRenterPhone] = useState('');
  const [rentDays, setRentDays] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const totalCost = movie.price_per_day * rentDays;
  const isAvailable = movie.available_copies > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renterName.trim()) {
      setErrorMsg('Por favor, informe o nome do cliente que está locando.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await onRent(movie.id, renterName.trim(), renterPhone.trim(), rentDays);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(res.error || 'Erro imprevisto ao efetuar locação. Verifique seus limites e estoque.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id={`detail-portal-${movie.id}`} className="fixed inset-0 bg-[#050505]/95 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      {/* Modal Case */}
      <div id="vhs-detail-case" className="relative bg-[#0d0d0e] border border-zinc-900 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Banner with absolute elements */}
        <div id="modal-banner-back" className="h-44 sm:h-56 w-full relative">
          <img
            src={movie.banner_url || movie.image_url}
            alt="Movie Banner"
            className="w-full h-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0e] to-transparent" />
          
          {/* Close button */}
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4 bg-[#050505]/80 hover:bg-[#050505] text-zinc-400 hover:text-white p-2 rounded-full border border-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Splash */}
        {isSuccess ? (
          <div id="success-panel" className="p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white font-sans">VHS Locado com Sucesso!</h3>
            <p className="text-zinc-450 text-sm max-w-md mx-auto leading-relaxed">
              O filme <strong className="text-white">"{movie.title}"</strong> foi reservado para <span className="text-blue-400 font-semibold">{renterName}</span>. Lembre o cliente de devolver a fita em até <span className="text-emerald-400 font-bold">{rentDays} dias</span> para evitar multas de atraso.
            </p>
            <div className="bg-[#050505] border border-zinc-800 p-3.5 rounded-xl text-xs text-zinc-400 font-mono">
              Total Pago: {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} • Entrega em {new Date(Date.now() + rentDays * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
            </div>
            <button
              id="success-close-btn"
              onClick={onClose}
              className="cursor-pointer bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white font-semibold py-2.5 px-6 rounded-lg transition"
            >
              Fechar Detalhes
            </button>
          </div>
        ) : (
          /* Main content */
          <div className="p-6 sm:p-8 -mt-20 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8" id="modal-grid-body">
            
            {/* Poster column */}
            <div className="md:col-span-4 space-y-4">
              <div 
                className="rounded-2xl overflow-hidden border-2 shadow-2xl relative aspect-[2/3] max-w-[200px] mx-auto md:mx-0 bg-zinc-950"
                style={{ borderColor: movie.vhs_box_color || '#3b82f6' }}
                id="modal-poster-wrapper"
              >
                <img
                  src={movie.image_url}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 bg-[#050505]/90 text-zinc-450 text-[8px] font-mono px-1.5 py-0.5 rounded tracking-widest border border-zinc-800">
                  NTSC
                </div>
              </div>

              <div className="stats-list rounded-2xl bg-[#050505] border border-zinc-850 p-3 space-y-1.5 text-xs text-zinc-405 font-mono">
                <div className="flex justify-between">
                  <span>Código:</span>
                  <span className="text-zinc-200">{movie.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ano:</span>
                  <span className="text-zinc-200">{movie.year}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duração:</span>
                  <span className="text-zinc-300">{movie.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Estoque:</span>
                  <span className={`font-bold ${isAvailable ? 'text-blue-300' : 'text-rose-450'}`}>
                    {movie.available_copies} fitas
                  </span>
                </div>
              </div>
            </div>

            {/* In-depth details & checkout rent form column */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-6">
              
              {/* Text content details */}
              <div id="movie-info-wrap" className="space-y-3.5 text-left font-sans">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs bg-blue-950/40 text-blue-400 border border-blue-900/30 font-semibold px-2.5 py-0.5 rounded">
                    {movie.genre}
                  </span>
                  
                  {movie.is_retro_classic && (
                    <span className="text-xs bg-yellow-500/15 text-yellow-500 border border-yellow-500/10 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 fill-yellow-500/10" />
                      Clássico do Catálogo
                    </span>
                  )}
                </div>

                <div className="text-left font-sans">
                  <h3 className="text-2xl font-black text-white leading-tight tracking-tight">{movie.title}</h3>
                  {movie.original_title && (
                    <span className="text-xs text-zinc-500 font-serif block italic mt-0.5">Título original: {movie.original_title}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono py-1 border-y border-zinc-900">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-zinc-200 font-bold">{movie.rating.toFixed(1)}</span> / 5.0
                  </div>
                  <div>
                    <span>Direção: </span>
                    <strong className="text-zinc-200 font-sans">{movie.director}</strong>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-350 leading-relaxed max-h-[140px] overflow-y-auto pr-1">
                  {movie.synopsis}
                </p>
              </div>

              {/* Checkout Form Card */}
              {isAvailable ? (
                <div id="checkout-form-card" className="bg-[#050505] border border-zinc-800 rounded-2xl p-4 sm:p-5 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-2xl"></div>
                  
                  <h4 className="text-xs font-bold text-zinc-250 font-mono mb-3 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                    <Film className="w-4 h-4 text-blue-400" />
                    Ficha de Empréstimo de VHS
                  </h4>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-455 uppercase tracking-widest mb-1 flex items-center gap-1"><User className="w-3 h-3 text-blue-400" /> Nome do Cliente <span className="text-rose-500">*</span></label>
                        <input
                          id="renter-name"
                          type="text"
                          required
                          placeholder="Ex: Lucas Felipe"
                          value={renterName}
                          onChange={(e) => setRenterName(e.target.value)}
                          className="w-full bg-[#0d0d0e] border border-zinc-800 focus:border-blue-500 focus:outline-none rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-zinc-455 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone className="w-3 h-3 text-blue-400" /> WhatsApp/Telefone</label>
                        <input
                          id="renter-phone"
                          type="text"
                          placeholder="Ex: (11) 99999-5555"
                          value={renterPhone}
                          onChange={(e) => setRenterPhone(e.target.value)}
                          className="w-full bg-[#0d0d0e] border border-zinc-800 focus:border-blue-500 focus:outline-none rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1 bg-[#0d0d0e] p-3 rounded-xl border border-zinc-900">
                      <div>
                        <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1">Período de Aluguel</label>
                        <select
                          id="rent-days"
                          value={rentDays}
                          onChange={(e) => setRentDays(Number(e.target.value))}
                          className="bg-[#050505] border border-zinc-800 text-zinc-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
                        >
                          <option value={1}>1 Dia (Fita expressa)</option>
                          <option value={3}>3 Dias (Fim de semana)</option>
                          <option value={7}>7 Dias (Super fã)</option>
                          <option value={14}>14 Dias (Férias de inverno)</option>
                        </select>
                      </div>

                      <div className="text-right sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-sans">Valor do Aluguel</span>
                        <div className="flex items-center gap-1.5">
                          <CircleDollarSign className="w-4 h-4 text-emerald-400" />
                          <span className="text-base font-mono font-bold text-emerald-400">
                            {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {errorMsg && (
                      <div id="rent-error-box" className="p-2.5 rounded-xl bg-rose-955/20 border border-rose-500/10 text-xs text-rose-400">
                        {errorMsg}
                      </div>
                    )}

                    <div className="pt-1">
                      <button
                        id="confirm-rent-btn"
                        type="submit"
                        disabled={submitting}
                        className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 active:scale-98 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 disabled:opacity-50"
                      >
                        {submitting ? 'Gravando fita...' : 'Confirmar Locação (Alugar VHS)'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div id="rent-unavailable-notice" className="bg-[#050505] border border-zinc-850 rounded-2xl p-5 text-left flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-450 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-bold text-white font-sans">Fora de Estoque Temporário</h5>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-1 font-sans">
                      Todas as cópias físicas desta fita de vídeo estão atualmente alugadas por clientes externos. Volte mais tarde ou reserve outras fitas do nosso acervo.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
