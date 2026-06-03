import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { ModuleType } from '@/types/modules';
import { api } from '@/lib/api';
import { canAccessModule as userCanAccessModule, normalizeUserPermissions } from '@/lib/permissions';

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

function readStoredUser(): User | null {
  const stored = localStorage.getItem('auth_user');
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return { ...parsed, createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date() };
  } catch {
    localStorage.removeItem('auth_user');
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  useEffect(() => {
    api.me()
      .then(currentUser => {
        setUser(currentUser);
        if (currentUser) {
          localStorage.setItem('auth_user', JSON.stringify(currentUser));
        } else {
          localStorage.removeItem('auth_user');
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('auth_user');
      });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await api.login(email, password);
      setUser(authenticatedUser);
      localStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
    api.logout().catch(() => undefined);
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
