import { environment } from '../environments/environment';

// Producción: la URL viene compilada en environment (https del back).
// Desarrollo/pruebas LAN: la API vive en el mismo host
// desde donde se cargó el front, puerto 8081.
export function apiUrl(): string {
  if (environment.API_URL && !environment.API_URL.startsWith('__')) {
    return environment.API_URL;
  }
  const host = typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : 'localhost';
  return `http://${host}:8081`;
}
