import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { MOCK_CITY_HALLS_LIST } from '@/data/mockData';
import { api, type CityHallWithStats } from '@/lib/api';
import { toast } from 'sonner';

interface CityHallContextValue {
  cityHalls: CityHallWithStats[];
  activeCityHall: CityHallWithStats;
  setActiveCityHall: (cityHall: CityHallWithStats) => void;
  addCityHall: (cityHall: CityHallWithStats) => Promise<CityHallWithStats>;
  updateCityHall: (id: string, data: Partial<CityHallWithStats>) => Promise<CityHallWithStats | void>;
  toggleCityHallStatus: (id: string) => Promise<void>;
}

const CityHallContext = createContext<CityHallContextValue | null>(null);

export function CityHallProvider({ children }: { children: ReactNode }) {
  const [cityHalls, setCityHalls] = useState<CityHallWithStats[]>(MOCK_CITY_HALLS_LIST);
  const [activeCityHall, setActiveCityHallState] = useState<CityHallWithStats>(MOCK_CITY_HALLS_LIST[0]);

  useEffect(() => {
    api.getCityHalls()
      .then(items => {
        if (items.length === 0) return;
        setCityHalls(items);
        setActiveCityHallState(prev => items.find(item => item.id === prev.id) ?? items[0]);
      })
      .catch(() => {
        toast.error('API indisponivel', {
          description: 'Usando dados locais ate configurar a hospedagem.',
        });
      });
  }, []);

  const setActiveCityHall = useCallback((cityHall: CityHallWithStats) => {
    setActiveCityHallState(cityHall);
    toast.success(`Acessando ${cityHall.name}`, {
      description: `${cityHall.city}/${cityHall.state}`,
    });
  }, []);

  const addCityHall = useCallback(async (cityHall: CityHallWithStats) => {
    try {
      const created = await api.createCityHall(cityHall);
      setCityHalls(prev => [...prev, created]);
      return created;
    } catch {
      setCityHalls(prev => [...prev, cityHall]);
      toast.error('Nao foi possivel salvar na API', { description: 'Registro mantido apenas nesta sessao.' });
      return cityHall;
    }
  }, []);

  const updateCityHall = useCallback(async (id: string, data: Partial<CityHallWithStats>) => {
    const applyUpdate = (updatedData: Partial<CityHallWithStats>) => {
      setCityHalls(prev => prev.map(ch => ch.id === id ? { ...ch, ...updatedData } : ch));
      setActiveCityHallState(prev => prev.id === id ? { ...prev, ...updatedData } : prev);
    };

    try {
      const updated = await api.updateCityHall(id, data);
      applyUpdate(updated);
      return updated;
    } catch {
      applyUpdate(data);
      toast.error('Nao foi possivel atualizar na API', { description: 'Alteracao mantida apenas nesta sessao.' });
    }
  }, []);

  const toggleCityHallStatus = useCallback(async (id: string) => {
    const target = cityHalls.find(ch => ch.id === id);
    if (!target) return;

    const newStatus = target.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    setCityHalls(prev => {
      return prev.map(ch => ch.id === id ? { ...ch, status: newStatus } : ch);
    });
    setActiveCityHallState(prev => prev.id === id ? { ...prev, status: newStatus } : prev);

    try {
      await api.updateCityHall(id, { status: newStatus });
      toast.success(`Prefeitura ${newStatus === 'ATIVO' ? 'ativada' : 'desativada'}.`);
    } catch {
      toast.error('Nao foi possivel atualizar o status na API.');
    }
  }, [cityHalls]);

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
