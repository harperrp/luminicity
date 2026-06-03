import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, CheckCircle2, Eye, Lightbulb, Maximize2, Minimize2 } from 'lucide-react';
import { Pole, PoleStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { getPoleStats, getRecurrenceLevel, formatDateBR, daysSince } from '@/data/mockData';
import { PoleHistoryDrawer } from '@/components/poles/PoleHistoryDrawer';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createCustomIcon = (status: PoleStatus) => {
  const color = status === 'FUNCIONANDO' ? '#22c55e' : '#ef4444';
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

const VARGEM_GRANDE_CENTER: [number, number] = [-15.3983, -42.3097];

const MOCK_POLES: Pole[] = [
  { id: '1', latitude: -15.3989, longitude: -42.3091, status: 'FUNCIONANDO', neighborhood: 'Centro', address: 'Praça da Matriz, 100', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', latitude: -15.3994, longitude: -42.3102, status: 'QUEIMADO', neighborhood: 'Centro', address: 'Rua Principal, 210', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', latitude: -15.3976, longitude: -42.3088, status: 'FUNCIONANDO', neighborhood: 'Nova Esperança', address: 'Rua das Palmeiras, 55', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: '4', latitude: -15.4002, longitude: -42.3113, status: 'QUEIMADO', neighborhood: 'Vila São José', address: 'Avenida Minas Gerais, 480', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: '5', latitude: -15.3968, longitude: -42.3079, status: 'FUNCIONANDO', neighborhood: 'Jardim das Acácias', address: 'Rua das Flores, 12', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: '6', latitude: -15.4011, longitude: -42.3121, status: 'FUNCIONANDO', neighborhood: 'Vila Nova', address: 'Rua do Campo, 89', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: '7', latitude: -15.402, longitude: -42.3098, status: 'QUEIMADO', neighborhood: 'Bela Vista', address: 'Rua Bela Vista, 300', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
  { id: '8', latitude: -15.3972, longitude: -42.311, status: 'FUNCIONANDO', neighborhood: 'Alto da Serra', address: 'Travessa da Serra, 40', cityHallId: '1', createdAt: new Date(), updatedAt: new Date() },
];

interface PoleInsight {
  failuresTotal: number;
  failuresLast30Days: number;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  label: string;
}

interface PoleMapProps {
  showFilters?: boolean;
  onPoleSelect?: (pole: Pole) => void;
  selectedPoleId?: string;
  editableStatus?: boolean;
  poles?: Pole[];
  onStatusChange?: (poleId: string, newStatus: PoleStatus) => void;
  defaultFilter?: PoleStatus | 'TODOS';
  poleInsights?: Record<string, PoleInsight>;
  route?: RoutePoint[];
  onCancelRoute?: () => void;
  center?: [number, number];
  zoom?: number;
}

function FitRoute({ route }: { route: RoutePoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route.map(r => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [route, map]);
  return null;
}

function useRoadRoute(route?: RoutePoint[]) {
  const [roadGeometry, setRoadGeometry] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!route || route.length < 2) {
      setRoadGeometry([]);
      return;
    }

    const coords = route.map(r => `${r.longitude},${r.latitude}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.routes?.[0]?.geometry?.coordinates) {
          const positions = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number]
          );
          setRoadGeometry(positions);
        }
      })
      .catch(() => {
        // Fallback to straight lines if OSRM fails
        setRoadGeometry(route.map(r => [r.latitude, r.longitude] as [number, number]));
      });
  }, [route]);

  return roadGeometry;
}

export function PoleMap({
  showFilters = true,
  onPoleSelect,
  selectedPoleId,
  editableStatus = false,
  poles,
  onStatusChange,
  defaultFilter = 'TODOS',
  poleInsights,
  route,
  onCancelRoute,
  center = VARGEM_GRANDE_CENTER,
  zoom = 15,
}: PoleMapProps) {
  const [internalPoles, setInternalPoles] = useState<Pole[]>(poles ?? MOCK_POLES);
  const [filter, setFilter] = useState<PoleStatus | 'TODOS'>(defaultFilter);
  const [selectedPole, setSelectedPole] = useState<Pole | null>(null);
  const [historyPole, setHistoryPole] = useState<Pole | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const roadGeometry = useRoadRoute(route);

  const openHistory = (pole: Pole) => {
    // Close any open Leaflet popup first to avoid DOM conflicts with Radix Dialog
    if (mapRef.current) {
      mapRef.current.closePopup();
    }
    setTimeout(() => {
      setHistoryPole(pole);
      setHistoryOpen(true);
    }, 100);
  };

  useEffect(() => {
    if (poles) {
      setInternalPoles(poles);
      if (selectedPole) {
        const updated = poles.find((p) => p.id === selectedPole.id);
        if (updated) setSelectedPole(updated);
      }
    }
  }, [poles, selectedPole]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
    // Invalidate map size after transition
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 300);
  }, []);

  const filteredPoles = internalPoles.filter((pole) => filter === 'TODOS' || pole.status === filter);
  const workingCount = internalPoles.filter((pole) => pole.status === 'FUNCIONANDO').length;
  const brokenCount = internalPoles.filter((pole) => pole.status === 'QUEIMADO').length;

  const handlePoleClick = (pole: Pole) => {
    setSelectedPole(pole);
    if (mapRef.current) {
      mapRef.current.setView([pole.latitude, pole.longitude], mapRef.current.getZoom());
    }
    onPoleSelect?.(pole);
  };

  const updatePoleStatus = (poleId: string, newStatus: PoleStatus) => {
    setInternalPoles((prev) =>
      prev.map((pole) => (pole.id === poleId ? { ...pole, status: newStatus, updatedAt: new Date() } : pole)),
    );

    setSelectedPole((prev) => (prev && prev.id === poleId ? { ...prev, status: newStatus, updatedAt: new Date() } : prev));

    onStatusChange?.(poleId, newStatus);

    toast.success('Status do poste atualizado', {
      description: `Poste #${poleId} agora está ${newStatus === 'FUNCIONANDO' ? 'consertado' : 'queimado'}.`,
    });
  };

  const renderStatusActions = (pole: Pole) => {
    if (!editableStatus) return null;

    const isBroken = pole.status === 'QUEIMADO';

    return (
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant={isBroken ? 'success' : 'outline'} onClick={() => updatePoleStatus(pole.id, 'FUNCIONANDO')}>
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Marcar Consertado
        </Button>
        <Button size="sm" variant={!isBroken ? 'destructive' : 'outline'} onClick={() => updatePoleStatus(pole.id, 'QUEIMADO')}>
          <AlertTriangle className="h-4 w-4 mr-1" />
          Marcar Queimado
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <Button variant={filter === 'TODOS' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('TODOS')}>
              Todos ({internalPoles.length})
            </Button>
            <Button
              variant={filter === 'FUNCIONANDO' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('FUNCIONANDO')}
              className={filter === 'FUNCIONANDO' ? 'bg-success hover:bg-success/90 text-success-foreground' : ''}
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Funcionando ({workingCount})
            </Button>
            <Button variant={filter === 'QUEIMADO' ? 'destructive' : 'outline'} size="sm" onClick={() => setFilter('QUEIMADO')}>
              <AlertTriangle className="h-4 w-4 mr-1" />
              Queimados ({brokenCount})
            </Button>
          </div>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className={cn(
          'relative rounded-xl border overflow-hidden transition-all duration-300',
          isFullscreen ? 'map-fullscreen' : ''
        )}
        style={isFullscreen ? undefined : { height: '500px' }}
      >
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom ref={mapRef}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredPoles.map((pole) => {
            const insight = poleInsights?.[pole.id];
            return (
              <Marker
                key={pole.id}
                position={[pole.latitude, pole.longitude]}
                icon={createCustomIcon(pole.status)}
                eventHandlers={{ click: () => handlePoleClick(pole) }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <strong>Poste #{pole.id}</strong>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          pole.status === 'FUNCIONANDO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {pole.status === 'FUNCIONANDO' ? 'Funcionando' : 'Queimado'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{pole.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openHistory(pole); }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[hsl(var(--warning))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--warning-foreground))] shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                        title="Visualizar histórico completo"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Histórico
                      </button>
                      {editableStatus && (
                        <>
                          <button
                            onClick={() => updatePoleStatus(pole.id, 'FUNCIONANDO')}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                              pole.status === 'QUEIMADO' ? 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]' : 'border bg-transparent text-muted-foreground'
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Consertado
                          </button>
                          <button
                            onClick={() => updatePoleStatus(pole.id, 'QUEIMADO')}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                              pole.status !== 'QUEIMADO' ? 'bg-destructive text-destructive-foreground' : 'border bg-transparent text-muted-foreground'
                            }`}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" /> Queimado
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {/* Route polyline and numbered markers */}
          {route && route.length > 0 && (
            <>
              {/* Route shadow/glow line */}
              <Polyline
                positions={roadGeometry.length > 0 ? roadGeometry : route.map(r => [r.latitude, r.longitude] as [number, number])}
                pathOptions={{ color: '#1e3a5f', weight: 8, opacity: 0.25 }}
              />
              {/* Main route line */}
              <Polyline
                positions={roadGeometry.length > 0 ? roadGeometry : route.map(r => [r.latitude, r.longitude] as [number, number])}
                pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.9 }}
              />
              {/* Animated dashes on top */}
              <Polyline
                positions={roadGeometry.length > 0 ? roadGeometry : route.map(r => [r.latitude, r.longitude] as [number, number])}
                pathOptions={{ color: '#93c5fd', weight: 2, opacity: 0.7, dashArray: '8, 12' }}
              />
              {route.map((point, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === route.length - 1;
                const bg = isFirst ? '#22c55e' : isLast ? '#ef4444' : '#3b82f6';
                const size = isFirst || isLast ? 34 : 28;
                const fontSize = isFirst || isLast ? 15 : 13;
                const icon = isFirst ? '▶' : isLast ? '⬤' : `${idx + 1}`;
                return (
                <Marker
                  key={`route-${idx}`}
                  position={[point.latitude, point.longitude]}
                  icon={L.divIcon({
                    html: `<div style="background:${bg};color:white;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${fontSize}px;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.35);letter-spacing:-0.5px">${icon}</div>`,
                    className: 'route-number-marker',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                  })}
                >
                  <Popup>
                    <div className="p-1 text-sm">
                      <strong>Parada {idx + 1}</strong>
                      <p>{point.label}</p>
                    </div>
                  </Popup>
                </Marker>
                );
              })}

              <FitRoute route={route} />
            </>
          )}
        </MapContainer>

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className={cn(
            "flex items-center justify-center rounded-lg border shadow-xl hover:bg-accent transition-all duration-200",
            isFullscreen
              ? "fixed z-[9999] h-11 gap-2 px-5 py-2.5 shadow-2xl bg-card border-border top-[76px] right-4 lg:top-4 lg:right-4"
              : "absolute top-3 right-3 z-[10] h-9 w-9 bg-card/95 backdrop-blur-sm"
          )}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-4 w-4" />
              <span className="text-sm font-medium">Sair da tela cheia</span>
            </>
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>

        {/* Cancel route button */}
        {route && route.length > 0 && onCancelRoute && (
          <button
            onClick={onCancelRoute}
            className={cn(
              "absolute z-[10] flex items-center gap-2 rounded-lg bg-destructive text-destructive-foreground px-4 py-2.5 shadow-xl hover:bg-destructive/90 transition-all duration-200 text-sm font-medium",
              isFullscreen ? "fixed z-[9999] top-[76px] left-4 lg:top-4 lg:left-4" : "top-3 left-3"
            )}
          >
            <Minimize2 className="h-4 w-4" />
            Cancelar Rota
          </button>
        )}

        <div className={cn(
          "absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border z-[10]",
          isFullscreen && "bottom-6 left-6"
        )}>
          <p className="text-xs font-medium mb-2">Legenda</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span>Funcionando</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span>Queimado</span>
            </div>
          </div>
        </div>
      </div>

      {selectedPole && (
        <div className="rounded-lg border bg-card p-4 animate-fade-in">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Poste #{selectedPole.id}</h3>
                <Badge className={selectedPole.status === 'FUNCIONANDO' ? 'status-badge-working' : 'status-badge-broken'}>
                  {selectedPole.status === 'FUNCIONANDO' ? 'Funcionando' : 'Queimado'}
                </Badge>
                {selectedPoleId === selectedPole.id && <Badge variant="outline">Selecionado</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{selectedPole.address}</p>
              <p className="text-xs text-muted-foreground">
                Coordenadas: {selectedPole.latitude.toFixed(6)}, {selectedPole.longitude.toFixed(6)}
              </p>
              {poleInsights?.[selectedPole.id] && (
                <p className="text-xs text-muted-foreground">
                  Histórico: {poleInsights[selectedPole.id].failuresTotal} queimas totais • {poleInsights[selectedPole.id].failuresLast30Days} em 30 dias
                </p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning))]/90 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                      onClick={() => openHistory(selectedPole)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Visualizar histórico completo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {renderStatusActions(selectedPole)}
              <Button variant="outline" size="sm" onClick={() => setSelectedPole(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      <PoleHistoryDrawer pole={historyPole} open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  );
}
