import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Pole, PoleStatus } from '@/types';
import { toast } from 'sonner';
import { apiRequest, normalizePole } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCityHall } from '@/contexts/CityHallContext';

interface PolesContextValue {
  poles: Pole[];
  isLoading: boolean;
  refreshPoles: () => Promise<void>;
  addPole: (pole: Pole) => Promise<Pole | null>;
  addPoles: (poles: Pole[]) => Promise<Pole[]>;
  removePole: (poleId: string) => Promise<boolean>;
  updatePoleStatus: (poleId: string, newStatus: PoleStatus) => Promise<Pole | null>;
}

const PolesContext = createContext<PolesContextValue | null>(null);

function mergePoles(current: Pole[], incoming: Pole[]) {
  const byKey = new Map(current.map((pole) => [`${pole.cityHallId}:${pole.id}`, pole]));
  incoming.forEach((pole) => byKey.set(`${pole.cityHallId}:${pole.id}`, pole));
  return Array.from(byKey.values());
}

export function PolesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { activeCityHall } = useCityHall();
  const [poles, setPoles] = useState<Pole[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshPoles = useCallback(async () => {
    if (!user) {
      setPoles([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCityHall?.id) {
        params.set('cityHallId', activeCityHall.id);
      }

      const suffix = params.toString() ? `?${params.toString()}` : '';
      const data = await apiRequest<{ ok: boolean; poles: Pole[] }>(`/api/poles.php${suffix}`);
      setPoles((data.poles ?? []).map(normalizePole));
    } catch (error) {
      setPoles([]);
      toast.error('Nao foi possivel carregar os postes reais do banco.', {
        description: error instanceof Error ? error.message : 'Verifique a conexao com a API.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeCityHall?.id, user]);

  useEffect(() => {
    refreshPoles();
  }, [refreshPoles]);

  const addPole = useCallback(async (pole: Pole) => {
    try {
      const data = await apiRequest<{ ok: boolean; poles: Pole[] }>('/api/poles.php', {
        method: 'POST',
        body: JSON.stringify(pole),
      });
      const savedPoles = (data.poles ?? []).map(normalizePole);
      setPoles((prev) => mergePoles(prev, savedPoles));
      return savedPoles[0] ?? null;
    } catch (error) {
      toast.error('Nao foi possivel cadastrar o poste.', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
      return null;
    }
  }, []);

  const addPoles = useCallback(async (newPoles: Pole[]) => {
    if (newPoles.length === 0) return [];

    try {
      const data = await apiRequest<{ ok: boolean; poles: Pole[] }>('/api/poles.php', {
        method: 'POST',
        body: JSON.stringify({ poles: newPoles }),
      });
      const savedPoles = (data.poles ?? []).map(normalizePole);
      setPoles((prev) => mergePoles(prev, savedPoles));
      return savedPoles;
    } catch (error) {
      toast.error('Nao foi possivel importar os postes.', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
      return [];
    }
  }, []);

  const removePole = useCallback(async (poleId: string) => {
    const pole = poles.find((item) => item.id === poleId);
    const cityHallId = pole?.cityHallId ?? activeCityHall?.id;

    try {
      const params = new URLSearchParams({ id: poleId });
      if (cityHallId) params.set('cityHallId', cityHallId);

      await apiRequest<{ ok: boolean }>(`/api/poles.php?${params.toString()}`, { method: 'DELETE' });
      setPoles((prev) => prev.filter((item) => !(item.id === poleId && (!cityHallId || item.cityHallId === cityHallId))));
      return true;
    } catch (error) {
      toast.error('Nao foi possivel remover o poste.', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
      return false;
    }
  }, [activeCityHall?.id, poles]);

  const updatePoleStatus = useCallback(async (poleId: string, newStatus: PoleStatus) => {
    const pole = poles.find((item) => item.id === poleId);
    const cityHallId = pole?.cityHallId ?? activeCityHall?.id;

    try {
      const params = new URLSearchParams({ id: poleId });
      if (cityHallId) params.set('cityHallId', cityHallId);

      const data = await apiRequest<{ ok: boolean; pole: Pole }>(`/api/poles.php?${params.toString()}`, {
        method: 'PATCH',
        body: JSON.stringify({ id: poleId, cityHallId, status: newStatus }),
      });
      const savedPole = normalizePole(data.pole);
      setPoles((prev) => mergePoles(prev, [savedPole]));
      return savedPole;
    } catch (error) {
      toast.error('Nao foi possivel atualizar o status do poste.', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
      return null;
    }
  }, [activeCityHall?.id, poles]);

  return (
    <PolesContext.Provider value={{ poles, isLoading, refreshPoles, addPole, addPoles, removePole, updatePoleStatus }}>
      {children}
    </PolesContext.Provider>
  );
}

export function usePoles() {
  const ctx = useContext(PolesContext);
  if (!ctx) throw new Error('usePoles must be used within PolesProvider');
  return ctx;
}
