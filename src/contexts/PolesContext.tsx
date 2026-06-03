import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Pole, PoleStatus } from '@/types';
import { MOCK_POLES } from '@/data/mockData';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PolesContextValue {
  poles: Pole[];
  addPole: (pole: Pole) => void;
  addPoles: (poles: Pole[]) => void;
  removePole: (poleId: string) => void;
  updatePoleStatus: (poleId: string, newStatus: PoleStatus) => void;
}

const PolesContext = createContext<PolesContextValue | null>(null);

export function PolesProvider({ children }: { children: ReactNode }) {
  const [poles, setPoles] = useState<Pole[]>(MOCK_POLES);

  useEffect(() => {
    api.getPoles()
      .then(items => {
        if (items.length > 0) setPoles(items);
      })
      .catch(() => undefined);
  }, []);

  const addPole = useCallback(async (pole: Pole) => {
    setPoles(prev => [...prev.filter(item => item.id !== pole.id), pole]);
    try {
      const saved = await api.savePole(pole);
      setPoles(prev => [...prev.filter(item => item.id !== saved.id), saved]);
    } catch {
      toast.error('Poste salvo apenas localmente', { description: 'Verifique a conexao com a API.' });
    }
  }, []);

  const addPoles = useCallback(async (newPoles: Pole[]) => {
    setPoles(prev => [...prev, ...newPoles]);
    try {
      const saved = await api.importPoles(newPoles);
      setPoles(prev => {
        const importedIds = new Set(saved.map(pole => pole.id));
        return [...prev.filter(pole => !importedIds.has(pole.id)), ...saved];
      });
    } catch {
      toast.error('Importacao salva apenas localmente', { description: 'Verifique a conexao com a API.' });
    }
  }, []);

  const removePole = useCallback(async (poleId: string) => {
    const target = poles.find(pole => pole.id === poleId);
    setPoles(prev => prev.filter(p => p.id !== poleId));
    if (!target) return;

    try {
      await api.deletePole(target.id, target.cityHallId);
    } catch {
      toast.error('Nao foi possivel excluir na API', { description: 'O poste saiu apenas desta sessao.' });
    }
  }, [poles]);

  const updatePoleStatus = useCallback(async (poleId: string, newStatus: PoleStatus) => {
    const target = poles.find(pole => pole.id === poleId);
    setPoles(prev =>
      prev.map(p => p.id === poleId ? { ...p, status: newStatus, updatedAt: new Date() } : p)
    );
    if (!target) return;

    try {
      const saved = await api.updatePoleStatus(target.id, target.cityHallId, newStatus);
      setPoles(prev => prev.map(p => p.id === poleId ? saved : p));
    } catch {
      toast.error('Status alterado apenas localmente', { description: 'Verifique a conexao com a API.' });
    }
  }, [poles]);

  return (
    <PolesContext.Provider value={{ poles, addPole, addPoles, removePole, updatePoleStatus }}>
      {children}
    </PolesContext.Provider>
  );
}

export function usePoles() {
  const ctx = useContext(PolesContext);
  if (!ctx) throw new Error('usePoles must be used within PolesProvider');
  return ctx;
}
