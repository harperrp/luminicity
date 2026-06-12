import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { Pole, PoleStatus } from '@/types';
import { formatPoleLimit, getPoleUsage } from '@/lib/plans';
import { toast } from 'sonner';

interface ParsedPole {
  idPip: string;
  latitude: number;
  longitude: number;
  status: PoleStatus;
  luminaria: string;
  braco: string;
  tipoLampada: string;
  potencia: string;
  qtdLampadas: string;
  valid: boolean;
  error?: string;
}

interface ImportPolesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (poles: Pole[]) => void;
  existingPoleIds: string[];
  planLabel: string;
  poleLimit: number;
  currentPoleCount: number;
  remainingPoleSlots: number;
}

function findColumn(headers: string[], ...candidates: string[]): string | undefined {
  const normalized = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  for (const c of candidates) {
    const found = headers.find(h => normalized(h) === normalized(c));
    if (found) return found;
  }
  return undefined;
}

export function ImportPolesModal({
  open,
  onOpenChange,
  onImport,
  existingPoleIds,
  planLabel,
  poleLimit,
  currentPoleCount,
  remainingPoleSlots,
}: ImportPolesModalProps) {
  const [parsedPoles, setParsedPoles] = useState<ParsedPole[]>([]);
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setParsedPoles([]);
    setFileName('');
    setStep('upload');
  };

  const parseRows = (rows: Record<string, unknown>[]) => {
    if (rows.length === 0) return [];

    const headers = Object.keys(rows[0]);
    const colLat = findColumn(headers, 'LATITUDE', 'Latitude', 'lat');
    const colLng = findColumn(headers, 'LONGITUDE', 'Longitude', 'lng', 'long');
    const colId = findColumn(headers, 'ID PIP', 'ID_PIP', 'IDPIP');
    const colLum = findColumn(headers, 'LUMINARIA', 'Luminaria', 'Luminária');
    const colBraco = findColumn(headers, 'BRACO', 'Braço', 'BRAÇO');
    const colTipo = findColumn(headers, 'TIPO LAMPADA', 'TIPO LÂMPADA', 'Tipo Lampada', 'TIPO_LAMPADA');
    const colPot = findColumn(headers, 'POTÊNCIA', 'POTENCIA', 'Potencia', 'Potência');
    const colQtd = findColumn(headers, 'QTD LÂMPADAS', 'QTD LAMPADAS', 'QTD_LAMPADAS');

    return rows.map((row): ParsedPole => {
      const rawLat = row[colLat ?? ''];
      const rawLng = row[colLng ?? ''];
      const lat = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat ?? '').replace(',', '.'));
      const lng = typeof rawLng === 'number' ? rawLng : parseFloat(String(rawLng ?? '').replace(',', '.'));
      const idPip = String(row[colId ?? ''] ?? '').trim();
      const luminaria = String(row[colLum ?? ''] ?? '').trim();
      const status: PoleStatus = 'FUNCIONANDO';

      const valid = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
      const duplicate = existingPoleIds.includes(idPip);
      const error = !valid ? 'Coordenadas inválidas' : duplicate ? 'ID já cadastrado' : undefined;

      return {
        idPip,
        latitude: lat,
        longitude: lng,
        status,
        luminaria,
        braco: String(row[colBraco ?? ''] ?? '').trim(),
        tipoLampada: String(row[colTipo ?? ''] ?? '').trim(),
        potencia: String(row[colPot ?? ''] ?? '').trim(),
        qtdLampadas: String(row[colQtd ?? ''] ?? '').trim(),
        valid: valid && !duplicate,
        error,
      };
    });
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Try to find the sheet with data (check all sheets, prefer ones with LATITUDE column)
        let rows: Record<string, unknown>[] = [];
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
          if (json.length === 0) continue;
          const headers = Object.keys(json[0]);
          const hasLatitude = headers.some(h =>
            h.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('latitude')
          );
          if (hasLatitude) {
            rows = json;
            break;
          }
          if (rows.length === 0) rows = json; // fallback to first non-empty sheet
        }

        if (rows.length === 0) {
          toast.error('Nenhum dado encontrado no arquivo.');
          return;
        }

        const poles = parseRows(rows);
        setParsedPoles(poles);
        setStep('preview');
      } catch {
        toast.error('Erro ao ler o arquivo. Verifique o formato.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const validPoles = parsedPoles.filter((p) => p.valid);
  const invalidPoles = parsedPoles.filter((p) => !p.valid);
  const usage = getPoleUsage(currentPoleCount, poleLimit);
  const overLimitAmount = Math.max(validPoles.length - remainingPoleSlots, 0);

  const handleImport = () => {
    if (overLimitAmount > 0) {
      toast.error('A planilha excede o limite do plano.', {
        description: `Remova ${overLimitAmount} postes ou altere o plano ${planLabel}.`,
      });
      return;
    }

    const newPoles: Pole[] = validPoles.map((p) => ({
      id: p.idPip || `IMP-${Math.random().toString(36).substr(2, 6)}`,
      latitude: p.latitude,
      longitude: p.longitude,
      status: p.status,
      neighborhood: '',
      address: `${p.tipoLampada} ${p.potencia}W - ${p.braco}`,
      observations: `Luminária: ${p.luminaria} | Braço: ${p.braco} | Tipo: ${p.tipoLampada} | Potência: ${p.potencia}W | Qtd: ${p.qtdLampadas}`,
      cityHallId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    onImport(newPoles);
    toast.success(`${newPoles.length} postes importados com sucesso!`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Postes — Planilha CEMIG
          </DialogTitle>
          <DialogDescription>
            Envie um arquivo CSV ou Excel (.xlsx, .xlsm) com as colunas: LONGITUDE, LATITUDE, ID PIP, LUMINARIA, BRACO, TIPO LAMPADA, POTÊNCIA
          </DialogDescription>
        </DialogHeader>

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

        {step === 'upload' && (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/30 p-12 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Arraste o arquivo aqui</p>
              <p className="text-sm text-muted-foreground">CSV, Excel (.xlsx, .xlsm)</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx,.xlsm,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {step === 'preview' && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <FileSpreadsheet className="h-3 w-3" /> {fileName}
              </Badge>
              <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] gap-1">
                <CheckCircle2 className="h-3 w-3" /> {validPoles.length} válidos
              </Badge>
              {invalidPoles.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> {invalidPoles.length} com erro
                </Badge>
              )}
              {overLimitAmount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> Excede {overLimitAmount} do limite
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={reset} className="ml-auto">
                <X className="h-4 w-4 mr-1" /> Trocar arquivo
              </Button>
            </div>

            <ScrollArea className="flex-1 max-h-[400px] rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID PIP</TableHead>
                    <TableHead>Lat / Lng</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo Lâmpada</TableHead>
                    <TableHead>Potência</TableHead>
                    <TableHead>Braço</TableHead>
                    <TableHead>Válido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedPoles.slice(0, 100).map((p, i) => (
                    <TableRow key={i} className={!p.valid ? 'opacity-50' : ''}>
                      <TableCell className="font-mono text-xs">{p.idPip || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}</TableCell>
                      <TableCell>
                        <Badge className={p.status === 'FUNCIONANDO' ? 'status-badge-working' : 'status-badge-broken'}>
                          {p.status === 'FUNCIONANDO' ? 'Funcionando' : 'Queimado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{p.tipoLampada}</TableCell>
                      <TableCell className="text-xs">{p.potencia}W</TableCell>
                      <TableCell className="text-xs">{p.braco}</TableCell>
                      <TableCell>
                        {p.valid ? (
                          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                        ) : (
                          <span className="text-xs text-destructive">{p.error}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedPoles.length > 100 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Mostrando 100 de {parsedPoles.length} registros
                </p>
              )}
            </ScrollArea>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancelar</Button>
          {step === 'preview' && (
            <Button onClick={handleImport} disabled={validPoles.length === 0 || overLimitAmount > 0}>
              <Upload className="h-4 w-4 mr-2" />
              Importar {validPoles.length} postes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
