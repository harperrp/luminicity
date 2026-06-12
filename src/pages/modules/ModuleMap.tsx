import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ModuleSelector } from '@/components/modules/ModuleSelector';
import { useModules } from '@/contexts/ModulesContext';
import { useCityHall } from '@/contexts/CityHallContext';
import { MODULE_CONFIGS, STATUS_COLORS, STATUS_LABELS } from '@/types/modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const getMarkerIcon = (status: string) => {
  switch (status) {
    case 'RESOLVIDA': return greenIcon;
    case 'EM_ANDAMENTO': return orangeIcon;
    default: return redIcon;
  }
};

export default function ModuleMap() {
  const { currentModule, getModuleOccurrences } = useModules();
  const { activeCityHall } = useCityHall();
  const config = MODULE_CONFIGS[currentModule];
  const Icon = config.icon;

  const occurrences = getModuleOccurrences(currentModule, activeCityHall.id);
  const mapCenter: [number, number] = [activeCityHall.latitude, activeCityHall.longitude];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ModuleSelector />

        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <MapPin className="h-7 w-7" />
            Mapa — {config.shortName}
          </h1>
          <p className="text-muted-foreground">
            Visualize as ocorrências de {config.shortName.toLowerCase()} em {activeCityHall.city}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${config.color}`} />
              Mapa de Ocorrências — {activeCityHall.city}
            </CardTitle>
            <CardDescription>
              <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-red-500" /> Aberta</span>
              {' · '}
              <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-orange-500" /> Em andamento</span>
              {' · '}
              <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-500" /> Resolvida</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden" style={{ height: 500 }}>
              <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {occurrences.map(occ => (
                  <Marker key={occ.id} position={[occ.latitude, occ.longitude]} icon={getMarkerIcon(occ.status)}>
                    <Popup>
                      <div className="text-xs space-y-1 min-w-[180px]">
                        <p className="font-bold">{occ.id}</p>
                        <p>{occ.description}</p>
                        <p className="text-muted-foreground">{occ.address}</p>
                        <p>Status: {STATUS_LABELS[occ.status]}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
