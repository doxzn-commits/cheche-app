'use client';
// MapView — react-leaflet 실제 렌더링 컴포넌트 (SSR 제외 필수)
import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

export interface MapPin {
  id: string;
  plat: string;
  cat: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  total: number;
  applied: number;
  dday: string;
  open: boolean;
  type: string;
}

const PLAT_COLOR: Record<string, string> = {
  '레뷰':    '#00B386',
  '강남맛집': '#E8394A',
  '미블':    '#2B7FE8',
  '서울오빠': '#E8A820',
  '디너의여왕':'#8B95A1',
  '티블':    '#1C3C82',
  '리뷰노트': '#B0B8C1',
  '링블':    '#2750A8',
  '놀러와':  '#00B386',
};

function ddayColor(dday: string): string {
  const n = parseInt(dday.replace('D-', ''));
  if (dday.startsWith('D-') && n <= 3) return 'var(--s-overdue)';
  if (dday.startsWith('D-') && n <= 7) return 'var(--s-deadline)';
  return 'var(--text-muted)';
}

interface MarkersProps {
  pins: MapPin[];
  selectedId: string | null;
  onSelect: (pin: MapPin) => void;
}

// Leaflet markers를 지도 인스턴스에 직접 추가하는 내부 컴포넌트
function Markers({ pins, selectedId, onSelect }: MarkersProps) {
  const map = useMap();

  useEffect(() => {
    const layers: L.Marker[] = [];

    pins.forEach(pin => {
      const color = PLAT_COLOR[pin.plat] ?? '#1C3C82';
      const isSelected = pin.id === selectedId;
      const shortage = (pin.total - pin.applied) <= 2 && pin.open;
      const extraStyle = shortage
        ? 'border-color:gold;box-shadow:0 0 0 2px gold,0 3px 12px rgba(0,0,0,.3)'
        : '';
      const selectedClass = isSelected ? ' selected' : '';

      const icon = L.divIcon({
        className: '',
        html: `<div class="pm-marker${selectedClass}" style="background:${color};${extraStyle}">${pin.plat.slice(0, 1)}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(map);
      marker.on('click', () => {
        onSelect(pin);
        map.panTo([pin.lat, pin.lng], { animate: true, duration: 0.4 });
      });
      layers.push(marker);
    });

    return () => { layers.forEach(m => m.remove()); };
  }, [map, pins, selectedId, onSelect]);

  return null;
}

interface Props {
  pins: MapPin[];
  selectedId: string | null;
  onSelect: (pin: MapPin) => void;
}

export default function MapView({ pins, selectedId, onSelect }: Props) {
  return (
    <MapContainer
      center={[37.5326, 127.0246]}
      zoom={12}
      zoomControl={false}
      style={{ flex: 1, width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OSM"
        maxZoom={18}
      />
      <Markers pins={pins} selectedId={selectedId} onSelect={onSelect} />
    </MapContainer>
  );
}

export { ddayColor };
