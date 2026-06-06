// src/services/fotos.ts
import { api } from './client';

const photoCache = new Map<string, string | null>();
const inflightRequests = new Map<string, Promise<string | null>>();

export async function getFirstPhotoUrlByIncendio(incendio_uuid: string): Promise<string | null> {
  if (!incendio_uuid) return null;

  if (photoCache.has(incendio_uuid)) {
    return photoCache.get(incendio_uuid) as string | null;
  }

  if (inflightRequests.has(incendio_uuid)) {
    return inflightRequests.get(incendio_uuid) as Promise<string | null>;
  }

  const promise = (async () => {
    try {
      // Traer el detalle completo del incendio que incluye las fotos
      const res = await api.get(`/incendios/${incendio_uuid}`);
      const fotos = res?.data?.fotos || [];
      const url: string | null = fotos[0]?.url ?? null;

      const finalUrl = typeof url === 'string' ? url : null;
      photoCache.set(incendio_uuid, finalUrl);
      return finalUrl;
    } catch (e) {
      console.log('[getFirstPhotoUrlByIncendio] error', e);
      photoCache.set(incendio_uuid, null);
      return null;
    } finally {
      inflightRequests.delete(incendio_uuid);
    }
  })();

  inflightRequests.set(incendio_uuid, promise);
  return promise;
}
