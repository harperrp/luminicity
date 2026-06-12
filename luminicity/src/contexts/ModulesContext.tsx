import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ModuleType, ALL_MODULES, Occurrence, OccurrenceStatus } from '@/types/modules';

interface ModulesContextValue {
  // Active modules per city hall
  getActiveModules: (cityHallId: string) => ModuleType[];
  setActiveModules: (cityHallId: string, modules: ModuleType[]) => void;
  isModuleActive: (cityHallId: string, moduleType: ModuleType) => boolean;
  
  // Current selected module
  currentModule: ModuleType;
  setCurrentModule: (module: ModuleType) => void;
  
  // Occurrences
  occurrences: Occurrence[];
  addOccurrence: (occurrence: Occurrence) => void;
  updateOccurrenceStatus: (id: string, status: OccurrenceStatus, resolution?: string) => void;
  getModuleOccurrences: (moduleType: ModuleType, cityHallId?: string) => Occurrence[];
}

const ModulesContext = createContext<ModulesContextValue | null>(null);

// Default: all city halls have ILUMINACAO active, first city hall has all modules
const DEFAULT_ACTIVE_MODULES: Record<string, ModuleType[]> = {
  '1': [...ALL_MODULES],
  '2': ['ILUMINACAO', 'ARBORIZACAO', 'PAVIMENTACAO'],
  '3': ['ILUMINACAO', 'SANEAMENTO'],
  '4': ['ILUMINACAO'],
};

// Mock occurrences for the Arborização module
const MOCK_OCCURRENCES: Occurrence[] = [
  {
    id: 'OC-ARB-001',
    moduleType: 'ARBORIZACAO',
    status: 'ABERTA',
    description: 'Árvore com galho prestes a cair sobre a fiação elétrica',
    address: 'Av. Principal, 180',
    neighborhood: 'Centro',
    latitude: -15.3985,
    longitude: -42.3095,
    priority: 'alta',
    citizenName: 'José Pereira',
    citizenCpf: '123.456.789-00',
    cityHallId: '1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'OC-ARB-002',
    moduleType: 'ARBORIZACAO',
    status: 'EM_ANDAMENTO',
    description: 'Raízes danificando a calçada e dificultando passagem de pedestres',
    address: 'Rua das Flores, 55',
    neighborhood: 'Jardim das Acácias',
    latitude: -15.3970,
    longitude: -42.3080,
    priority: 'media',
    citizenName: 'Ana Maria',
    citizenCpf: '987.654.321-00',
    cityHallId: '1',
    assignedTechnicianId: '4',
    assignedTechnicianName: 'Carlos Oliveira',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: 'OC-ARB-003',
    moduleType: 'ARBORIZACAO',
    status: 'RESOLVIDA',
    description: 'Árvore caída bloqueando a via após temporal',
    address: 'Rua Nova, 90',
    neighborhood: 'Vila Nova',
    latitude: -15.4005,
    longitude: -42.3115,
    priority: 'alta',
    citizenName: 'Pedro Santos',
    citizenCpf: '111.222.333-44',
    cityHallId: '1',
    assignedTechnicianId: '4',
    assignedTechnicianName: 'Carlos Oliveira',
    resolution: 'Árvore removida e via liberada',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-06'),
    resolvedAt: new Date('2024-01-06'),
  },
  {
    id: 'OC-ARB-004',
    moduleType: 'ARBORIZACAO',
    status: 'ABERTA',
    description: 'Solicitação de poda em árvore obstruindo iluminação',
    address: 'Rua das Palmeiras, 30',
    neighborhood: 'Nova Esperança',
    latitude: -15.3978,
    longitude: -42.3090,
    priority: 'baixa',
    citizenName: 'Maria Costa',
    citizenCpf: '555.666.777-88',
    cityHallId: '1',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
  },
  // Pavimentação
  {
    id: 'OC-PAV-001',
    moduleType: 'PAVIMENTACAO',
    status: 'ABERTA',
    description: 'Buraco grande na via causando risco a veículos',
    address: 'Av. Principal, 350',
    neighborhood: 'Centro',
    latitude: -15.3992,
    longitude: -42.3100,
    priority: 'alta',
    citizenName: 'Roberto Silva',
    citizenCpf: '222.333.444-55',
    cityHallId: '1',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: 'OC-PAV-002',
    moduleType: 'PAVIMENTACAO',
    status: 'RESOLVIDA',
    description: 'Calçada quebrada em frente à escola municipal',
    address: 'Rua da Escola, 100',
    neighborhood: 'Centro',
    latitude: -15.3988,
    longitude: -42.3098,
    priority: 'alta',
    citizenName: 'Luísa Mendes',
    citizenCpf: '333.444.555-66',
    cityHallId: '1',
    assignedTechnicianId: '4',
    assignedTechnicianName: 'Carlos Oliveira',
    resolution: 'Calçada reconstruída',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-07'),
    resolvedAt: new Date('2024-01-07'),
  },
  // Saneamento
  {
    id: 'OC-SAN-001',
    moduleType: 'SANEAMENTO',
    status: 'ABERTA',
    description: 'Vazamento de esgoto na via pública',
    address: 'Rua do Comércio, 200',
    neighborhood: 'Centro',
    latitude: -15.3990,
    longitude: -42.3105,
    priority: 'alta',
    citizenName: 'Marcos Lima',
    citizenCpf: '444.555.666-77',
    cityHallId: '1',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
  },
  // Limpeza
  {
    id: 'OC-LIM-001',
    moduleType: 'LIMPEZA',
    status: 'EM_ANDAMENTO',
    description: 'Lixo acumulado em terreno baldio próximo a residências',
    address: 'Rua Lateral, 45',
    neighborhood: 'Vila Nova',
    latitude: -15.4008,
    longitude: -42.3118,
    priority: 'media',
    citizenName: 'Fernanda Souza',
    citizenCpf: '666.777.888-99',
    cityHallId: '1',
    assignedTechnicianId: '4',
    assignedTechnicianName: 'Carlos Oliveira',
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-11'),
  },
  // Sinalização
  {
    id: 'OC-SIN-001',
    moduleType: 'SINALIZACAO',
    status: 'ABERTA',
    description: 'Placa de pare derrubada no cruzamento',
    address: 'Cruzamento Av. Principal com Rua Nova',
    neighborhood: 'Centro',
    latitude: -15.3995,
    longitude: -42.3108,
    priority: 'alta',
    citizenName: 'Rodrigo Alves',
    citizenCpf: '777.888.999-00',
    cityHallId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

export function ModulesProvider({ children }: { children: ReactNode }) {
  const [activeModulesMap, setActiveModulesMap] = useState<Record<string, ModuleType[]>>(DEFAULT_ACTIVE_MODULES);
  const [currentModule, setCurrentModule] = useState<ModuleType>('ILUMINACAO');
  const [occurrences, setOccurrences] = useState<Occurrence[]>(MOCK_OCCURRENCES);

  const getActiveModules = useCallback((cityHallId: string): ModuleType[] => {
    return activeModulesMap[cityHallId] || ['ILUMINACAO'];
  }, [activeModulesMap]);

  const setActiveModules = useCallback((cityHallId: string, modules: ModuleType[]) => {
    setActiveModulesMap(prev => ({ ...prev, [cityHallId]: modules }));
  }, []);

  const isModuleActive = useCallback((cityHallId: string, moduleType: ModuleType): boolean => {
    const modules = activeModulesMap[cityHallId] || ['ILUMINACAO'];
    return modules.includes(moduleType);
  }, [activeModulesMap]);

  const addOccurrence = useCallback((occurrence: Occurrence) => {
    setOccurrences(prev => [occurrence, ...prev]);
  }, []);

  const updateOccurrenceStatus = useCallback((id: string, status: OccurrenceStatus, resolution?: string) => {
    setOccurrences(prev => prev.map(o => 
      o.id === id 
        ? { ...o, status, resolution, updatedAt: new Date(), resolvedAt: status === 'RESOLVIDA' ? new Date() : o.resolvedAt }
        : o
    ));
  }, []);

  const getModuleOccurrences = useCallback((moduleType: ModuleType, cityHallId?: string): Occurrence[] => {
    return occurrences.filter(o => 
      o.moduleType === moduleType && 
      (cityHallId ? o.cityHallId === cityHallId : true)
    );
  }, [occurrences]);

  return (
    <ModulesContext.Provider value={{
      getActiveModules,
      setActiveModules,
      isModuleActive,
      currentModule,
      setCurrentModule,
      occurrences,
      addOccurrence,
      updateOccurrenceStatus,
      getModuleOccurrences,
    }}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  const ctx = useContext(ModulesContext);
  if (!ctx) throw new Error('useModules must be used within ModulesProvider');
  return ctx;
}
