import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ModuleSelector } from '@/components/modules/ModuleSelector';
import { useModules } from '@/contexts/ModulesContext';
import { useCityHall } from '@/contexts/CityHallContext';
import { MODULE_CONFIGS, STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/types/modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Wrench, MapPin, CheckCircle, Clock, AlertTriangle, Route, Navigation, X } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const formatDateBR = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

const getDaysAgo = (date: Date) => {
  const diff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diff === 0 ? 'Hoje' : diff === 1 ? 'Ontem' : `${diff} dias atrás`;
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

const createMarkerIcon = (color: string, label: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function ModuleMaintenance() {
  const { currentModule, getModuleOccurrences, updateOccurrenceStatus } = useModules();
  const { activeCityHall } = useCityHall();
  const config = MODULE_CONFIGS[currentModule];
  const Icon = config.icon;

  const allOccurrences = getModuleOccurrences(currentModule, activeCityHall.id);
  const pending = allOccurrences.filter(o => o.status === 'ABERTA' || o.status === 'EM_ANDAMENTO');
  const highPriority = pending.filter(o => o.priority === 'alta').length;

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [observations, setObservations] = useState('');
  const [activeRoute, setActiveRoute] = useState(false);

  const currentPosition = { latitude: activeCityHall.latitude, longitude: activeCityHall.longitude };

  // Build optimized route (nearest neighbor)
  const suggestedRoute = useMemo(() => {
    const remaining = [...pending];
    const ordered: typeof pending = [];
    let current = currentPosition;
    while (remaining.length) {
      let nearestIdx = 0;
      let nearestDist = Infinity;
      remaining.forEach((item, idx) => {
        const d = distanceKm(current, item);
        if (d < nearestDist) { nearestDist = d; nearestIdx = idx; }
      });
      const [next] = remaining.splice(nearestIdx, 1);
      ordered.push(next);
      current = next;
    }
    return ordered;
  }, [pending, currentPosition]);

  const totalRouteDistance = useMemo(() => {
    if (!suggestedRoute.length) return 0;
    let total = distanceKm(currentPosition, suggestedRoute[0]);
    for (let i = 0; i < suggestedRoute.length - 1; i++) {
      total += distanceKm(suggestedRoute[i], suggestedRoute[i + 1]);
    }
    return total;
  }, [suggestedRoute, currentPosition]);

  const handleStart = (id: string) => {
    updateOccurrenceStatus(id, 'EM_ANDAMENTO');
    toast.success('Atendimento iniciado');
  };

  const handleResolve = () => {
    if (!selectedItemId) return;
    updateOccurrenceStatus(selectedItemId, 'RESOLVIDA', observations || 'Atendimento concluído pelo técnico');
    setDialogOpen(false);
    setObservations('');
    toast.success('Ocorrência resolvida!');
  };

  const startSuggestedRoute = () => {
    if (!suggestedRoute.length) { toast.info('Sem ocorrências pendentes para rota.'); return; }
    setActiveRoute(true);
    toast.success('Rota otimizada ativada no mapa', { description: `${suggestedRoute.length} paradas traçadas por proximidade.` });
  };

  const cancelRoute = () => {
    setActiveRoute(false);
    toast.info('Rota cancelada.');
  };

  const openMapAtLocation = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener,noreferrer');
  };

  const mapCenter: [number, number] = [activeCityHall.latitude, activeCityHall.longitude];

  const routePositions: [number, number][] = activeRoute
    ? [[currentPosition.latitude, currentPosition.longitude], ...suggestedRoute.map(o => [o.latitude, o.longitude] as [number, number])]
    : [];

  const markerColor = config.hslColor;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ModuleSelector />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
              <Wrench className="h-7 w-7" />
              Manutenção — {config.shortName}
            </h1>
            <p className="text-muted-foreground">
              {activeCityHall.city}: técnicos localizam a ocorrência no mapa e atualizam o status no local.
            </p>
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

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{pending.length}</p>
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
                  <p className="text-2xl font-bold text-destructive">{highPriority}</p>
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
                  <p className="text-sm text-muted-foreground">Resolvidas (total)</p>
                  <p className="text-2xl font-bold text-success">{allOccurrences.filter(o => o.status === 'RESOLVIDA').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de Ocorrências — {config.shortName}
            </CardTitle>
            <CardDescription>
              Clique na ocorrência para ver detalhes e atualizar o status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-lg overflow-hidden border">
              <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {pending.map(occ => (
                  <Marker key={occ.id} position={[occ.latitude, occ.longitude]} icon={createMarkerIcon(occ.status === 'EM_ANDAMENTO' ? '#f59e0b' : '#ef4444', occ.id)}>
                    <Popup>
                      <div className="text-sm space-y-1">
                        <p className="font-bold">{occ.id}</p>
                        <p>{occ.description}</p>
                        <p className="text-xs">{occ.address}</p>
                        <p className="text-xs">Status: {STATUS_LABELS[occ.status]}</p>
                        <p className="text-xs">Prioridade: {PRIORITY_LABELS[occ.priority]}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {activeRoute && routePositions.length > 1 && (
                  <Polyline positions={routePositions} color="#2563EB" weight={4} dashArray="10,6" />
                )}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Route */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Sequência sugerida de atendimento
            </CardTitle>
            <CardDescription>
              Ordem automática para reduzir deslocamento entre ocorrências com base em proximidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestedRoute.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">Nenhuma ocorrência pendente.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {suggestedRoute.map((item, idx) => (
                  <div key={`route-${item.id}`} className="rounded-lg border p-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground">Parada {idx + 1}</p>
                    <p className="font-semibold">{item.id}</p>
                    <p className="text-sm text-muted-foreground">{item.address}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${config.color}`} />
              Fila de Atendimento
            </CardTitle>
            <CardDescription>Ocorrências aguardando atendimento ou em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-lg font-medium">Nenhum atendimento pendente!</p>
                <p className="text-muted-foreground">Todas as ocorrências foram resolvidas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map(occ => (
                  <div key={occ.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-lg">{occ.id}</span>
                        <Badge className={PRIORITY_COLORS[occ.priority]}>{PRIORITY_LABELS[occ.priority]}</Badge>
                        <Badge className={STATUS_COLORS[occ.status]}>{STATUS_LABELS[occ.status]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {occ.address}
                      </p>
                      <p className="text-sm">{occ.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Registrado: {formatDateBR(occ.createdAt)} ({getDaysAgo(occ.createdAt)})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openMapAtLocation(occ.latitude, occ.longitude)}>
                        <MapPin className="h-4 w-4 mr-1" />
                        Ver no mapa
                      </Button>
                      {occ.status === 'ABERTA' && (
                        <Button variant="outline" onClick={() => handleStart(occ.id)}>
                          <Clock className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {occ.status === 'EM_ANDAMENTO' && (
                        <Button variant="success" onClick={() => { setSelectedItemId(occ.id); setDialogOpen(true); }}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completion Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Concluir Atendimento</DialogTitle>
              <DialogDescription>
                Confirme a conclusão do atendimento da ocorrência {selectedItemId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button variant="success" onClick={handleResolve}>Confirmar Conclusão</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
