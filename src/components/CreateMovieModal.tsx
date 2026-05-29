import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Film, Star, Clock, Heart } from 'lucide-react';
import { Movie } from '../types';

interface CreateMovieModalProps {
  onClose: () => void;
  onSave: (movie: Omit<Movie, 'id'>) => Promise<{ success: boolean; data?: Movie; error?: string }>;
}

const PRESET_POSTERS = [
  { name: 'Futurista/Cyber', url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=400' },
  { name: 'Espacial/Estrelas', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=400' },
  { name: 'Neon/Cidade', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400' },
  { name: 'Terror/Sombra', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=400' }
];

export default function CreateMovieModal({ onClose, onSave }: CreateMovieModalProps) {
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [genre, setGenre] = useState('Ficção Científica');
  const [year, setYear] = useState(new Date().getFullYear());
  const [duration, setDuration] = useState(120);
  const [director, setDirector] = useState('');
  const [rating, setRating] = useState(4.5);
  const [synopsis, setSynopsis] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pricePerDay, setPricePerDay] = useState(5.00);
  const [availableCopies, setAvailableCopies] = useState(3);
  const [isRetroClassic, setIsRetroClassic] = useState(true);
  const [vhsBoxColor, setVhsBoxColor] = useState('#ec4899'); // Neon Pink Default

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleApplyPreset = (url: string) => {
    setImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !director.trim() || !synopsis.trim()) {
      setErrorText('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400';

    setLoading(true);
    setErrorText('');

    try {
      const res = await onSave({
        title: title.trim(),
        original_title: originalTitle.trim() || undefined,
        genre,
        year: Number(year),
        duration: Number(duration),
        director: director.trim(),
        rating: Number(rating),
        synopsis: synopsis.trim(),
        image_url: finalImage,
        price_per_day: Number(pricePerDay),
        available_copies: Number(availableCopies),
        is_retro_classic: isRetroClassic,
        vhs_box_color: vhsBoxColor
      });

      if (res.success) {
        onClose();
      } else {
        setErrorText(res.error || 'Não foi possível salvar o título.');
      }
    } catch (err: any) {
      setErrorText(err.message || 'Erro ao salvar filme.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="create-modal-backdrop" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div id="create-modal-case" className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200 text-slate-200 text-left">
        
        {/* Header bar */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6" id="create-modal-header">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-sans">Cadastrar Nova Fita VHS</h3>
              <span className="text-xs text-slate-400 font-mono">Expandir Catálogo de Filmes</span>
            </div>
          </div>
          <button
            id="close-create-btn"
            onClick={onClose}
            className="cursor-pointer bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:text-white p-1.5 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="create-vhs-form">
          {errorText && (
            <div id="create-error-box" className="p-3 bg-red-950/20 border border-red-500/20 text-xs text-red-400 rounded-lg">
              {errorText}
            </div>
          )}

          {/* Core metadata rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Título do Filme <span className="text-red-500">*</span></label>
              <input
                id="form-title"
                type="text"
                required
                placeholder="Ex: De Volta para o Futuro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-200 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Título Original (Inglês) </label>
              <input
                id="form-original-title"
                type="text"
                placeholder="Ex: Back to the Future (1985)"
                value={originalTitle}
                onChange={(e) => setOriginalTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-200 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Gênero</label>
              <select
                id="form-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg p-2 text-xs text-slate-200 font-mono"
              >
                <option value="Ficção Científica">Ficção Científica</option>
                <option value="Ação">Ação</option>
                <option value="Aventura">Aventura</option>
                <option value="Terror">Terror</option>
                <option value="Drama">Drama</option>
                <option value="Comédia">Comédia</option>
                <option value="Animação / Anime">Animação / Anime</option>
                <option value="Cult / Crime">Cult / Crime</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Ano de Lançamento</label>
              <input
                id="form-year"
                type="number"
                required
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Duração (Minutos)</label>
              <input
                id="form-duration"
                type="number"
                required
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Classificação (0-5)</label>
              <input
                id="form-rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                required
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Diretor <span className="text-red-500">*</span></label>
              <input
                id="form-director"
                type="text"
                required
                placeholder="Ex: Steven Spielberg"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Valor Diária (R$)</label>
                <input
                  id="form-price"
                  type="number"
                  step="0.10"
                  required
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Cópias Estocadas</label>
                <input
                  id="form-copies"
                  type="number"
                  required
                  value={availableCopies}
                  onChange={(e) => setAvailableCopies(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Sinopse do Enredo <span className="text-red-500">*</span></label>
            <textarea
              id="form-synopsis"
              required
              rows={3}
              placeholder="Escreva um breve resumo chamativo das cenas da fita do filme..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Custom Poster URL Field */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>URL do Poster de Capa</span>
              </label>
              <input
                id="form-image"
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200 transition-colors placeholder:text-slate-600 font-mono"
              />
              {/* Preset Quick links */}
              <div className="flex gap-1.5 items-center mt-1.5 overflow-x-auto pb-1" id="presets-wrap">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">Sugestões:</span>
                {PRESET_POSTERS.map((preset) => (
                  <button
                    id={`preset-${preset.name.toLowerCase().replace('/', '-')}`}
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset.url)}
                    className="cursor-pointer text-[9px] font-semibold bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-900 hover:border-slate-700 shrink-0 transition"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Retro variables setup */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Cor Lombada VHS</label>
                <div className="flex items-center gap-2">
                  <input
                    id="form-vhs-color"
                    type="color"
                    value={vhsBoxColor}
                    onChange={(e) => setVhsBoxColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-mono tracking-wide">{vhsBoxColor.toUpperCase()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Classificar como</label>
                <label className="cursor-pointer flex items-center gap-2 text-xs text-slate-300 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg select-none hover:border-slate-700 transition">
                  <input
                    id="form-classic-chk"
                    type="checkbox"
                    checked={isRetroClassic}
                    onChange={(e) => setIsRetroClassic(e.target.checked)}
                    className="accent-purple-500 rounded"
                  />
                  <span>Retro Clássico</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              id="cancel-create-btn"
              type="button"
              onClick={onClose}
              className="cursor-pointer bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              id="save-movie-btn"
              type="submit"
              disabled={loading}
              className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-6 py-2 rounded-lg hover:brightness-110 active:scale-98 transition flex items-center gap-1.5 shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? 'Gravando...' : 'Adicionar Filme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
