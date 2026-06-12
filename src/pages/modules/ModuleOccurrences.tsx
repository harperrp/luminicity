import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ModuleSelector } from '@/components/modules/ModuleSelector';
import { useModules } from '@/contexts/ModulesContext';
import { useCityHall } from '@/contexts/CityHallContext';
import { MODULE_CONFIGS, STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS, OccurrenceStatus } from '@/types/modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, CheckCircle, PlayCircle, Clock, AlertTriangle, Calendar, User, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const formatDateBR = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

const statusIcons: Record<OccurrenceStatus, React.ReactNode> = {
  ABERTA: <AlertTriangle className="h-3.5 w-3.5" />,
  EM_ANDAMENTO: <Clock className="h-3.5 w-3.5" />,
  RESOLVIDA: <CheckCircle className="h-3.5 w-3.5" />,
};

export default function ModuleOccurrences() {
  const { currentModule, getModuleOccurrences, updateOccurrenceStatus } = useModules();
  const { activeCityHall } = useCityHall();
  const config = MODULE_CONFIGS[currentModule];
  const Icon = config.icon;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OccurrenceStatus | 'TODOS'>('TODOS');
  const [selectedOccurrence, setSelectedOccurrence] = useState<string | null>(null);

  const occurrences = getModuleOccurrences(currentModule, activeCityHall.id);

  const filtered = occurrences.filter(occ => {
    const matchesSearch = occ.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || occ.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const detailOcc = selectedOccurrence ? occurrences.find(o => o.id === selectedOccurrence) : null;

  const handleStatusChange = (id: string, newStatus: OccurrenceStatus) => {
    updateOccurrenceStatus(id, newStatus);
    toast.success(`Ocorrência atualizada para: ${STATUS_LABELS[newStatus]}`);
  };

  // Stats
  const totalOpen = occurrences.filter(o => o.status === 'ABERTA').length;
  const totalInProgress = occurrences.filter(o => o.status === 'EM_ANDAMENTO').length;
  const totalResolved = occurrences.filter(o => o.status === 'RESOLVIDA').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ModuleSelector />

        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <Icon className={`h-7 w-7 ${config.color}`} />
            Ocorrências — {config.shortName}
          </h1>
          <p className="text-muted-foreground">Gerencie as ocorrências de {config.shortName.toLowerCase()}</p>
        </div>

        {/* Stats mini-cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border/30 bg-card/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{occurrences.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOpen}</p>
                <p className="text-xs text-muted-foreground">Abertas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalInProgress}</p>
                <p className="text-xs text-muted-foreground">Em andamento</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalResolved}</p>
                <p className="text-xs text-muted-foreground">Resolvidas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/30">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por ID, descrição ou endereço..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as OccurrenceStatus | 'TODOS')}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Status</SelectItem>
                  <SelectItem value="ABERTA">Abertas</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="RESOLVIDA">Resolvidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Occurrences as cards */}
        {filtered.length === 0 ? (
          <Card className="border-border/30">
            <CardContent className="text-center py-16">
              <Icon className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Nenhuma ocorrência encontrada</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Tente ajustar os filtros de busca</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{filtered.length} ocorrência{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</p>
            
            {filtered.map(occ => (
              <Card key={occ.id} className="border-border/30 hover:border-primary/20 transition-colors group">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Left: Status indicator + info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        occ.status === 'ABERTA' ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                        occ.status === 'EM_ANDAMENTO' ? 'bg-warning/10 border-warning/20 text-warning' :
                        'bg-success/10 border-success/20 text-success'
                      }`}>
                        {statusIcons[occ.status]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">{occ.id}</span>
                          <Badge className={`${STATUS_COLORS[occ.status]} text-[10px] px-1.5 py-0`}>
                            {STATUS_LABELS[occ.status]}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[occ.priority]}`}>
                            {PRIORITY_LABELS[occ.priority]}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80 mt-1 truncate">{occ.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {occ.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {occ.citizenName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateBR(occ.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 sm:self-center">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedOccurrence(occ.id)} className="gap-1.5">
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Detalhes</span>
                      </Button>
                      {occ.status === 'ABERTA' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(occ.id, 'EM_ANDAMENTO')} className="gap-1.5">
                          <PlayCircle className="h-4 w-4" />
                          Iniciar
                        </Button>
                      )}
                      {occ.status === 'EM_ANDAMENTO' && (
                        <Button size="sm" variant="default" onClick={() => handleStatusChange(occ.id, 'RESOLVIDA')} className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground">
                          <CheckCircle className="h-4 w-4" />
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!detailOcc} onOpenChange={() => setSelectedOccurrence(null)}>
          <DialogContent className="sm:max-w-lg">
            {detailOcc && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    Ocorrência {detailOcc.id}
                  </DialogTitle>
                  <DialogDescription>{config.name}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-4 py-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={STATUS_COLORS[detailOcc.status]}>
                        {STATUS_LABELS[detailOcc.status]}
                      </Badge>
                      <Badge variant="outline" className={PRIORITY_COLORS[detailOcc.priority]}>
                        {PRIORITY_LABELS[detailOcc.priority]}
                      </Badge>
                    </div>
                    
                    <Separator />

                    <div className="grid gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Descrição</p>
                        <p className="mt-1">{detailOcc.description}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Endereço</p>
                        <p className="mt-1 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{detailOcc.address}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Cidadão</p>
                          <p className="mt-1">{detailOcc.citizenName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">CPF</p>
                          <p className="mt-1">{detailOcc.citizenCpf}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Criada em</p>
                          <p className="mt-1">{formatDateBR(detailOcc.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Atualizada em</p>
                          <p className="mt-1">{formatDateBR(detailOcc.updatedAt)}</p>
                        </div>
                      </div>
                      {detailOcc.assignedTechnicianName && (
                        <div>
                          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Técnico Responsável</p>
                          <p className="mt-1">{detailOcc.assignedTechnicianName}</p>
                        </div>
                      )}
                      {detailOcc.resolution && (
                        <div>
                          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Resolução</p>
                          <p className="mt-1">{detailOcc.resolution}</p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex gap-2 pt-1">
                      {detailOcc.status === 'ABERTA' && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { handleStatusChange(detailOcc.id, 'EM_ANDAMENTO'); setSelectedOccurrence(null); }}>
                          <PlayCircle className="h-4 w-4" />
                          Iniciar Atendimento
                        </Button>
                      )}
                      {detailOcc.status === 'EM_ANDAMENTO' && (
                        <Button size="sm" className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground" onClick={() => { handleStatusChange(detailOcc.id, 'RESOLVIDA'); setSelectedOccurrence(null); }}>
                          <CheckCircle className="h-4 w-4" />
                          Marcar como Resolvida
                        </Button>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
