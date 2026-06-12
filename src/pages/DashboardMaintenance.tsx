import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PoleMap, RoutePoint } from '@/components/map/PoleMap';
import { Pole, PoleStatus } from '@/types';
import { Wrench, MapPin, CheckCircle, Clock, AlertTriangle, Route, Navigation, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface PoleFailureStats {
  failuresTotal: number;
  failuresLast30Days: number;
}

interface MaintenanceItem {
  id: string;
  poleId: string;
  address: string;
  latitude: number;
  longitude: number;
  reportedAt: Date;
  priority: 'alta' | 'media' | 'baixa';
  description: string;
}

const INITIAL_POLES: Pole[] = [
  { id: 'P-001', latitude: -15.3989, longitude: -42.3091, status: 'QUEIMADO', neighborhood: 'Centro', address: 'Av. Principal, 200', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'P-004', latitude: -15.4002, longitude: -42.3113, status: 'QUEIMADO', neighborhood: 'Vila Nova', address: 'Rua Nova, 75', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'P-007', latitude: -15.3994, longitude: -42.3102, status: 'QUEIMADO', neighborhood: 'Jardim', address: 'Rua das Árvores, 120', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'P-011', latitude: -15.3976, longitude: -42.3088, status: 'FUNCIONANDO', neighborhood: 'Centro', address: 'Rua das Flores, 330', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
];

const INITIAL_FAILURE_STATS: Record<string, PoleFailureStats> = {
  'P-001': { failuresTotal: 5, failuresLast30Days: 2 },
  'P-004': { failuresTotal: 3, failuresLast30Days: 1 },
  'P-007': { failuresTotal: 6, failuresLast30Days: 3 },
  'P-011': { failuresTotal: 2, failuresLast30Days: 2 },
};

const INITIAL_MAINTENANCE: MaintenanceItem[] = [
  {
    id: '1',
    poleId: 'P-001',
    address: 'Av. Principal, 200',
    latitude: -15.3989,
    longitude: -42.3091,
    reportedAt: new Date('2024-01-15'),
    priority: 'alta',
    description: 'Poste completamente apagado há 3 dias',
  },
  {
    id: '2',
    poleId: 'P-004',
    address: 'Rua Nova, 75',
    latitude: -15.4002,
    longitude: -42.3113,
    reportedAt: new Date('2024-01-14'),
    priority: 'media',
    description: 'Lâmpada piscando intermitentemente',
  },
  {
    id: '3',
    poleId: 'P-007',
    address: 'Rua das Árvores, 120',
    latitude: -15.3994,
    longitude: -42.3102,
    reportedAt: new Date('2024-01-16'),
    priority: 'baixa',
    description: 'Luminosidade reduzida',
  },
];

const priorityConfig = {
  alta: { label: 'Alta', className: 'bg-destructive text-destructive-foreground' },
  media: { label: 'Média', className: 'bg-warning text-warning-foreground' },
  baixa: { label: 'Baixa', className: 'bg-muted text-muted-foreground' },
};

const distanceKm = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const buildRoute = (items: MaintenanceItem[], start: { latitude: number; longitude: number }) => {
  const remaining = [...items];
  const ordered: MaintenanceItem[] = [];
  let current = start;

  while (remaining.length) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    remaining.forEach((item, idx) => {
      const d = distanceKm(current, item);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = idx;
      }
    });

    const [next] = remaining.splice(nearestIdx, 1);
    ordered.push(next);
    current = next;
  }

  return ordered;
};

export default function DashboardMaintenance() {
  const [poles, setPoles] = useState<Pole[]>(INITIAL_POLES);
  const [failureStats] = useState<Record<string, PoleFailureStats>>(INITIAL_FAILURE_STATS);
  const [items, setItems] = useState<MaintenanceItem[]>(INITIAL_MAINTENANCE);
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [observations, setObservations] = useState('');
  const [currentPosition, setCurrentPosition] = useState({ latitude: -15.3983, longitude: -42.3097 });
  const [activeRoute, setActiveRoute] = useState<RoutePoint[] | undefined>(undefined);

  const criticalAlerts = useMemo(
    () => Object.entries(failureStats).filter(([, stats]) => stats.failuresTotal >= 5 || stats.failuresLast30Days >= 2).length,
    [failureStats],
  );

  const suggestedRoute = useMemo(() => buildRoute(items, currentPosition), [items, currentPosition]);

  const totalRouteDistance = useMemo(() => {
    if (!suggestedRoute.length) return 0;

    let total = distanceKm(currentPosition, suggestedRoute[0]);
    for (let i = 0; i < suggestedRoute.length - 1; i++) {
      total += distanceKm(suggestedRoute[i], suggestedRoute[i + 1]);
    }
    return total;
  }, [suggestedRoute, currentPosition]);

  const handleComplete = () => {
    if (!selectedItem) return;

    setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
    setPoles((prev) => prev.map((pole) => pole.id === selectedItem.poleId ? { ...pole, status: 'FUNCIONANDO', updatedAt: new Date() } : pole));
    setDialogOpen(false);
    setObservations('');

    toast.success('Manutenção concluída!', {
      description: `Poste ${selectedItem.poleId} marcado como consertado.`,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getDaysAgo = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 'Hoje' : diff === 1 ? 'Ontem' : `${diff} dias atrás`;
  };

  const openMapAtPole = (item: MaintenanceItem) => {
    window.open(`https://www.google.com/maps?q=${item.latitude},${item.longitude}`, '_blank', 'noopener,noreferrer');
  };

  const startSuggestedRoute = () => {
    if (!suggestedRoute.length) {
      toast.info('Sem postes queimados para rota.');
      return;
    }

    const routePoints: RoutePoint[] = suggestedRoute.map((item) => ({
      latitude: item.latitude,
      longitude: item.longitude,
      label: `${item.poleId} — ${item.address}`,
    }));

    setActiveRoute(routePoints);
    toast.success('Rota otimizada ativada no mapa', {
      description: `${routePoints.length} paradas traçadas por proximidade.`,
    });
  };

  const cancelRoute = () => {
    setActiveRoute(undefined);
    toast.info('Rota cancelada.');
  };

  const handleMapStatusChange = (poleId: string, newStatus: PoleStatus) => {
    setPoles((prev) => prev.map((pole) => pole.id === poleId ? { ...pole, status: newStatus, updatedAt: new Date() } : pole));

    if (newStatus === 'FUNCIONANDO') {
      setItems((prev) => prev.filter((item) => item.poleId !== poleId));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Manutenção</h1>
            <p className="text-muted-foreground">Vargem Grande do Rio Pardo: técnicos encontram o poste exato no mapa e atualizam de queimado para consertado no local.</p>
          </div>
          {activeRoute ? (
            <Button onClick={cancelRoute} variant="destructive" className="w-full md:w-auto">
              <X className="h-4 w-4 mr-2" />
              Cancelar Rota
            </Button>
          ) : (
            <Button onClick={startSuggestedRoute} className="w-full md:w-auto">
              <Route className="h-4 w-4 mr-2" />
              Iniciar Rota Otimizada
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alta Prioridade</p>
                  <p className="text-2xl font-bold">{items.filter((item) => item.priority === 'alta').length}</p>
                </div>
                <Wrench className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rota Estimada</p>
                  <p className="text-2xl font-bold">{totalRouteDistance.toFixed(1)} km</p>
                </div>
                <Navigation className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alertas de Recorrência</p>
                  <p className="text-2xl font-bold text-warning">{criticalAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa dos postes queimados
            </CardTitle>
            <CardDescription>
              Clique no poste para ver histórico de queimas e atualizar status quando o reparo for concluído.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PoleMap
              poles={poles}
              editableStatus={true}
              showFilters={true}
              defaultFilter="QUEIMADO"
              onStatusChange={handleMapStatusChange}
              poleInsights={failureStats}
              route={activeRoute}
              onCancelRoute={cancelRoute}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Sequência sugerida de atendimento
            </CardTitle>
            <CardDescription>
              Ordem automática para reduzir deslocamento entre postes queimados com base em proximidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {suggestedRoute.map((item, idx) => (
                <div key={`route-${item.id}`} className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground">Parada {idx + 1}</p>
                  <p className="font-semibold">{item.poleId}</p>
                  <p className="text-sm text-muted-foreground">{item.address}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Postes para Manutenção
            </CardTitle>
            <CardDescription>
              Use "Ver no mapa" para identificar exatamente o poste na rua e "Concluir" após o reparo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhuma manutenção pendente!</p>
                <p className="text-muted-foreground">Todos os postes estão funcionando.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const history = failureStats[item.poleId];
                  const isFrequent = history && (history.failuresTotal >= 5 || history.failuresLast30Days >= 2);

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-lg">{item.poleId}</span>
                          <Badge className={priorityConfig[item.priority].className}>{priorityConfig[item.priority].label}</Badge>
                          {isFrequent && <Badge className="bg-warning text-warning-foreground">Queima frequente</Badge>}
                        </div>

                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {item.address}
                        </p>

                        <p className="text-sm">{item.description}</p>

                        <p className="text-xs text-muted-foreground">
                          Coordenadas: {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                        </p>

                        {history && (
                          <p className="text-xs text-muted-foreground">
                            Histórico: {history.failuresTotal} queimas totais • {history.failuresLast30Days} em 30 dias
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Reportado: {formatDate(item.reportedAt)} ({getDaysAgo(item.reportedAt)})
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => openMapAtPole(item)}>
                          <MapPin className="h-4 w-4 mr-1" />
                          Ver no mapa
                        </Button>
                        <Button
                          variant="success"
                          onClick={() => {
                            setSelectedItem(item);
                            setDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Concluir Manutenção</DialogTitle>
              <DialogDescription>
                Confirme a conclusão do reparo no poste {selectedItem?.poleId}
              </DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-3">
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-medium">{selectedItem.address}</p>
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações do Técnico</label>
                  <Textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Descreva o serviço realizado..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="success" onClick={handleComplete}>
                Confirmar Conclusão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
