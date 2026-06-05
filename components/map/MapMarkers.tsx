import React from 'react';
import { Marker, Circle, LatLng } from 'react-native-maps';
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
        
        // Área en hectáreas devuelta por el nuevo backend
        const hectareas = item?.control?.area_estimada_ha ?? 0;
        // Radio en metros: r = sqrt(ha * 10000 / PI)
        const radiusMeters = hectareas > 0 ? Math.sqrt((hectareas * 10000) / Math.PI) : 0;

        return (
          <React.Fragment key={`frag-${id}-${estado}`}>
            {radiusMeters > 0 && (
              <Circle
                center={coord as LatLng}
                radius={radiusMeters}
                fillColor={`${color}40`} // Color semitransparente (Alpha ~25%)
                strokeColor={color}
                strokeWidth={2}
                zIndex={9998}
              />
            )}
            <Marker
              key={`${id}-${estado}`}
              coordinate={coord as LatLng}
              pinColor={color}
              tracksViewChanges={trackViews}
              zIndex={9999}
              onPress={() => onMarkerPress(id, item, coord as LatLng)}
              anchor={{ x: 0.5, y: 1 }}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};
