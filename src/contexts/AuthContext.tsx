import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { ModuleType } from '@/types/modules';
import { apiRequest, normalizeUser } from '@/lib/api';
import { canAccessModule as userCanAccessModule, getDefaultPermissions, normalizeUserPermissions } from '@/lib/permissions';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (roles: UserRole[]) => boolean;
  canAccessModule: (module: ModuleType) => boolean;
  canApproveComplaints: () => boolean;
  canManageMaintenance: () => boolean;
  canManageUsers: () => boolean;
  canManageCityHalls: () => boolean;
  canViewReports: () => boolean;
  isFieldOnly: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@sistema.gov.br',
    password: 'admin123',
    name: 'Administrador Geral',
    role: 'ADMIN',
    permissions: getDefaultPermissions('ADMIN'),
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'prefeitura@cidade.gov.br',
    password: 'prefeitura123',
    name: 'Joao Silva',
    role: 'CITY_HALL_ADMIN',
    permissions: getDefaultPermissions('CITY_HALL_ADMIN'),
    cityHallId: '1',
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'secretario@cidade.gov.br',
    password: 'secretario123',
    name: 'Maria Santos',
    role: 'SECRETARY',
    permissions: getDefaultPermissions('SECRETARY'),
    cityHallId: '1',
    createdAt: new Date(),
  },
  {
    id: '4',
    email: 'tecnico@cidade.gov.br',
    password: 'tecnico123',
    name: 'Carlos Oliveira',
    role: 'TECHNICAL',
    permissions: getDefaultPermissions('TECHNICAL'),
    cityHallId: '1',
    createdAt: new Date(),
  },
  {
    id: '5',
    email: 'iluminacao@cidade.gov.br',
    password: 'luz12345',
    name: 'Equipe Iluminacao',
    role: 'FIELD_LIGHTING',
    permissions: getDefaultPermissions('FIELD_LIGHTING'),
    cityHallId: '1',
    createdAt: new Date(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? normalizeUser(JSON.parse(stored)) : null;
  });

  useEffect(() => {
    let cancelled = false;

    apiRequest<{ authenticated: boolean; user: User | null }>('/api/auth.php')
      .then((data) => {
        if (cancelled) return;
        if (data.authenticated && data.user) {
          const normalized = normalizeUser(data.user);
          setUser(normalized);
          localStorage.setItem('auth_user', JSON.stringify(normalized));
        } else {
          setUser(null);
          localStorage.removeItem('auth_user');
        }
      })
      .catch((error) => {
        if (!(error instanceof TypeError)) {
          setUser(null);
          localStorage.removeItem('auth_user');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiRequest<{ ok: boolean; user: User }>('/api/auth.php', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.ok && data.user) {
        const normalized = normalizeUser(data.user);
        setUser(normalized);
        localStorage.setItem('auth_user', JSON.stringify(normalized));
        return true;
      }
    } catch (error) {
      if (!(error instanceof TypeError)) {
        return false;
      }
    }

    const foundUser = MOCK_USERS.find((u) => u.email === email && u.password === password);

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    apiRequest('/api/auth.php', { method: 'DELETE' }).catch(() => {});
    setUser(null);
    localStorage.removeItem('auth_user');
  }, []);

  const hasPermission = useCallback((roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  const canAccessModule = useCallback((module: ModuleType): boolean => {
    return userCanAccessModule(user, module);
  }, [user]);

  const canApproveComplaints = useCallback((): boolean => {
    return user ? normalizeUserPermissions(user).canApproveComplaints : false;
  }, [user]);

  const canManageMaintenance = useCallback((): boolean => {
    return user ? normalizeUserPermissions(user).canManageMaintenance : false;
  }, [user]);

  const canManageUsers = useCallback((): boolean => {
    return user ? normalizeUserPermissions(user).canManageUsers : false;
  }, [user]);

  const canManageCityHalls = useCallback((): boolean => {
    return user ? normalizeUserPermissions(user).canManageCityHalls : false;
  }, [user]);

  const canViewReports = useCallback((): boolean => {
    return user ? normalizeUserPermissions(user).canViewReports : false;
  }, [user]);

  const isFieldOnly = useCallback((): boolean => {
    return user ? normalizeUserPermissions(user).fieldOnly : false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        canAccessModule,
        canApproveComplaints,
        canManageMaintenance,
        canManageUsers,
        canManageCityHalls,
        canViewReports,
        isFieldOnly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
