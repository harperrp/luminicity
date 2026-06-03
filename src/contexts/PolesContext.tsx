import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Pole, PoleStatus } from '@/types';
import { MOCK_POLES } from '@/data/mockData';
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

  const addPole = useCallback((pole: Pole) => {
    setPoles(prev => [...prev, pole]);
  }, []);

  const addPoles = useCallback((newPoles: Pole[]) => {
    setPoles(prev => [...prev, ...newPoles]);
  }, []);

  const removePole = useCallback((poleId: string) => {
    setPoles(prev => prev.filter(p => p.id !== poleId));
  }, []);

  const updatePoleStatus = useCallback((poleId: string, newStatus: PoleStatus) => {
    setPoles(prev =>
      prev.map(p => p.id === poleId ? { ...p, status: newStatus, updatedAt: new Date() } : p)
    );
  }, []);

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
