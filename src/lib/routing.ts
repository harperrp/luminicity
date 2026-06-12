export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface RoutableItem extends GeoPoint {
  id: string;
}

export function distanceKm(a: GeoPoint, b: GeoPoint) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function buildNearestRoute<T extends RoutableItem>(
  items: T[],
  start: GeoPoint,
  options: { targetId?: string; maxStops?: number } = {},
) {
  const remaining = [...items];
  const ordered: T[] = [];
  let current = start;

  if (options.targetId) {
    const targetIndex = remaining.findIndex((item) => item.id === options.targetId);
    if (targetIndex >= 0) {
      const [target] = remaining.splice(targetIndex, 1);
      ordered.push(target);
      current = target;
    }
  }

  const maxStops = options.maxStops ?? items.length;

  while (remaining.length && ordered.length < maxStops) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    remaining.forEach((item, idx) => {
      const distance = distanceKm(current, item);
      if (distance < nearestDist) {
        nearestDist = distance;
        nearestIdx = idx;
      }
    });

    const [next] = remaining.splice(nearestIdx, 1);
    ordered.push(next);
    current = next;
  }

  return ordered;
}

export function routeDistanceKm(points: GeoPoint[]) {
  if (points.length < 2) return 0;

  return points.slice(1).reduce((total, point, index) => total + distanceKm(points[index], point), 0);
}
