# Etapa 1: compila el front en modo producción.
# API_URL se inyecta como argumento (ej: https://api.tu-dominio). No es secreto.
FROM node:22-alpine AS build
WORKDIR /app
ARG API_URL=http://localhost:8081
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN sed -i "s|__API_URL__|${API_URL}|g" src/environments/environment.production.ts \
  && npx ng build --configuration production

# Etapa 2: Nginx solo para servir estáticos + cabeceras de seguridad
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/inventario-web/browser /usr/share/nginx/html
EXPOSE 80
