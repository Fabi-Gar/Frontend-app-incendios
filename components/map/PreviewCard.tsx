import React from 'react';
import { View, Text, TouchableOpacity, Image, TouchableWithoutFeedback, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';

const PREVIEW_CARD_WIDTH = 260;
const PREVIEW_CARD_HEIGHT = 210;
const screen = Dimensions.get('window');

interface PreviewCardProps {
  id: string;
  item: any;
  pt: { x: number; y: number };
  insetsTop: number;
  reportante: string;
  coverUrl: string | null;
  onClose: () => void;
  onOpenViewer: (url: string) => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  id,
  item,
  pt,
  insetsTop,
  reportante,
  coverUrl,
  onClose,
  onOpenViewer
}) => {
  const estado = item?.estadoActual?.estado?.nombre || 'Reportado';
  const left = Math.max(8, Math.min(pt.x - PREVIEW_CARD_WIDTH / 2, screen.width - PREVIEW_CARD_WIDTH - 8));
  const top = Math.max(insetsTop + 90, pt.y - PREVIEW_CARD_HEIGHT - 16);

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.previewOverlayBehind} />
      </TouchableWithoutFeedback>

      <View
        style={[styles.previewCard, { left, top, width: PREVIEW_CARD_WIDTH }]}
        collapsable={false}
        renderToHardwareTextureAndroid
        needsOffscreenAlphaCompositing
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 15, flex: 1 }} numberOfLines={1}>
            {item.titulo || 'Sin título'}
          </Text>
          {!(item as any)?.inab_objectid && !(item as any)?.inab_globalid && (
            <View style={{ backgroundColor: '#E3F2FD', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={{ color: '#1565C0', fontSize: 9, fontWeight: 'bold' }}>📱 App</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          accessibilityRole="imagebutton"
          accessibilityLabel="Ver foto a pantalla completa"
          activeOpacity={0.85}
          onPress={() => {
            if (coverUrl) onOpenViewer(coverUrl);
          }}
          style={{ marginTop: 6 }}
        >
          <Image
            source={coverUrl ? { uri: coverUrl } : require('@/assets/images/placeholder_incendio.png')}
            style={{ width: '100%', height: 110, borderRadius: 8 }}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <Text style={{ marginTop: 6 }} numberOfLines={2}>
          {item.descripcion || 'Sin descripción'}
        </Text>

        <Text style={{ marginTop: 4, color: '#666', fontSize: 12 }}>
          {`Publicado por: ${reportante}`}
        </Text>
        <Text style={{ color: '#777', fontSize: 12, marginTop: 2 }}>
          {`Estado: ${estado}`}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => router.push(`/incendios/detalles?id=${id}`)}
            style={styles.cardBtn}
          >
            <Text style={{ fontWeight: '600', color: '#2E7D32' }}>Detalles</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  previewOverlayBehind: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 5,
  },
  previewCard: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    elevation: 10,
    zIndex: 6,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardBtn: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
});
