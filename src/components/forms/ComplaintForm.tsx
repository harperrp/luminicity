import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, CheckCircle, AlertCircle, AlertTriangle, MapPin, Heart, ThumbsUp, Sparkles, SquareX, Camera, Image } from 'lucide-react';
import radgovLogo from '@/assets/radgov-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { ModuleType, MODULE_CONFIGS, ALL_MODULES } from '@/types/modules';
import type { Pole } from '@/types';
import { useCityHall } from '@/contexts/CityHallContext';
import { usePoles } from '@/contexts/PolesContext';
import { useModules } from '@/contexts/ModulesContext';
import { api } from '@/lib/api';

// Fix leaflet icons
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
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const pinkIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function ManualClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Default active modules per city hall (mirrors ModulesContext)
const DEFAULT_ACTIVE_MODULES: Record<string, ModuleType[]> = {
  '1': [...ALL_MODULES],
  '2': ['ILUMINACAO', 'ARBORIZACAO', 'PAVIMENTACAO'],
  '3': ['ILUMINACAO', 'SANEAMENTO'],
  '4': ['ILUMINACAO'],
};

const complaintSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (formato: 000.000.000-00)'),
  phone: z.string().optional(),
  observations: z.string().max(500).optional(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

export function ComplaintForm() {
  const { cityHalls } = useCityHall();
  const { poles } = usePoles();
  const { getActiveModules } = useModules();
  const [selectedCityHallId, setSelectedCityHallId] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<ModuleType | ''>('');
  const [selectedPole, setSelectedPole] = useState<Pole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showBurnedDialog, setShowBurnedDialog] = useState(false);

  const [poleNotOnMap, setPoleNotOnMap] = useState(false);
  const [manualMarkerPos, setManualMarkerPos] = useState<[number, number] | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  
  // Photo upload (non-ILUMINACAO modules, or when "poste não aparece no mapa")
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Occurrence type for non-ILUMINACAO modules
  const [occurrenceType, setOccurrenceType] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
  });

  const activeCityHalls = cityHalls.filter(ch => ch.status === 'ATIVO');

  // Get active modules for the selected city hall
  const activeModules = useMemo(() => {
    if (!selectedCityHallId) return [];
    return getActiveModules(selectedCityHallId) || DEFAULT_ACTIVE_MODULES[selectedCityHallId] || ['ILUMINACAO'];
  }, [getActiveModules, selectedCityHallId]);

  const isIluminacao = selectedModule === 'ILUMINACAO';
  const moduleConfig = selectedModule ? MODULE_CONFIGS[selectedModule] : null;

  // Show photo upload: always for non-ILUMINACAO, or when "poste não aparece no mapa" for ILUMINACAO
  const showPhotoUpload = selectedModule && (!isIluminacao || poleNotOnMap);

  const cityPoles = useMemo(() => {
    if (!selectedCityHallId) return [];
    return poles.filter(p => p.cityHallId === selectedCityHallId);
  }, [poles, selectedCityHallId]);

  const mapCenter = useMemo(() => {
    const ch = cityHalls.find(c => c.id === selectedCityHallId);
    if (ch) return { lat: ch.latitude, lng: ch.longitude };
    if (cityPoles.length === 0) return { lat: -15.3989, lng: -42.3091 };
    const avgLat = cityPoles.reduce((s, p) => s + p.latitude, 0) / cityPoles.length;
    const avgLng = cityPoles.reduce((s, p) => s + p.longitude, 0) / cityPoles.length;
    return { lat: avgLat, lng: avgLng };
  }, [cityHalls, cityPoles, selectedCityHallId]);

  const isPoleAlreadyBurned = selectedPole?.status === 'QUEIMADO';

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleManualLocationSelect = async (lat: number, lng: number) => {
    setManualMarkerPos([lat, lng]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
      const data = await res.json();
      if (data?.address) {
        const road = data.address.road || data.address.pedestrian || '';
        const houseNumber = data.address.house_number || '';
        setManualAddress(houseNumber ? `${road}, ${houseNumber}` : road);
      }
    } catch {
      // user can describe in observations
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande', { description: 'O tamanho máximo permitido é 5MB.' });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ComplaintFormData) => {
    if (!selectedModule) {
      toast.error('Selecione o tipo de denúncia');
      return;
    }

    if (isIluminacao) {
      if (poleNotOnMap) {
        if (!manualMarkerPos) {
          toast.error('Marque a localização no mapa', { description: 'Clique no mapa para indicar onde o poste está.' });
          return;
        }
      } else {
        if (!selectedPole) {
          toast.error('Selecione um poste', { description: 'Clique em um poste no mapa para selecioná-lo.' });
          return;
        }
        if (isPoleAlreadyBurned) {
          toast.info('Este poste já está com reparo solicitado.');
          return;
        }
      }
    } else {
      // Non-illumination: require location and occurrence type
      if (!manualMarkerPos) {
        toast.error('Marque a localização no mapa', { description: 'Clique no mapa para indicar o local do problema.' });
        return;
      }
      if (!occurrenceType) {
        toast.error('Selecione o tipo de ocorrência');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const latitude = isIluminacao && !poleNotOnMap ? selectedPole!.latitude : manualMarkerPos![0];
      const longitude = isIluminacao && !poleNotOnMap ? selectedPole!.longitude : manualMarkerPos![1];
      const description = data.observations?.trim()
        || (isIluminacao && selectedPole ? `Poste ${selectedPole.id} com problema` : occurrenceType);

      await api.createComplaint({
        cityHallId: selectedCityHallId,
        moduleId: selectedModule,
        occurrenceType: isIluminacao ? 'Poste com problema' : occurrenceType,
        poleId: isIluminacao && !poleNotOnMap ? selectedPole!.id : undefined,
        poleNotOnMap,
        manualAddress,
        photoUrl: photoFile?.name,
        citizenName: data.name,
        citizenCpf: data.cpf,
        citizenPhone: data.phone,
        description,
        latitude,
        longitude,
      });

      setIsSubmitted(true);
      toast.success('Denuncia registrada com sucesso!', {
        description: 'A equipe responsavel recebera o chamado no painel.',
      });
    } catch (error) {
      toast.error('Nao foi possivel registrar a denuncia', {
        description: error instanceof Error ? error.message : 'Verifique a conexao e tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSelectedPole(null);
    setSelectedCityHallId('');
    setSelectedModule('');
    setPoleNotOnMap(false);
    setManualMarkerPos(null);
    setManualAddress('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setOccurrenceType('');
    reset();
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12 space-y-8 animate-fade-in">
        <div className="relative flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-success/5 animate-[ping_2s_ease-in-out_1]" />
          </div>
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-success/20 to-success/5 border border-success/20 mx-auto shadow-lg shadow-success/10">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-success/30 to-success/10 border border-success/30">
              <CheckCircle className="h-10 w-10 text-success animate-scale-in" />
            </div>
          </div>
          <Sparkles className="absolute top-0 right-1/3 h-5 w-5 text-accent animate-pulse" />
          <Sparkles className="absolute bottom-2 left-1/3 h-4 w-4 text-primary animate-pulse delay-300" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground">Denúncia Registrada!</h3>
          <div className="max-w-md mx-auto space-y-3">
            <div className="rounded-xl bg-success/5 border border-success/15 p-4">
              <p className="text-sm text-foreground leading-relaxed">
                {moduleConfig && (
                  <span className="font-semibold">{moduleConfig.name} — </span>
                )}
                {isIluminacao && selectedPole ? (
                  <>Poste <strong className="text-primary">{selectedPole.id}</strong>
                  {selectedPole.address && <> — <strong className="text-primary">{selectedPole.address}</strong></>}</>
                ) : (
                  <>{manualAddress && <strong className="text-primary">{manualAddress}</strong>}</>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Protocolo registrado com sucesso</p>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nossa equipe irá analisar e tomar as providências necessárias.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-destructive animate-pulse" />
            <span>Obrigado por contribuir com a comunidade</span>
            <Heart className="h-4 w-4 text-destructive animate-pulse" />
          </div>
          <div className="flex items-center justify-center">
            <img src={radgovLogo} alt="RAD GOV" className="h-12 w-auto object-contain drop-shadow-md" />
          </div>
        </div>

        <Button onClick={handleReset} variant="outline" size="lg" className="mt-4 gap-2">
          <Send className="h-4 w-4" />
          Fazer Nova Denúncia
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* City Selection */}
      <div className="space-y-2">
        <Label>Cidade *</Label>
        <Select
          value={selectedCityHallId}
          onValueChange={value => {
            setSelectedCityHallId(value);
            setSelectedPole(null);
            setSelectedModule('');
            setPoleNotOnMap(false);
            setManualMarkerPos(null);
            setManualAddress('');
            setOccurrenceType('');
            setPhotoFile(null);
            setPhotoPreview(null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a cidade" />
          </SelectTrigger>
          <SelectContent>
            {activeCityHalls.map(ch => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.city} — {ch.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Module Type Selection */}
      {selectedCityHallId && activeModules.length > 0 && (
        <div className="space-y-3">
          <Label>Tipo de Denúncia *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeModules.map(modType => {
              const cfg = MODULE_CONFIGS[modType];
              const Icon = cfg.icon;
              const isSelected = selectedModule === modType;
              return (
                <button
                  key={modType}
                  type="button"
                  onClick={() => {
                    setSelectedModule(modType as ModuleType);
                    setSelectedPole(null);
                    setPoleNotOnMap(false);
                    setManualMarkerPos(null);
                    setManualAddress('');
                    setOccurrenceType('');
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md'
                      : 'border-border/40 bg-card/40 hover:border-primary/30 hover:bg-card/60'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isSelected ? 'text-primary' : cfg.color}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {cfg.shortName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Occurrence Type for non-ILUMINACAO */}
      {selectedModule && !isIluminacao && moduleConfig && (
        <div className="space-y-2">
          <Label>Tipo de Ocorrência *</Label>
          <Select value={occurrenceType} onValueChange={setOccurrenceType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de problema" />
            </SelectTrigger>
            <SelectContent>
              {moduleConfig.occurrenceTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Map: ILUMINACAO shows poles, others show click-to-mark */}
      {selectedModule && isIluminacao && (
        <div className="space-y-3">
          <Label>Selecione o Poste no Mapa *</Label>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            💡 Clique em um poste existente no mapa para selecioná-lo.
          </p>

          {/* Pole not on map checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={poleNotOnMap}
              onChange={e => {
                setPoleNotOnMap(e.target.checked);
                setSelectedPole(null);
                setManualMarkerPos(null);
                setManualAddress('');
              }}
              className="accent-destructive h-4 w-4"
            />
            <SquareX className="h-4 w-4 text-destructive" />
            <span className="text-foreground font-medium">O poste não aparece no mapa</span>
          </label>

          {poleNotOnMap && (
            <p className="text-xs text-warning flex items-center gap-1">
              ⚠️ Marque no mapa o local aproximado do poste e envie uma foto para identificação.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-500" /> Funcionando</span>
            {' · '}
            <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-orange-500" /> Queimado</span>
            {' · '}
            {poleNotOnMap 
              ? <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-violet-500" /> Sua seleção</span>
              : <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-blue-500" /> Selecionado</span>
            }
          </p>

          <div className="rounded-lg border overflow-hidden" style={{ height: 350 }}>
            <MapContainer
              key={`${selectedCityHallId}-${poleNotOnMap}`}
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {poleNotOnMap && <ManualClickHandler onLocationSelect={handleManualLocationSelect} />}
              {cityPoles.map(pole => (
                <Marker
                  key={pole.id}
                  position={[pole.latitude, pole.longitude]}
                  icon={selectedPole?.id === pole.id ? blueIcon : pole.status === 'QUEIMADO' ? redIcon : greenIcon}
                  eventHandlers={{ click: () => { if (!poleNotOnMap) setSelectedPole(pole); } }}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-bold">{pole.id}</p>
                      {pole.address && <p>{pole.address}</p>}
                      <p>Status: {pole.status === 'FUNCIONANDO' ? '✅ Funcionando' : '🔴 Queimado'}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {poleNotOnMap && manualMarkerPos && (
                <Marker position={manualMarkerPos} icon={pinkIcon}>
                  <Popup><div className="text-xs"><p className="font-bold">📍 Local selecionado</p>{manualAddress && <p>{manualAddress}</p>}</div></Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* Manual location info */}
          {poleNotOnMap && manualMarkerPos && (
            <div className="rounded-lg border p-3 bg-accent/10 border-accent/30">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Local marcado manualmente{manualAddress && ` — ${manualAddress}`}</p>
                  <p className="text-muted-foreground text-xs">Coordenadas: {manualMarkerPos[0].toFixed(6)}, {manualMarkerPos[1].toFixed(6)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Selected pole info */}
          {!poleNotOnMap && selectedPole && (
            <div className={`rounded-lg border p-3 ${isPoleAlreadyBurned ? 'bg-warning/10 border-warning/30' : 'bg-primary/5 border-primary/20'}`}>
              <div className="flex items-start gap-3">
                {isPoleAlreadyBurned ? (
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                )}
                <div className="text-sm">
                  <p className="font-medium">Poste {selectedPole.id}{selectedPole.address && ` — ${selectedPole.address}`}</p>
                  {isPoleAlreadyBurned ? (
                    <p className="text-warning font-medium mt-1">⚠️ Este poste já está com status "Queimado". O conserto já foi solicitado.</p>
                  ) : (
                    <p className="text-muted-foreground">Status: Funcionando · Clique em "Enviar" para reportar problema.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {cityPoles.length === 0 && !poleNotOnMap && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum poste cadastrado para esta cidade.</p>
          )}
        </div>
      )}

      {/* Map for non-ILUMINACAO modules: click to mark location */}
      {selectedModule && !isIluminacao && (
        <div className="space-y-3">
          <Label>Marque a Localização no Mapa *</Label>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            📍 Clique no mapa para indicar o local do problema.
          </p>

          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-violet-500" /> Sua seleção</span>
          </p>

          <div className="rounded-lg border overflow-hidden" style={{ height: 350 }}>
            <MapContainer
              key={`${selectedCityHallId}-${selectedModule}`}
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ManualClickHandler onLocationSelect={handleManualLocationSelect} />
              {manualMarkerPos && (
                <Marker position={manualMarkerPos} icon={pinkIcon}>
                  <Popup><div className="text-xs"><p className="font-bold">📍 Local selecionado</p>{manualAddress && <p>{manualAddress}</p>}</div></Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {manualMarkerPos && (
            <div className="rounded-lg border p-3 bg-accent/10 border-accent/30">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Local selecionado{manualAddress && ` — ${manualAddress}`}</p>
                  <p className="text-muted-foreground text-xs">Coordenadas: {manualMarkerPos[0].toFixed(6)}, {manualMarkerPos[1].toFixed(6)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Personal data */}
      {selectedModule && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input id="name" placeholder="Seu nome completo" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                maxLength={14}
                {...register('cpf')}
                onChange={e => {
                  const formatted = formatCPF(e.target.value);
                  e.target.value = formatted;
                  setValue('cpf', formatted);
                }}
                className={errors.cpf ? 'border-destructive' : ''}
              />
              {errors.cpf && <p className="text-xs text-destructive">{errors.cpf.message}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input id="phone" placeholder="(00) 00000-0000" {...register('phone')} />
            </div>
          </div>

          {/* Photo Upload */}
          {showPhotoUpload && (
            <div className="space-y-2">
              <Label>Foto do Problema {!isIluminacao ? '*' : '(recomendado)'}</Label>
              <div className="relative">
                {photoPreview ? (
                  <div className="relative rounded-lg border overflow-hidden">
                    <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed border-border/40 bg-card/20 hover:border-primary/30 hover:bg-card/40 cursor-pointer transition-all">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Camera className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Clique para enviar uma foto</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou WEBP · Máx. 5MB</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observações (opcional)</Label>
            <Textarea
              id="observations"
              placeholder="Descreva detalhes adicionais sobre o problema, se desejar..."
              rows={3}
              {...register('observations')}
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 rounded-lg border bg-warning/10 p-4">
            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-warning">Atenção</p>
              <p className="text-muted-foreground">
                Denúncias falsas ou duplicadas podem resultar em bloqueio do CPF.
                Limite de 3 denúncias por dia.
              </p>
            </div>
          </div>

          <Button
            type={isIluminacao && !poleNotOnMap && isPoleAlreadyBurned ? 'button' : 'submit'}
            size="lg"
            className="w-full"
            disabled={isSubmitting || (isIluminacao ? (poleNotOnMap ? !manualMarkerPos : !selectedPole) : !manualMarkerPos || !occurrenceType)}
            onClick={isIluminacao && !poleNotOnMap && isPoleAlreadyBurned ? () => setShowBurnedDialog(true) : undefined}
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enviando...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" />Enviar Denúncia</>
            )}
          </Button>
        </>
      )}

      {/* Dialog for already-burned pole */}
      <Dialog open={showBurnedDialog} onOpenChange={setShowBurnedDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 mx-auto">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800/40 dark:to-orange-800/40">
                <ThumbsUp className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <DialogTitle className="text-xl">Obrigado pela sua atenção!</DialogTitle>
            <DialogDescription className="text-base leading-relaxed space-y-3">
              <p>
                O poste <strong className="text-foreground">{selectedPole?.id}</strong>
                {selectedPole?.address && <> na <strong className="text-foreground">{selectedPole.address}</strong></>}
                {' '}já foi identificado com problemas e o reparo já está sendo providenciado pela equipe responsável.
              </p>
              <p>Sua preocupação faz a diferença!</p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-red-400 animate-pulse" />
            <span>Obrigado por contribuir com a comunidade</span>
          </div>
          <Button onClick={() => setShowBurnedDialog(false)} className="w-full mt-2">
            Entendi, obrigado!
          </Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}
