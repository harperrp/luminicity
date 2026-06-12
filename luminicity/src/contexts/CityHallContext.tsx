import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MOCK_CITY_HALLS_LIST, CityHallWithStats } from '@/data/mockData';
import { toast } from 'sonner';

interface CityHallContextValue {
  cityHalls: CityHallWithStats[];
  activeCityHall: CityHallWithStats;
  setActiveCityHall: (cityHall: CityHallWithStats) => void;
  addCityHall: (cityHall: CityHallWithStats) => void;
  updateCityHall: (id: string, data: Partial<CityHallWithStats>) => void;
  toggleCityHallStatus: (id: string) => void;
}

const CityHallContext = createContext<CityHallContextValue | null>(null);

export function CityHallProvider({ children }: { children: ReactNode }) {
  const [cityHalls, setCityHalls] = useState<CityHallWithStats[]>(MOCK_CITY_HALLS_LIST);
  const [activeCityHall, setActiveCityHallState] = useState<CityHallWithStats>(MOCK_CITY_HALLS_LIST[0]);

  const setActiveCityHall = useCallback((cityHall: CityHallWithStats) => {
    setActiveCityHallState(cityHall);
    toast.success(`Acessando ${cityHall.name}`, {
      description: `${cityHall.city}/${cityHall.state}`,
    });
  }, []);

  const addCityHall = useCallback((cityHall: CityHallWithStats) => {
    setCityHalls(prev => [...prev, cityHall]);
  }, []);

  const updateCityHall = useCallback((id: string, data: Partial<CityHallWithStats>) => {
    setCityHalls(prev => {
      const updated = prev.map(ch => ch.id === id ? { ...ch, ...data } : ch);
      return updated;
    });
    setActiveCityHallState(prev => prev.id === id ? { ...prev, ...data } : prev);
  }, []);

  const toggleCityHallStatus = useCallback((id: string) => {
    setCityHalls(prev => prev.map(ch => {
      if (ch.id === id) {
        const newStatus = ch.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
        toast.success(`Prefeitura ${newStatus === 'ATIVO' ? 'ativada' : 'desativada'}.`);
        return { ...ch, status: newStatus as 'ATIVO' | 'INATIVO' };
      }
      return ch;
    }));
  }, []);

  return (
    <CityHallContext.Provider value={{ cityHalls, activeCityHall, setActiveCityHall, addCityHall, updateCityHall, toggleCityHallStatus }}>
      {children}
    </CityHallContext.Provider>
  );
}

export function useCityHall() {
  const ctx = useContext(CityHallContext);
  if (!ctx) throw new Error('useCityHall must be used within CityHallProvider');
  return ctx;
}
