import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pole, PoleStatus } from '@/types';
import { formatPoleLimit, getPoleUsage } from '@/lib/plans';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const newPoleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const existingPoleIcon = (status: PoleStatus) => {
  const color = status === 'FUNCIONANDO' ? 'green' : 'red';
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  });
};

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface CreatePoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (pole: { id: string; address: string; latitude: number; longitude: number; status: PoleStatus }) => void | boolean | Promise<void | boolean>;
  nextId: string;
  existingPoles?: Pole[];
  mapCenter: [number, number];
  planLabel: string;
  poleLimit: number;
  currentPoleCount: number;
  remainingPoleSlots: number;
}

export function CreatePoleModal({
  open,
  onOpenChange,
  onCreated,
  nextId,
  existingPoles = [],
  mapCenter,
  planLabel,
  poleLimit,
  currentPoleCount,
  remainingPoleSlots,
}: CreatePoleModalProps) {
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState<PoleStatus>('FUNCIONANDO');
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const usage = getPoleUsage(currentPoleCount, poleLimit);

  const handleLocationSelect = async (lat: number, lng: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setMarkerPos([lat, lng]);

    // Reverse geocoding
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
      const data = await res.json();
      if (data?.address) {
        const road = data.address.road || data.address.pedestrian || '';
        const houseNumber = data.address.house_number || '';
        const fullAddress = houseNumber ? `${road}, ${houseNumber}` : road;
        if (fullAddress) setAddress(fullAddress);
      }
    } catch {
      // Silently fail - user can fill manually
    }
  };

  const handleSubmit = async () => {
    if (remainingPoleSlots <= 0) {
      toast.error('Limite de postes atingido.', {
        description: `Esta prefeitura permite ate ${formatPoleLimit(poleLimit)} pontos de poste.`,
      });
      return;
    }

    if (!address || !latitude || !longitude) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Coordenadas inválidas.');
      return;
    }

    setIsSaving(true);
    const created = await onCreated({ id: nextId, address, latitude: lat, longitude: lng, status });
    setIsSaving(false);
    if (created === false) return;
    toast.success('Poste cadastrado!', { description: `${nextId} — ${address}` });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setAddress('');
    setLatitude('');
    setLongitude('');
    setStatus('FUNCIONANDO');
    setMarkerPos(null);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
          toast.success('Localização capturada!');
        },
        () => toast.error('Não foi possível obter a localização.')
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Poste</DialogTitle>
          <DialogDescription>ID do poste: {nextId}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Plano {planLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {currentPoleCount.toLocaleString('pt-BR')} de {formatPoleLimit(poleLimit)} pontos cadastrados
                </p>
              </div>
              <Badge variant={remainingPoleSlots <= 0 ? 'destructive' : 'outline'}>
                {remainingPoleSlots.toLocaleString('pt-BR')} disponiveis
              </Badge>
            </div>
            <Progress value={usage.percent} className="mt-3 h-2" />
          </div>
          <div className="space-y-2">
            <Label>Endereço *</Label>
            <Input placeholder="Ex: Rua das Flores, 100" value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          {/* Map for location selection */}
          <div className="space-y-2">
            <Label>📍 Clique no mapa para selecionar a localização *</Label>
            <div className="rounded-lg overflow-hidden border border-border h-[250px]">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleLocationSelect} />
                {existingPoles.map(pole => (
                  <Marker key={pole.id} position={[pole.latitude, pole.longitude]} icon={existingPoleIcon(pole.status)}>
                    <Popup>
                      <div className="text-xs">
                        <strong>Poste #{pole.id}</strong>
                        <p className="text-muted-foreground">{pole.address}</p>
                        <Badge className={`mt-1 text-[10px] ${pole.status === 'FUNCIONANDO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {pole.status === 'FUNCIONANDO' ? 'Funcionando' : 'Queimado'}
                        </Badge>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {markerPos && <Marker position={markerPos} icon={newPoleIcon} />}
              </MapContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Latitude *</Label>
              <Input placeholder="-15.3989" value={latitude} onChange={e => setLatitude(e.target.value)} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Longitude *</Label>
              <Input placeholder="-42.3091" value={longitude} onChange={e => setLongitude(e.target.value)} readOnly className="bg-muted/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status Inicial</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PoleStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FUNCIONANDO">Funcionando</SelectItem>
                <SelectItem value="QUEIMADO">Queimado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={remainingPoleSlots <= 0 || isSaving}>
            {isSaving ? 'Salvando...' : 'Cadastrar Poste'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
