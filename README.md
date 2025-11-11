# Recibos de Caja – Frontend Angular + Backend Spring Boot + MySQL

Proyecto full‑stack compuesto por:
- Frontend SPA en Angular, servido con Nginx (contenedor Docker)
- Backend REST con Spring Boot (Java) (contenedor Docker)
- Base de datos MySQL (contenedor Docker)

## Tecnologías y versiones
- Frontend:
  - Angular 18 (CLI/build `@angular/cli ^18.2.1`, runtime `@angular/core ^18.2.0`)
  - TypeScript ~5.5
  - Nginx (imagen base `nginx:alpine`)
- Backend:
  - Spring Boot 3.4.4 (Java 24)
  - Spring Web, Spring Data JPA
  - MySQL Connector/J 8.0.28
  - Build con Maven 3.9.9 (imagen `maven:3.9.9-eclipse-temurin-24-alpine`)
  - Runtime `eclipse-temurin:24-jre-alpine`
- Base de datos:
  - MySQL 8.0.39 (imagen `mysql:8.0.39`)

## Arquitectura (resumen)
- Frontend Angular servido por Nginx. La SPA consume `/api` y Nginx proxy‑pasa al backend.
- Backend Spring Boot expone `REST /api/**` y métricas en `/actuator/prometheus`.
- MySQL como base de datos.
- CI/CD con GitHub Actions: build + tests + push de imágenes a Docker Hub.
- Kubernetes (Minikube) con manifiestos en `kube/`.

## Ejecución con Docker Compose (recomendado)
Requisitos:
- Docker y Docker Compose instalados

Comandos (usando imágenes publicadas en Docker Hub):

```bash
docker compose pull
docker compose up -d

# Ver logs (opcional)
docker compose logs -f

# Detener servicios
docker compose down
```

Servicios y puertos expuestos:
- Frontend (Nginx): http://localhost:80
- Backend (Spring Boot): http://localhost:8090 (API en `/api`)
- MySQL: puerto host 3307 → contenedor 3306

Persistencia:
- Volumen `mysql_data` mapea `/var/lib/mysql` (datos de BD persistentes)

## Imágenes publicadas en Docker Hub
- Frontend: `docker.io/esteban652/recibos-frontend`  
  Enlace: https://hub.docker.com/r/esteban652/recibos-frontend  
  Tags: `latest`, `v0.1.0`
- Backend: `docker.io/esteban652/recibos-backend`  
  Enlace: https://hub.docker.com/r/esteban652/recibos-backend  
  Tags: `latest`, `v0.1.0`

### Verificación rápida
```bash
# Descargar imágenes
docker pull esteban652/recibos-frontend:latest
docker pull esteban652/recibos-backend:latest

# Probar el frontend en un puerto alterno (opcional)
docker run --rm -p 8081:80 esteban652/recibos-frontend:latest
# Abrir http://localhost:8081

# (Opcional) Iniciar backend solo para verificar arranque de la imagen
# Nota: sin MySQL levantado, el backend intentará conectarse y puede fallar
# pero confirma que la imagen existe y arranca el proceso Java.
docker run --rm -p 8085:8080 esteban652/recibos-backend:latest
```

## Kubernetes (Minikube)
Requisitos: Minikube + Docker Desktop (o driver compatible).

```bash
minikube start --driver=docker
kubectl apply -f kube

# Evidencia / verificación
kubectl get pods -o wide
kubectl get svc

# URL del frontend
minikube service frontend --url
```

Notas K8s:
- Manifiestos en `kube/` (`deployment.yaml`, `service.yaml`, `configmap.yaml`, `secret.yaml`).
- `frontend` es NodePort (80 → 30080). `backend` y `mysql` son ClusterIP.
- Nginx redirige `/api` al backend (ver `frontend/nginx/default.conf`).

## Observabilidad
- Backend expone métricas en `/actuator/prometheus` (Spring Boot Actuator + Micrometer).
- Prometheus y Grafana desplegados en `kube/`:
  - Prometheus: `minikube service prometheus --url` (revisar `/targets` y `/graph`).
  - Grafana: `minikube service grafana --url` (login `admin/admin`).
  - Dashboards sugeridos: ID `11378` (Spring Boot) y `4701` (Micrometer JVM).

## Endpoints y URLs útiles
- Frontend: `http://localhost/` (si usas Docker) o `http://localhost:4200/` (dev)
- Backend base: `http://localhost:8090/api`
- OpenAPI/Swagger UI (si está habilitado): `http://localhost:8090/swagger-ui/index.html`

## CI/CD (resumen)
- Workflow: `.github/workflows/ci-cd.yml`
- En cada push a `main`/`develop`:
  1) Build + tests (backend y frontend)
  2) Build y push imágenes Docker (`recibos-backend`, `recibos-frontend`)
- Secret requerido: `DOCKERHUB_TOKEN` (token de Docker Hub)

## Notas
- JPA está configurado con `spring.jpa.hibernate.ddl-auto=update` para evolucionar el esquema automáticamente en desarrollo.
- Cambia credenciales de MySQL en producción y evita usar `mysql:latest` fijando una versión.
- Para entornos productivos, expón el frontend detrás de un proxy con TLS.
