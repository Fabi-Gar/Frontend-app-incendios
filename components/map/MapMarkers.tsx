import React from 'react';
import { Marker, LatLng } from 'react-native-maps';
import { getLatLngFromIncendio } from '@/app/utils/map';
import { cierreColor } from '@/app/utils/estadoCierre';

interface MapMarkersProps {
  items: any[];
  trackViews: boolean;
  onMarkerPress: (id: string, item: any, coord: LatLng) => Promise<void>;
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  items,
  trackViews,
  onMarkerPress
}) => {
  return (
    <>
      {items.map((item: any) => {
        const coord = getLatLngFromIncendio(item);
        if (!coord) return null;

        const id = String(item.id ?? item.incendio_uuid);
        const estado = item?.estadoActual?.estado?.nombre || 'Reportado';
        const color = cierreColor(estado);

        return (
          <Marker
            key={`${id}-${estado}`}
            coordinate={coord as LatLng}
            pinColor={color}
            tracksViewChanges={trackViews}
            zIndex={9999}
            onPress={() => onMarkerPress(id, item, coord as LatLng)}
            anchor={{ x: 0.5, y: 1 }}
          />
        );
      })}
    </>
  );
};
