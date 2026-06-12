import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ImportPolesModal } from '@/components/poles/ImportPolesModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lightbulb, Search, Plus, MapPin, Eye, AlertTriangle, CheckCircle, Trash2, Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pole, PoleStatus } from '@/types';
import { getPoleStats, getRecurrenceLevel, formatDateBR } from '@/data/mockData';
import { PoleHistoryDrawer } from '@/components/poles/PoleHistoryDrawer';
import { CreatePoleModal } from '@/components/poles/CreatePoleModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCityHall } from '@/contexts/CityHallContext';
import { usePoles } from '@/contexts/PolesContext';
import { formatPoleLimit, getPlanConfig, getPoleUsage, resolvePoleLimit } from '@/lib/plans';
import { toast } from 'sonner';

export default function DashboardPoles() {
  const { canAccessModule } = useAuth();
  const { poles, addPole, addPoles, removePole, updatePoleStatus } = usePoles();
  const { activeCityHall, updateCityHall } = useCityHall();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PoleStatus | 'TODOS'>('TODOS');
  const [statusChangeTarget, setStatusChangeTarget] = useState<Pole | null>(null);

  const [historyPole, setHistoryPole] = useState<Pole | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pole | null>(null);

  const cityPoles = poles.filter(pole => pole.cityHallId === activeCityHall.id);
  const plan = getPlanConfig(activeCityHall.planId);
  const poleLimit = resolvePoleLimit(activeCityHall.planId, activeCityHall.poleLimit);
  const poleUsage = getPoleUsage(cityPoles.length, poleLimit);
  const cityCenter: [number, number] = [activeCityHall.latitude, activeCityHall.longitude];

  const filteredPoles = cityPoles.filter(pole => {
    const matchesSearch = pole.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pole.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || pole.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const workingCount = cityPoles.filter(p => p.status === 'FUNCIONANDO').length;
  const brokenCount = cityPoles.filter(p => p.status === 'QUEIMADO').length;
  const nextPoleId = `P-${String(poles.length + 1).padStart(3, '0')}`;

  const canViewHistory = canAccessModule('ILUMINACAO');

  const handleCreatePole = async (data: { id: string; address: string; latitude: number; longitude: number; status: PoleStatus }) => {
    if (poleUsage.isAtLimit) {
      toast.error('Limite de postes atingido.', {
        description: `Esta prefeitura permite ate ${formatPoleLimit(poleLimit)} pontos de poste.`,
      });
      return false;
    }

    const newPole: Pole = { ...data, cityHallId: activeCityHall.id, createdAt: new Date(), updatedAt: new Date() };
    const savedPole = await addPole(newPole);
    if (!savedPole) return false;

    updateCityHall(activeCityHall.id, { polesCount: cityPoles.length + 1 });
    return true;
  };

  const handleImportPoles = async (newPoles: Pole[]) => {
    if (newPoles.length > poleUsage.remaining) {
      toast.error('Importacao excede o limite do plano.', {
        description: `Restam ${poleUsage.remaining} pontos no limite contratado.`,
      });
      return false;
    }

    const savedPoles = await addPoles(newPoles.map(pole => ({ ...pole, cityHallId: activeCityHall.id })));
    if (savedPoles.length === 0) return false;

    updateCityHall(activeCityHall.id, { polesCount: cityPoles.length + savedPoles.length });
    return true;
  };

  const toggleStatus = (pole: Pole) => {
    setStatusChangeTarget(pole);
  };

  const confirmStatusChange = async () => {
    if (!statusChangeTarget) return;
    const newStatus: PoleStatus = statusChangeTarget.status === 'FUNCIONANDO' ? 'QUEIMADO' : 'FUNCIONANDO';
    const savedPole = await updatePoleStatus(statusChangeTarget.id, newStatus);
    if (!savedPole) return;
    toast.success(`Status atualizado: ${statusChangeTarget.id}`, {
      description: `Agora está ${newStatus === 'FUNCIONANDO' ? 'consertado' : 'queimado'}.`,
    });
    setStatusChangeTarget(null);
  };

  const handleDeletePole = async () => {
    if (!deleteTarget) return;
    const deleted = await removePole(deleteTarget.id);
    if (!deleted) return;
    updateCityHall(activeCityHall.id, { polesCount: Math.max(cityPoles.length - 1, 0) });
    toast.success(`Poste ${deleteTarget.id} excluído com sucesso.`);
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Postes</h1>
            <p className="text-muted-foreground">Gerencie os pontos de poste de {activeCityHall.city}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)} disabled={poleUsage.isAtLimit}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Planilha
            </Button>
            <Button onClick={() => setCreateOpen(true)} disabled={poleUsage.isAtLimit}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Poste
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{cityPoles.length}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Funcionando</p>
                  <p className="text-2xl font-bold text-[hsl(var(--success))]">{workingCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-[hsl(var(--success))]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Queimados</p>
                  <p className="text-2xl font-bold text-destructive">{brokenCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className={poleUsage.isAtLimit ? 'border-destructive/50 bg-destructive/5' : poleUsage.isNearLimit ? 'border-warning/50 bg-warning/5' : ''}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Limite contratado</p>
                    <p className="text-2xl font-bold">{formatPoleLimit(poleLimit)}</p>
                  </div>
                  <Badge variant={poleUsage.isAtLimit ? 'destructive' : 'outline'}>{plan.label}</Badge>
                </div>
                <Progress value={poleUsage.percent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {cityPoles.length.toLocaleString('pt-BR')} usados, {poleUsage.remaining.toLocaleString('pt-BR')} disponiveis
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {poleUsage.isAtLimit && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Limite de pontos de poste atingido.</p>
                  <p className="text-muted-foreground">
                    Esta prefeitura permite ate {formatPoleLimit(poleLimit)} pontos. Para cadastrar mais postes, aumente a quantidade contratada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por ID ou endereço..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PoleStatus | 'TODOS')}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Status</SelectItem>
                  <SelectItem value="FUNCIONANDO">Funcionando</SelectItem>
                  <SelectItem value="QUEIMADO">Queimado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Poles Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Lista de Postes
            </CardTitle>
            <CardDescription>{filteredPoles.length} postes encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ocorrências</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPoles.map(pole => {
                    const stats = getPoleStats(pole.id);
                    const recurrence = getRecurrenceLevel(pole.id);
                    return (
                      <TableRow key={pole.id}>
                        <TableCell className="font-medium">{pole.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {pole.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${pole.status === 'FUNCIONANDO' ? 'status-badge-working' : 'status-badge-broken'} cursor-pointer`}
                            onClick={() => toggleStatus(pole)}
                          >
                            {pole.status === 'FUNCIONANDO' ? 'Funcionando' : 'Queimado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{stats.total}x</span>
                            {recurrence && (
                              <Badge variant="outline" className={
                                recurrence.level === 'CRITICO' ? 'border-destructive text-destructive' :
                                recurrence.level === 'MEDIO' ? 'border-[hsl(var(--warning))] text-[hsl(var(--warning))]' :
                                'border-muted-foreground'
                              }>
                                {recurrence.level}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDateBR(pole.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            {canViewHistory && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 hover:scale-105 hover:shadow-md transition-all duration-200 active:scale-95"
                                      onClick={() => { setHistoryPole(pole); setHistoryOpen(true); }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Visualizar histórico completo</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="hover:scale-105 hover:shadow-md transition-all duration-200 active:scale-95"
                                    onClick={() => setDeleteTarget(pole)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Excluir poste</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
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

      <PoleHistoryDrawer pole={historyPole} open={historyOpen} onOpenChange={setHistoryOpen} />
      <CreatePoleModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreatePole}
        nextId={nextPoleId}
        existingPoles={cityPoles}
        mapCenter={cityCenter}
        planLabel={plan.label}
        poleLimit={poleLimit}
        currentPoleCount={cityPoles.length}
        remainingPoleSlots={poleUsage.remaining}
      />
      <ImportPolesModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImportPoles}
        existingPoleIds={cityPoles.map(p => p.id)}
        planLabel={plan.label}
        poleLimit={poleLimit}
        currentPoleCount={cityPoles.length}
        remainingPoleSlots={poleUsage.remaining}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Poste {deleteTarget?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o poste <strong>{deleteTarget?.id}</strong> localizado em <strong>{deleteTarget?.address}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!statusChangeTarget} onOpenChange={(open) => { if (!open) setStatusChangeTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar Status do Poste {statusChangeTarget?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja alterar o status do poste <strong>{statusChangeTarget?.id}</strong> de{' '}
              <strong>{statusChangeTarget?.status === 'FUNCIONANDO' ? 'Funcionando' : 'Queimado'}</strong> para{' '}
              <strong>{statusChangeTarget?.status === 'FUNCIONANDO' ? 'Queimado' : 'Funcionando'}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
