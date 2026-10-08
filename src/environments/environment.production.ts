export const environment = {
  // Lo reemplaza el Dockerfile con el valor del argumento API_URL
  // (ej: https://api.tu-dominio). No poner secretos acá: esto viaja al navegador.
  API_URL: '__API_URL__'
};
