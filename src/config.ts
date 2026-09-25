// src/config.ts
// Número en formato internacional sin + ni espacios
export const WA_PHONE = '51999999999'; // ← reemplazar con número real

export function waUrl(message: string): string {
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
}
