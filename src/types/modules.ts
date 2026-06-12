import { 
  Lightbulb, TreePine, Construction, Droplets, Trash2, TrafficCone,
  LucideIcon 
} from 'lucide-react';

// ========================
// MODULE TYPES
// ========================
export type ModuleType = 'ILUMINACAO' | 'ARBORIZACAO' | 'PAVIMENTACAO' | 'SANEAMENTO' | 'LIMPEZA' | 'SINALIZACAO';

export type OccurrenceStatus = 'ABERTA' | 'EM_ANDAMENTO' | 'RESOLVIDA';

export interface ModuleConfig {
  id: ModuleType;
  name: string;
  shortName: string;
  icon: LucideIcon;
  color: string; // tailwind color token
  hslColor: string; // raw hsl for charts
  description: string;
  occurrenceTypes: string[];
  occurrenceLabel: string; // e.g. "Poste queimado", "Árvore caída"
  itemLabel: string; // e.g. "Postes", "Árvores"
  singularLabel: string; // e.g. "Poste", "Árvore"
}

export interface Occurrence {
  id: string;
  moduleType: ModuleType;
  status: OccurrenceStatus;
  description: string;
  address: string;
  neighborhood?: string;
  latitude: number;
  longitude: number;
  priority: 'alta' | 'media' | 'baixa';
  citizenName: string;
  citizenCpf: string;
  citizenPhone?: string;
  cityHallId: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  resolution?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// ========================
// MODULE CONFIGURATIONS
// ========================
export const MODULE_CONFIGS: Record<ModuleType, ModuleConfig> = {
  ILUMINACAO: {
    id: 'ILUMINACAO',
    name: 'Iluminação Pública',
    shortName: 'Iluminação',
    icon: Lightbulb,
    color: 'text-yellow-500',
    hslColor: 'hsl(48, 96%, 53%)',
    description: 'Gestão de postes e iluminação pública',
    occurrenceTypes: ['Poste queimado', 'Lâmpada piscando', 'Poste danificado', 'Fiação exposta', 'Luminosidade reduzida'],
    occurrenceLabel: 'Poste com problema',
    itemLabel: 'Postes',
    singularLabel: 'Poste',
  },
  ARBORIZACAO: {
    id: 'ARBORIZACAO',
    name: 'Arborização Urbana',
    shortName: 'Arborização',
    icon: TreePine,
    color: 'text-green-500',
    hslColor: 'hsl(142, 72%, 45%)',
    description: 'Gestão de árvores e áreas verdes',
    occurrenceTypes: ['Árvore caída', 'Galho em risco', 'Poda necessária', 'Raiz danificando calçada', 'Árvore doente', 'Plantio solicitado'],
    occurrenceLabel: 'Problema com árvore',
    itemLabel: 'Árvores',
    singularLabel: 'Árvore',
  },
  PAVIMENTACAO: {
    id: 'PAVIMENTACAO',
    name: 'Pavimentação',
    shortName: 'Pavimentação',
    icon: Construction,
    color: 'text-orange-500',
    hslColor: 'hsl(25, 95%, 53%)',
    description: 'Gestão de vias e pavimentos',
    occurrenceTypes: ['Buraco na via', 'Calçada danificada', 'Asfalto com ondulação', 'Meio-fio quebrado', 'Erosão na via'],
    occurrenceLabel: 'Problema na via',
    itemLabel: 'Ocorrências',
    singularLabel: 'Ocorrência',
  },
  SANEAMENTO: {
    id: 'SANEAMENTO',
    name: 'Saneamento',
    shortName: 'Saneamento',
    icon: Droplets,
    color: 'text-blue-500',
    hslColor: 'hsl(217, 91%, 60%)',
    description: 'Gestão de água e esgoto',
    occurrenceTypes: ['Vazamento de água', 'Esgoto a céu aberto', 'Bueiro entupido', 'Falta de água', 'Boca de lobo entupida'],
    occurrenceLabel: 'Problema de saneamento',
    itemLabel: 'Ocorrências',
    singularLabel: 'Ocorrência',
  },
  LIMPEZA: {
    id: 'LIMPEZA',
    name: 'Limpeza Urbana',
    shortName: 'Limpeza',
    icon: Trash2,
    color: 'text-emerald-500',
    hslColor: 'hsl(160, 84%, 39%)',
    description: 'Gestão de limpeza e coleta',
    occurrenceTypes: ['Lixo acumulado', 'Terreno baldio sujo', 'Entulho na via', 'Coleta não realizada', 'Animal morto na via'],
    occurrenceLabel: 'Problema de limpeza',
    itemLabel: 'Ocorrências',
    singularLabel: 'Ocorrência',
  },
  SINALIZACAO: {
    id: 'SINALIZACAO',
    name: 'Sinalização',
    shortName: 'Sinalização',
    icon: TrafficCone,
    color: 'text-red-500',
    hslColor: 'hsl(0, 72%, 51%)',
    description: 'Gestão de placas e sinalização viária',
    occurrenceTypes: ['Placa danificada', 'Semáforo com defeito', 'Faixa de pedestre apagada', 'Sinalização ausente', 'Placa ilegível'],
    occurrenceLabel: 'Problema de sinalização',
    itemLabel: 'Ocorrências',
    singularLabel: 'Ocorrência',
  },
};

export const ALL_MODULES: ModuleType[] = ['ILUMINACAO', 'ARBORIZACAO', 'PAVIMENTACAO', 'SANEAMENTO', 'LIMPEZA', 'SINALIZACAO'];

export const getModuleConfig = (type: ModuleType): ModuleConfig => MODULE_CONFIGS[type];

export const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  ABERTA: 'Aberta',
  EM_ANDAMENTO: 'Em andamento',
  RESOLVIDA: 'Resolvida',
};

export const STATUS_COLORS: Record<OccurrenceStatus, string> = {
  ABERTA: 'bg-destructive text-destructive-foreground',
  EM_ANDAMENTO: 'bg-warning text-warning-foreground',
  RESOLVIDA: 'bg-success text-success-foreground',
};

export const PRIORITY_LABELS: Record<string, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export const PRIORITY_COLORS: Record<string, string> = {
  alta: 'bg-destructive text-destructive-foreground',
  media: 'bg-warning text-warning-foreground',
  baixa: 'bg-muted text-muted-foreground',
};
