// Utilidades de formato para mostrar datos crudos del INAB de forma legible.

/**
 * Normaliza nombres de lugares del INAB para mostrarlos:
 * - quita el sufijo numérico ("san_andres_1704" -> "san_andres")
 * - reemplaza "_" por espacios
 * - capitaliza cada palabra
 *
 * Ej: "san_andres_1704" -> "San Andres", "alta_verapaz" -> "Alta Verapaz".
 */
export function formatPlaceName(raw?: string | null): string {
  if (!raw) return '';
  return String(raw)
    .replace(/_\d+\s*$/, '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}
