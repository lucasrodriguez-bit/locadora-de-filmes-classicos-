import { Movie, Rental } from '../types';
import { INITIAL_MOVIES } from '../data/movies';
import { getSupabaseClient } from './supabase';

const LOCAL_STORAGE_KEY_MOVIES = 'cineretro_local_movies';
const LOCAL_STORAGE_KEY_RENTALS = 'cineretro_local_rentals';

// Control of the last error captured from Supabase dynamically
let lastSupabaseError: string | null = null;

export function getLastSupabaseError(): string | null {
  return lastSupabaseError;
}

export function clearLastSupabaseError() {
  lastSupabaseError = null;
}

// Local storage helpers
function getLocalMovies(): Movie[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_MOVIES);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY_MOVIES, JSON.stringify(INITIAL_MOVIES));
    return INITIAL_MOVIES;
  }
  return JSON.parse(stored);
}

function saveLocalMovies(movies: Movie[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY_MOVIES, JSON.stringify(movies));
}

function getLocalRentals(): Rental[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_RENTALS);
  return stored ? JSON.parse(stored) : [];
}

function saveLocalRentals(rentals: Rental[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY_RENTALS, JSON.stringify(rentals));
}

// Timeout helper to avoid hanging on slow network or broken Supabase configs
async function withTimeout<T = any>(promise: any, timeoutMs: number = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de conexão com o banco de dados')), timeoutMs)
    )
  ]);
}

export const MovieService = {
  /**
   * Fetch all movies from Supabase or localStorage fallback
   */
  async fetchMovies(): Promise<Movie[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('movies')
            .select('*')
            .order('title', { ascending: true })
        );
        
        if (error) throw error;
        
        // Reset dynamic error marker upon success
        lastSupabaseError = null;

        if (data && data.length > 0) {
          return data.map((item: any) => ({
            ...item,
            rating: Number(item.rating),
            price_per_day: Number(item.price_per_day),
            available_copies: Number(item.available_copies)
          }));
        } else {
          // If Connected to Supabase but tables are completely empty, let's auto-upsert INITIAL_MOVIES to help them seed
          const { error: seedError } = await withTimeout(supabase.from('movies').insert(INITIAL_MOVIES));
          if (!seedError) {
            return INITIAL_MOVIES;
          }
        }
      } catch (err: any) {
        lastSupabaseError = err.message || String(err);
        console.warn('Erro ao buscar do Supabase, usando dados locais de fallback:', err);
      }
    }
    return getLocalMovies();
  },

  /**
   * Fetch all rentals from Supabase or localStorage fallback
   */
  async fetchRentals(): Promise<Rental[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('rentals')
            .select('*')
            .order('rent_date', { ascending: false })
        );
        
        if (error) throw error;

        // Reset dynamic error marker upon success
        lastSupabaseError = null;

        return (data || []).map((item: any) => ({
          ...item,
          total_paid: Number(item.total_paid)
        }));
      } catch (err: any) {
        lastSupabaseError = err.message || String(err);
        console.warn('Erro ao buscar locações do Supabase, usando dados locais:', err);
      }
    }
    return getLocalRentals();
  },

  /**
   * Rent a Movie tape (Supabase sync or local transaction)
   */
  async rentMovie(
    movieId: string,
    renterName: string,
    renterPhone: string,
    days: number
  ): Promise<{ success: boolean; error?: string }> {
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    const supabase = getSupabaseClient();
    let targetMovie: Movie | undefined;
    
    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('movies')
            .select('*')
            .eq('id', movieId)
            .single()
        );
        if (error) throw error;
        targetMovie = {
          ...data,
          rating: Number(data.rating),
          price_per_day: Number(data.price_per_day),
          available_copies: Number(data.available_copies)
        };
      } catch (e) {
        console.error('Erro ao buscar filme no Supabase para aluguel:', e);
      }
    }
    
    if (!targetMovie) {
      const localMovies = getLocalMovies();
      targetMovie = localMovies.find(m => m.id === movieId);
    }

    if (!targetMovie) {
      return { success: false, error: 'Filme não encontrado.' };
    }

    if (targetMovie.available_copies <= 0) {
      return { success: false, error: 'Não há fitas VHS disponíveis deste título em estoque.' };
    }

    const totalPaid = targetMovie.price_per_day * days;
    const newRental: Rental = {
      id: `rent-${Math.random().toString(36).substr(2, 9)}`,
      movie_id: movieId,
      movie_title: targetMovie.title,
      movie_image: targetMovie.image_url,
      rent_date: now.toISOString(),
      due_date: dueDate.toISOString(),
      returned_at: null,
      status: 'active',
      total_paid: totalPaid,
      renter_name: renterName,
      renter_phone: renterPhone || undefined
    };

    if (supabase) {
      try {
        // Insert rental with timeout
        const { error: rentError } = await withTimeout(
          supabase.from('rentals').insert([newRental])
        );
        if (rentError) throw rentError;

        // Decrement copies with timeout
        const { error: movieError } = await withTimeout(
          supabase
            .from('movies')
            .update({ available_copies: targetMovie.available_copies - 1 })
            .eq('id', movieId)
        );
        if (movieError) throw movieError;

        return { success: true };
      } catch (err: any) {
        console.error('Falha de transação com Supabase:', err);
        return { success: false, error: `Erro no Supabase: ${err.message}. Verifique sua conexão e tabelas.` };
      }
    } else {
      // Localstorage transaction fallback
      const localMovies = getLocalMovies();
      const updatedMovies = localMovies.map(m => {
        if (m.id === movieId) {
          return { ...m, available_copies: m.available_copies - 1 };
        }
        return m;
      });
      saveLocalMovies(updatedMovies);

      const localRentals = getLocalRentals();
      saveLocalRentals([newRental, ...localRentals]);

      return { success: true };
    }
  },

  /**
   * Return a rented VHS tape (Supabase sync or local transaction)
   */
  async returnMovie(rentalId: string, movieId: string): Promise<{ success: boolean; error?: string }> {
    const returnDate = new Date().toISOString();
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        // Update rental with timeout
        const { error: rentError } = await withTimeout(
          supabase
            .from('rentals')
            .update({ status: 'returned', returned_at: returnDate })
            .eq('id', rentalId)
        );
        if (rentError) throw rentError;

        // Fetch current movie count to increment safely with timeout
        const { data: movieData, error: fetchErr } = await withTimeout(
          supabase
            .from('movies')
            .select('available_copies')
            .eq('id', movieId)
            .single()
        );
        if (fetchErr) throw fetchErr;

        // Increment movie count with timeout
        const { error: movieError } = await withTimeout(
          supabase
            .from('movies')
            .update({ available_copies: Number(movieData.available_copies) + 1 })
            .eq('id', movieId)
        );
        if (movieError) throw movieError;

        return { success: true };
      } catch (err: any) {
        console.error('Falha ao retornar no Supabase:', err);
        return { success: false, error: err.message };
      }
    } else {
      // Localstorage fallback
      const rentals = getLocalRentals();
      const updatedRentals = rentals.map(r => {
        if (r.id === rentalId) {
          return { ...r, status: 'returned' as const, returned_at: returnDate };
        }
        return r;
      });
      saveLocalRentals(updatedRentals);

      const movies = getLocalMovies();
      const updatedMovies = movies.map(m => {
        if (m.id === movieId) {
          return { ...m, available_copies: m.available_copies + 1 };
        }
        return m;
      });
      saveLocalMovies(updatedMovies);

      return { success: true };
    }
  },

  /**
   * Add interactive custom movie to catalog
   */
  async addMovie(movie: Omit<Movie, 'id'>): Promise<{ success: boolean; data?: Movie; error?: string }> {
    const supabase = getSupabaseClient();
    const id = `m-${Math.random().toString(36).substr(2, 9)}`;
    const fullMovie: Movie = { ...movie, id };

    if (supabase) {
      try {
        const { error } = await withTimeout(
          supabase.from('movies').insert([fullMovie])
        );
        if (error) throw error;
        return { success: true, data: fullMovie };
      } catch (err: any) {
        console.error('Erro ao adicionar filme no Supabase:', err);
        return { success: false, error: err.message };
      }
    } else {
      const localMovies = getLocalMovies();
      const updated = [fullMovie, ...localMovies];
      saveLocalMovies(updated);
      return { success: true, data: fullMovie };
    }
  }
};
