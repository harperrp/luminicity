import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PoleMap } from '@/components/map/PoleMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { usePoles } from '@/contexts/PolesContext';
import { useCityHall } from '@/contexts/CityHallContext';

export default function DashboardMap() {
  const { poles, updatePoleStatus } = usePoles();
  const { activeCityHall } = useCityHall();

  const mapCenter: [number, number] = [activeCityHall.latitude, activeCityHall.longitude];
  const cityPoles = poles.filter(p => p.cityHallId === activeCityHall.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Mapa de Postes</h1>
          <p className="text-muted-foreground">
            Visualize a localização e status dos postes de {activeCityHall.city}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa Interativo — {activeCityHall.city}
            </CardTitle>
            <CardDescription>
              Clique em um poste no mapa para localizar com precisão e atualizar o status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PoleMap
              showFilters={true}
              editableStatus={true}
              poles={cityPoles}
              onStatusChange={updatePoleStatus}
              center={mapCenter}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
