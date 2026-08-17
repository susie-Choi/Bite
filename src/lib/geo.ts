export interface GeoPoint {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** 두 위경도 좌표 사이의 직선거리를 Haversine 공식으로 계산한다. */
export function getDistanceMeters(from: GeoPoint, to: GeoPoint): number {
  const latitudeDelta = toRadians(to.lat - from.lat);
  const longitudeDelta = toRadians(to.lng - from.lng);
  const fromLatitude = toRadians(from.lat);
  const toLatitude = toRadians(to.lat);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** GPS 오차를 고려해 지나치게 정밀하지 않은 사용자용 거리로 표시한다. */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1_000) {
    const roundedMeters = Math.max(50, Math.round(distanceMeters / 50) * 50);
    return `약 ${roundedMeters.toLocaleString()}m`;
  }

  const distanceKilometers = distanceMeters / 1_000;
  return `약 ${distanceKilometers < 10 ? distanceKilometers.toFixed(1) : Math.round(distanceKilometers)}km`;
}
