import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ModuleActivationCheckboxes } from '@/components/modules/ModuleActivationCheckboxes';
import { useModules } from '@/contexts/ModulesContext';
import { ALL_MODULES, ModuleType } from '@/types/modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Building2, Search, Plus, MapPin, Users, Lightbulb, MoreHorizontal, LogIn, CheckCircle2, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRAZILIAN_STATES, SubscriptionPlanId } from '@/types';
import { useCityHall } from '@/contexts/CityHallContext';
import { PLAN_OPTIONS, formatPoleLimit, getDefaultPoleLimit, getPlanConfig, getPoleUsage, resolvePoleLimit } from '@/lib/plans';
import { toast } from 'sonner';

const formatDate = (date: Date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

export default function DashboardCityHalls() {
  const { cityHalls, activeCityHall, setActiveCityHall, addCityHall, updateCityHall, toggleCityHallStatus } = useCityHall();
  const { getActiveModules, setActiveModules } = useModules();
  const [searchTerm, setSearchTerm] = useState('');

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCep, setNewCep] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newCnpj, setNewCnpj] = useState('');
  const [newPlanId, setNewPlanId] = useState<SubscriptionPlanId>('STARTER');
  const [newPoleLimit, setNewPoleLimit] = useState(getDefaultPoleLimit('STARTER'));
  const [newCoords, setNewCoords] = useState<[number, number] | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [newModules, setNewModules] = useState<ModuleType[]>([...ALL_MODULES]);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editCnpj, setEditCnpj] = useState('');
  const [editPlanId, setEditPlanId] = useState<SubscriptionPlanId>('STARTER');
  const [editPoleLimit, setEditPoleLimit] = useState(getDefaultPoleLimit('STARTER'));
  const [editOrigCity, setEditOrigCity] = useState('');
  const [editOrigState, setEditOrigState] = useState('');
  const [editModules, setEditModules] = useState<ModuleType[]>([]);

  const filteredCityHalls = cityHalls.filter(ch =>
    ch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = cityHalls.reduce((acc, ch) => acc + ch.usersCount, 0);
  const totalPoles = cityHalls.reduce((acc, ch) => acc + ch.polesCount, 0);

  const formatCnpj = (value: string) => {
    const nums = value.replace(/\D/g, '');
    return nums.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d)/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatCep = (value: string) => {
    const nums = value.replace(/\D/g, '');
    return nums.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
  };

  const sanitizePoleLimit = (value: number, fallback: number) => {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(1, Math.floor(value));
  };

  const handleNewPlanChange = (value: string) => {
    const planId = value as SubscriptionPlanId;
    setNewPlanId(planId);
    setNewPoleLimit(getDefaultPoleLimit(planId));
  };

  const handleEditPlanChange = (value: string) => {
    const planId = value as SubscriptionPlanId;
    setEditPlanId(planId);
    setEditPoleLimit(getDefaultPoleLimit(planId));
  };

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setNewCep(formatted);
    const nums = formatted.replace(/\D/g, '');
    if (nums.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${nums}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setNewCity(data.localidade);
          setNewState(data.uf);
          // Geocode the city
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(data.localidade + ', ' + data.uf + ', Brazil')}&format=json&limit=1`);
          const geoData = await geoRes.json();
          if (geoData.length > 0) {
            setNewCoords([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
          }
          toast.success('Cidade encontrada!', { description: `${data.localidade}/${data.uf}` });
        } else {
          toast.error('CEP não encontrado.');
        }
      } catch {
        toast.error('Erro ao buscar CEP.');
      } finally {
        setCepLoading(false);
      }
    } else {
      setNewCoords(null);
    }
  };

  const handleCreate = async () => {
    const sanitizedNewPoleLimit = sanitizePoleLimit(newPoleLimit, getDefaultPoleLimit(newPlanId));
    if (!newName || !newCity || !newState) { toast.error('Preencha todos os campos obrigatórios.'); return; }
    
    let latitude = newCoords?.[0] || 0;
    let longitude = newCoords?.[1] || 0;

    if (!newCoords) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(newCity + ', ' + newState + ', Brazil')}&format=json&limit=1`);
        const data = await res.json();
        if (data.length > 0) {
          latitude = parseFloat(data[0].lat);
          longitude = parseFloat(data[0].lon);
        } else {
          toast.error('Não foi possível encontrar as coordenadas da cidade.');
          return;
        }
      } catch {
        toast.error('Erro ao buscar localização da cidade.');
        return;
      }
    }

    const id = String(Date.now());
    addCityHall({ id, name: newName, city: newCity, state: newState, planId: newPlanId, poleLimit: sanitizedNewPoleLimit, latitude, longitude, cnpj: newCnpj, status: 'ATIVO', createdAt: new Date(), usersCount: 0, polesCount: 0 });
    setActiveModules(id, newModules);
    toast.success('Prefeitura cadastrada!', { description: `${newCity}/${newState}` });
    setCreateOpen(false);
    setNewName(''); setNewCep(''); setNewCity(''); setNewState(''); setNewCnpj(''); setNewPlanId('STARTER'); setNewPoleLimit(getDefaultPoleLimit('STARTER')); setNewCoords(null); setNewModules([...ALL_MODULES]);
  };

  const openEdit = (ch: typeof cityHalls[0]) => {
    setEditId(ch.id); setEditName(ch.name); setEditCity(ch.city); setEditState(ch.state); setEditCnpj(ch.cnpj || '');
    setEditPlanId(ch.planId);
    setEditPoleLimit(resolvePoleLimit(ch.planId, ch.poleLimit));
    setEditOrigCity(ch.city); setEditOrigState(ch.state);
    setEditModules(getActiveModules(ch.id));
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editId) return;
    const currentCityHall = cityHalls.find(ch => ch.id === editId);
    const sanitizedEditPoleLimit = sanitizePoleLimit(editPoleLimit, getDefaultPoleLimit(editPlanId));
    if (currentCityHall && sanitizedEditPoleLimit < currentCityHall.polesCount) {
      toast.error('Limite menor que os postes cadastrados.', {
        description: `Esta prefeitura ja tem ${currentCityHall.polesCount.toLocaleString('pt-BR')} pontos cadastrados.`,
      });
      return;
    }

    const updates: Partial<(typeof cityHalls)[number]> = { name: editName, city: editCity, state: editState, cnpj: editCnpj, planId: editPlanId, poleLimit: sanitizedEditPoleLimit };

    if (editCity !== editOrigCity || editState !== editOrigState) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(editCity + ', ' + editState + ', Brazil')}&format=json&limit=1`);
        const data = await res.json();
        if (data.length > 0) {
          updates.latitude = parseFloat(data[0].lat);
          updates.longitude = parseFloat(data[0].lon);
        }
      } catch { /* keep original coords */ }
    }

    updateCityHall(editId, updates);
    setActiveModules(editId, editModules);
    toast.success('Prefeitura atualizada!');
    setEditOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Prefeituras</h1>
            <p className="text-muted-foreground">Gerencie os municípios cadastrados no sistema</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Prefeitura
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Prefeituras</p>
                  <p className="text-2xl font-bold">{cityHalls.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Usuários</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-chart-1" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Postes</p>
                  <p className="text-2xl font-bold">{totalPoles.toLocaleString()}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou cidade..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 max-w-md" />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Lista de Prefeituras</CardTitle>
            <CardDescription>{filteredCityHalls.length} prefeituras cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cidade/Estado</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Postes</TableHead>
                    <TableHead>Cadastrado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCityHalls.map(ch => {
                    const isActive = activeCityHall.id === ch.id;
                    const plan = getPlanConfig(ch.planId);
                    const poleLimit = resolvePoleLimit(ch.planId, ch.poleLimit);
                    const poleUsage = getPoleUsage(ch.polesCount, poleLimit);
                    return (
                      <TableRow key={ch.id} className={isActive ? 'bg-primary/5' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {ch.name}
                            {isActive && (
                              <Badge variant="outline" className="border-primary text-primary text-[10px]">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Ativa
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {ch.city}/{ch.state}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{ch.cnpj || '—'}</TableCell>
                        <TableCell>
                          <Badge className={ch.status === 'ATIVO' ? 'status-badge-working' : 'bg-muted text-muted-foreground'}>
                            {ch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline">{plan.label}</Badge>
                            <p className="text-xs text-muted-foreground">Limite {formatPoleLimit(poleLimit)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />{ch.usersCount}</div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[140px] space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Lightbulb className="h-4 w-4 text-muted-foreground" />
                              <span className={poleUsage.isAtLimit ? 'font-semibold text-destructive' : ''}>
                                {ch.polesCount.toLocaleString('pt-BR')} / {formatPoleLimit(poleLimit)}
                              </span>
                            </div>
                            <Progress value={poleUsage.percent} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(ch.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setActiveCityHall(ch)}
                                disabled={isActive}
                              >
                                <LogIn className="h-4 w-4 mr-2" />
                                {isActive ? 'Prefeitura Ativa' : 'Acessar Prefeitura'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(ch)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem className={ch.status === 'ATIVO' ? 'text-destructive' : 'text-success'} onClick={() => toggleCityHallStatus(ch.id)}>
                                {ch.status === 'ATIVO' ? 'Desativar' : 'Ativar'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Prefeitura</DialogTitle>
            <DialogDescription>Digite o CEP para buscar automaticamente a cidade e localização no mapa</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome da Prefeitura *</Label><Input placeholder="Prefeitura de..." value={newName} onChange={e => setNewName(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>CEP da Cidade</Label>
              <div className="relative">
                <Input placeholder="00000-000" value={newCep} maxLength={9} onChange={e => handleCepChange(e.target.value)} />
                {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Cidade *</Label><Input placeholder="Nome da cidade" value={newCity} onChange={e => setNewCity(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select value={newState} onValueChange={setNewState}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>{BRAZILIAN_STATES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input placeholder="00.000.000/0001-00" value={newCnpj} maxLength={18} onChange={e => setNewCnpj(formatCnpj(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Plano contratado</Label>
              <Select value={newPlanId} onValueChange={handleNewPlanChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.label} - ate {formatPoleLimit(plan.poleLimit)} pontos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{getPlanConfig(newPlanId).description}</p>
            </div>
            <div className="space-y-2">
              <Label>Quantidade de pontos de poste *</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={newPoleLimit}
                onChange={e => setNewPoleLimit(sanitizePoleLimit(Number(e.target.value), getDefaultPoleLimit(newPlanId)))}
              />
              <p className="text-xs text-muted-foreground">Digite o limite contratado para esta prefeitura.</p>
            </div>
            {newCoords && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Localização encontrada</Label>
                <div className="rounded-lg overflow-hidden border border-border h-48">
                  <iframe
                    title="Mapa da cidade"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${newCoords[1] - 0.05},${newCoords[0] - 0.03},${newCoords[1] + 0.05},${newCoords[0] + 0.03}&layer=mapnik&marker=${newCoords[0]},${newCoords[1]}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Lat: {newCoords[0].toFixed(4)}, Lng: {newCoords[1].toFixed(4)}</p>
              </div>
            )}
            <ModuleActivationCheckboxes activeModules={newModules} onChange={setNewModules} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={cepLoading}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Prefeitura</DialogTitle>
            <DialogDescription>Atualize os dados da prefeitura</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome *</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Cidade *</Label><Input value={editCity} onChange={e => setEditCity(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select value={editState} onValueChange={setEditState}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BRAZILIAN_STATES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input value={editCnpj} maxLength={18} onChange={e => setEditCnpj(formatCnpj(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Plano contratado</Label>
              <Select value={editPlanId} onValueChange={handleEditPlanChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.label} - ate {formatPoleLimit(plan.poleLimit)} pontos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{getPlanConfig(editPlanId).description}</p>
            </div>
            <div className="space-y-2">
              <Label>Quantidade de pontos de poste *</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={editPoleLimit}
                onChange={e => setEditPoleLimit(sanitizePoleLimit(Number(e.target.value), getDefaultPoleLimit(editPlanId)))}
              />
              <p className="text-xs text-muted-foreground">Nao pode ser menor que a quantidade ja cadastrada.</p>
            </div>
            <ModuleActivationCheckboxes activeModules={editModules} onChange={setEditModules} />
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
