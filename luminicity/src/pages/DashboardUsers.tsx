import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Users,
  Search,
  Plus,
  Mail,
  MoreHorizontal,
  Shield,
  UserCheck,
  Wrench,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserPermissions, UserRole } from '@/types';
import { ALL_MODULES, MODULE_CONFIGS, ModuleType } from '@/types/modules';
import { MOCK_USERS_LIST } from '@/data/mockData';
import { getDefaultPermissions, normalizeUserPermissions, roleDescriptions, roleLabels, selectableUserRoles } from '@/lib/permissions';
import { toast } from 'sonner';

const roleConfig: Record<UserRole, { icon: LucideIcon; className: string }> = {
  ADMIN: { icon: Shield, className: 'bg-primary text-primary-foreground' },
  CITY_HALL_ADMIN: { icon: UserCheck, className: 'bg-chart-1 text-white' },
  SECRETARY: { icon: UserCheck, className: 'bg-chart-2 text-white' },
  TECHNICAL: { icon: Wrench, className: 'bg-chart-3 text-foreground' },
  FIELD_LIGHTING: { icon: Wrench, className: 'bg-yellow-500 text-white' },
  FIELD_TREE: { icon: Wrench, className: 'bg-green-600 text-white' },
  FIELD_PAVING: { icon: Wrench, className: 'bg-orange-600 text-white' },
  FIELD_SANITATION: { icon: Wrench, className: 'bg-blue-600 text-white' },
  FIELD_CLEANING: { icon: Wrench, className: 'bg-emerald-600 text-white' },
  FIELD_SIGNALING: { icon: Wrench, className: 'bg-red-600 text-white' },
  CUSTOM: { icon: SlidersHorizontal, className: 'bg-secondary text-secondary-foreground' },
  CITIZEN: { icon: Users, className: 'bg-muted text-muted-foreground' },
};

const actionPermissionLabels: Array<{ key: keyof Omit<UserPermissions, 'modules'>; label: string }> = [
  { key: 'canApproveComplaints', label: 'Aprovar denuncias' },
  { key: 'canManageMaintenance', label: 'Campo/manutencao' },
  { key: 'canViewReports', label: 'Ver relatorios' },
  { key: 'fieldOnly', label: 'Apenas campo' },
];

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

function PermissionEditor({
  permissions,
  onChange,
}: {
  permissions: UserPermissions;
  onChange: (permissions: UserPermissions) => void;
}) {
  const toggleModule = (moduleId: ModuleType) => {
    const hasModule = permissions.modules.includes(moduleId);
    onChange({
      ...permissions,
      modules: hasModule
        ? permissions.modules.filter(module => module !== moduleId)
        : [...permissions.modules, moduleId],
    });
  };

  const toggleFlag = (key: keyof Omit<UserPermissions, 'modules'>) => {
    onChange({ ...permissions, [key]: !permissions[key] });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div className="space-y-2">
        <Label>Modulos que o usuario pode ver</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ALL_MODULES.map(moduleId => {
            const config = MODULE_CONFIGS[moduleId];
            const Icon = config.icon;
            const active = permissions.modules.includes(moduleId);
            return (
              <button
                key={moduleId}
                type="button"
                onClick={() => toggleModule(moduleId)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-primary' : config.color}`} />
                <span className="truncate">{config.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Permissoes operacionais</Label>
        <p className="text-xs text-muted-foreground">
          Gerenciar prefeituras e exclusivo do Administrador Geral. Criar usuarios da prefeitura fica com o Gestor Municipal.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {actionPermissionLabels.map(permission => (
            <label
              key={permission.key}
              className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={Boolean(permissions[permission.key])}
                onChange={() => toggleFlag(permission.key)}
                className="h-4 w-4 accent-primary"
              />
              {permission.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function PermissionSummary({ user }: { user: User }) {
  const permissions = normalizeUserPermissions(user);
  const moduleNames = permissions.modules.map(moduleId => MODULE_CONFIGS[moduleId].shortName);
  const allModules = permissions.modules.length === ALL_MODULES.length;
  const visibleModuleNames = moduleNames.slice(0, 2);
  const extraModules = moduleNames.length - visibleModuleNames.length;
  const moduleSummary =
    permissions.modules.length === 0
      ? 'Sem modulo'
      : allModules
        ? `Todos os modulos (${permissions.modules.length})`
        : `${visibleModuleNames.join(', ')}${extraModules > 0 ? ` +${extraModules}` : ''}`;
  const actionSummaries = [
    permissions.canApproveComplaints && 'Aprova denuncias',
    permissions.canManageMaintenance && 'Manutencao',
    permissions.canViewReports && 'Relatorios',
    permissions.canManageUsers && 'Cria usuarios',
    permissions.canManageCityHalls && 'Prefeituras',
    permissions.fieldOnly && 'Apenas campo',
  ].filter(Boolean) as string[];

  return (
    <div className="min-w-[230px] max-w-[340px] border-l border-border/70 pl-3">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase text-muted-foreground">Modulos</p>
        <p className="truncate text-sm font-semibold text-foreground" title={moduleNames.join(', ')}>
          {moduleSummary}
        </p>
      </div>

      {actionSummaries.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {actionSummaries.map(action => (
            <span key={action} className="inline-flex items-center gap-1 whitespace-nowrap">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              {action}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">Sem acoes operacionais</p>
      )}
    </div>
  );
}

function RoleBadge({ user }: { user: User }) {
  const role = roleConfig[user.role];
  const Icon = role.icon;

  return (
    <Badge className={`${role.className} gap-1`}>
      <Icon className="h-3 w-3" />
      {roleLabels[user.role]}
    </Badge>
  );
}

function UserActionsMenu({
  user,
  onEdit,
  onDeactivate,
}: {
  user: User;
  onEdit: (user: User) => void;
  onDeactivate: (user: User) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(user)}>Editar permissoes</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success('E-mail de redefinicao enviado!', { description: user.email })}>
          Redefinir Senha
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => onDeactivate(user)}>Desativar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardUsers() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS_LIST);
  const [searchTerm, setSearchTerm] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('FIELD_LIGHTING');
  const [newPermissions, setNewPermissions] = useState<UserPermissions>(getDefaultPermissions('FIELD_LIGHTING'));

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('FIELD_LIGHTING');
  const [editPermissions, setEditPermissions] = useState<UserPermissions>(getDefaultPermissions('FIELD_LIGHTING'));

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roleLabels[user.role].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fieldUsers = users.filter(user => normalizeUserPermissions(user).fieldOnly).length;
  const approvalUsers = users.filter(user => normalizeUserPermissions(user).canApproveComplaints).length;
  const customUsers = users.filter(user => user.role === 'CUSTOM').length;
  const multiModuleUsers = users.filter(user => normalizeUserPermissions(user).modules.length > 1).length;

  const setRoleDefaults = (
    role: UserRole,
    setRole: (role: UserRole) => void,
    setPermissions: (permissions: UserPermissions) => void,
  ) => {
    setRole(role);
    setPermissions(getDefaultPermissions(role));
  };

  const handleCreate = () => {
    if (!newName || !newEmail) {
      toast.error('Preencha nome e e-mail.');
      return;
    }
    if (newPermissions.modules.length === 0) {
      toast.error('Selecione ao menos um modulo.');
      return;
    }

    const id = String(users.length + 1);
    setUsers(prev => [
      ...prev,
      {
        id,
        name: newName,
        email: newEmail,
        role: newRole,
        permissions: newPermissions,
        cityHallId: '1',
        createdAt: new Date(),
      },
    ]);
    toast.success('Usuario criado!', { description: roleLabels[newRole] });
    setCreateOpen(false);
    setNewName('');
    setNewEmail('');
    setRoleDefaults('FIELD_LIGHTING', setNewRole, setNewPermissions);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPermissions(normalizeUserPermissions(user));
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editUser || !editName || !editEmail) return;
    if (editPermissions.modules.length === 0) {
      toast.error('Selecione ao menos um modulo.');
      return;
    }

    setUsers(prev =>
      prev.map(user =>
        user.id === editUser.id
          ? { ...user, name: editName, email: editEmail, role: editRole, permissions: editPermissions }
          : user
      )
    );
    toast.success('Usuario atualizado!');
    setEditOpen(false);
  };

  const handleDeactivate = (user: User) => {
    setUsers(prev => prev.filter(item => item.id !== user.id));
    toast.success('Usuario desativado.', { description: user.name });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Usuarios</h1>
            <p className="text-muted-foreground">Gerencie cargos, equipes de campo e permissoes por modulo.</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuario
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Equipes de campo</p>
                  <p className="text-2xl font-bold">{fieldUsers}</p>
                </div>
                <MapPin className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aprovam denuncias</p>
                  <p className="text-2xl font-bold">{approvalUsers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Multi-modulo</p>
                  <p className="text-2xl font-bold">{multiModuleUsers}</p>
                </div>
                <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Personalizados</p>
                  <p className="text-2xl font-bold">{customUsers}</p>
                </div>
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou cargo..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className="pl-9 max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Lista de Usuarios</CardTitle>
            <CardDescription>{filteredUsers.length} usuarios cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 lg:hidden">
              {filteredUsers.map(user => (
                <div key={user.id} className="rounded-lg border border-border/70 bg-muted/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                    <UserActionsMenu user={user} onEdit={openEdit} onDeactivate={handleDeactivate} />
                  </div>

                  <div className="mt-3">
                    <RoleBadge user={user} />
                  </div>

                  <div className="mt-4">
                    <PermissionSummary user={user} />
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">Cadastrado em {formatDate(user.createdAt)}</p>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Permissoes</TableHead>
                    <TableHead>Cadastrado em</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => {
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge user={user} />
                        </TableCell>
                        <TableCell className="min-w-[260px]">
                          <PermissionSummary user={user} />
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <UserActionsMenu user={user} onEdit={openEdit} onDeactivate={handleDeactivate} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Usuario</DialogTitle>
            <DialogDescription>Crie cargos separados por equipe de campo ou um usuario personalizado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input placeholder="Nome do usuario" value={newName} onChange={event => setNewName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input type="email" placeholder="email@cidade.gov.br" value={newEmail} onChange={event => setNewEmail(event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cargo base *</Label>
              <Select value={newRole} onValueChange={value => setRoleDefaults(value as UserRole, setNewRole, setNewPermissions)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {selectableUserRoles.map(role => (
                    <SelectItem key={role} value={role}>{roleLabels[role]} - {roleDescriptions[role]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <PermissionEditor permissions={newPermissions} onChange={setNewPermissions} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Criar Usuario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Atualize cargo, modulos visiveis e acoes permitidas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input value={editName} onChange={event => setEditName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input type="email" value={editEmail} onChange={event => setEditEmail(event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cargo base *</Label>
              <Select value={editRole} onValueChange={value => setRoleDefaults(value as UserRole, setEditRole, setEditPermissions)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {selectableUserRoles.map(role => (
                    <SelectItem key={role} value={role}>{roleLabels[role]} - {roleDescriptions[role]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <PermissionEditor permissions={editPermissions} onChange={setEditPermissions} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
