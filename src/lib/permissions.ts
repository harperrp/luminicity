import type { User, UserPermissions, UserRole } from '@/types';
import { ALL_MODULES, ModuleType } from '@/types/modules';

export const FIELD_ROLE_MODULE: Partial<Record<UserRole, ModuleType>> = {
  FIELD_LIGHTING: 'ILUMINACAO',
  FIELD_TREE: 'ARBORIZACAO',
  FIELD_PAVING: 'PAVIMENTACAO',
  FIELD_SANITATION: 'SANEAMENTO',
  FIELD_CLEANING: 'LIMPEZA',
  FIELD_SIGNALING: 'SINALIZACAO',
};

export const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador Geral',
  CITY_HALL_ADMIN: 'Gestor Municipal',
  SECRETARY: 'Secretário',
  TECHNICAL: 'Técnico Geral',
  FIELD_LIGHTING: 'Técnico iluminação',
  FIELD_TREE: 'Técnico arborização',
  FIELD_PAVING: 'Técnico pavimentação',
  FIELD_SANITATION: 'Técnico saneamento',
  FIELD_CLEANING: 'Técnico limpeza',
  FIELD_SIGNALING: 'Técnico sinalização',
  CUSTOM: 'Usuário personalizado',
  CITIZEN: 'Cidadão',
};

export const roleDescriptions: Record<UserRole, string> = {
  ADMIN: 'Acesso total ao sistema',
  CITY_HALL_ADMIN: 'Cria usuarios da prefeitura',
  SECRETARY: 'Triagem e aprovação de denúncias',
  TECHNICAL: 'Campo em todos os módulos',
  FIELD_LIGHTING: 'Campo para corrigir iluminação',
  FIELD_TREE: 'Campo de arborização',
  FIELD_PAVING: 'Campo de pavimentação',
  FIELD_SANITATION: 'Campo de saneamento',
  FIELD_CLEANING: 'Campo de limpeza urbana',
  FIELD_SIGNALING: 'Campo de sinalização',
  CUSTOM: 'Permissões escolhidas manualmente',
  CITIZEN: 'Registro de denúncias',
};

export const selectableUserRoles: UserRole[] = [
  'CITY_HALL_ADMIN',
  'SECRETARY',
  'TECHNICAL',
  'FIELD_LIGHTING',
  'FIELD_TREE',
  'FIELD_PAVING',
  'FIELD_SANITATION',
  'FIELD_CLEANING',
  'FIELD_SIGNALING',
  'CUSTOM',
];

const emptyPermissions: UserPermissions = {
  modules: [],
  canApproveComplaints: false,
  canManageMaintenance: false,
  canManageUsers: false,
  canManageCityHalls: false,
  canViewReports: false,
  fieldOnly: false,
};

export function getDefaultPermissions(role: UserRole): UserPermissions {
  if (role === 'ADMIN') {
    return {
      modules: [...ALL_MODULES],
      canApproveComplaints: true,
      canManageMaintenance: true,
      canManageUsers: true,
      canManageCityHalls: true,
      canViewReports: true,
      fieldOnly: false,
    };
  }

  if (role === 'CITY_HALL_ADMIN') {
    return {
      modules: [...ALL_MODULES],
      canApproveComplaints: true,
      canManageMaintenance: true,
      canManageUsers: true,
      canManageCityHalls: false,
      canViewReports: true,
      fieldOnly: false,
    };
  }

  if (role === 'SECRETARY') {
    return {
      modules: [...ALL_MODULES],
      canApproveComplaints: true,
      canManageMaintenance: false,
      canManageUsers: false,
      canManageCityHalls: false,
      canViewReports: false,
      fieldOnly: false,
    };
  }

  if (role === 'TECHNICAL') {
    return {
      modules: [...ALL_MODULES],
      canApproveComplaints: false,
      canManageMaintenance: true,
      canManageUsers: false,
      canManageCityHalls: false,
      canViewReports: false,
      fieldOnly: true,
    };
  }

  const fieldModule = FIELD_ROLE_MODULE[role];
  if (fieldModule) {
    return {
      ...emptyPermissions,
      modules: [fieldModule],
      canManageMaintenance: true,
      fieldOnly: true,
    };
  }

  return { ...emptyPermissions, modules: [] };
}

export function normalizeUserPermissions(user: Pick<User, 'role' | 'permissions'>): UserPermissions {
  const defaults = getDefaultPermissions(user.role);
  const permissions = {
    ...defaults,
    ...user.permissions,
    modules: user.permissions?.modules ?? defaults.modules,
  };

  return {
    ...permissions,
    canManageUsers: user.role === 'ADMIN' || user.role === 'CITY_HALL_ADMIN',
    canManageCityHalls: user.role === 'ADMIN',
  };
}

export function canAccessModule(user: User | null, module: ModuleType): boolean {
  if (!user) return false;
  return normalizeUserPermissions(user).modules.includes(module);
}
