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

## Estructura del repositorio
- `frontend/`: aplicación Angular y Dockerfile de build/NGINX
- `backend/`: aplicación Spring Boot (Maven) y Dockerfile
- `docker-compose.yaml`: orquestación de `db`, `backend`, `frontend`
 
## Descarga del proyecto
Clonar el repositorio con Git:

```bash
git clone <URL_DEL_REPO>
cd recibos_de_caja
```

También puedes construir y ejecutar directamente con Docker (ver siguiente sección).

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

Variables relevantes (compose):
- `SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/ejemplo-db` (inyectada al backend)

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

## Ejecución local (sin Docker)
Requisitos:
- Node.js 18+ y npm
- Angular CLI (`npm i -g @angular/cli`)
- Java 24 (Temurin u OpenJDK)
- Maven 3.9+
- MySQL 8 (local) con una BD `ejemplo-db`

1) Backend
- Configurar acceso a MySQL en `backend/src/main/resources/application.properties`:
  - `spring.datasource.url=jdbc:mysql://localhost:3306/ejemplo-db`
  - `spring.datasource.username=usuario`
  - `spring.datasource.password=usuario123`
- Levantar el backend:

```bash
cd backend
mvn spring-boot:run
# El backend quedará en http://localhost:8080 (puede mapearse a 8090 detrás de Docker)
```

2) Frontend
- Verifica la URL del API en `frontend/src/environments/environment.ts`:
  - `apiUrl: 'http://localhost:8090/api'` (ajústala a `http://localhost:8080/api` si corres backend localmente sin Docker)
- Instala dependencias y sirve en modo desarrollo:

```bash
cd frontend
npm install
npm start
# Angular por defecto en http://localhost:4200
```

## Publicación de imágenes en Docker Hub
Repositorio/namespace: `esteban652`

Construir y etiquetar:

```bash
# Frontend
cd frontend
docker build -t esteban652/recibos-frontend:latest .
docker tag esteban652/recibos-frontend:latest esteban652/recibos-frontend:v0.1.0

# Backend
cd ../backend
docker build -t esteban652/recibos-backend:latest .
docker tag esteban652/recibos-backend:latest esteban652/recibos-backend:v0.1.0
```

Login y push (requiere token de Docker Hub):

```bash
echo <TOKEN_DOCKER_HUB> | docker login -u "esteban652" --password-stdin

docker push esteban652/recibos-frontend:latest
docker push esteban652/recibos-frontend:v0.1.0

docker push esteban652/recibos-backend:latest
docker push esteban652/recibos-backend:v0.1.0
```

Actualizar `docker-compose.yaml` (ya apunta a):
- `image: esteban652/recibos-frontend:latest`
- `image: esteban652/recibos-backend:latest`
- `image: mysql:8.0.39`

## Build de imágenes manual local (sin publicar)
Si prefieres usar build local en lugar de Docker Hub, puedes ajustar temporalmente `docker-compose.yaml` para usar `build:` en `frontend` y `backend`:

```yaml
backend:
  build: ./backend
frontend:
  build: ./frontend
```

Y luego:

```bash
docker compose up -d --build
```

## Endpoints y URLs útiles
- Frontend: `http://localhost/` (si usas Docker) o `http://localhost:4200/` (dev)
- Backend base: `http://localhost:8090/api`
- OpenAPI/Swagger UI (si está habilitado): `http://localhost:8090/swagger-ui/index.html`

## Pipeline de CI/CD

El proyecto incluye un pipeline de CI/CD implementado con **GitHub Actions** que automatiza:

1. **Compilación/Build**: Compila el backend con Maven y el frontend con Angular
2. **Pruebas unitarias**: Ejecuta tests del backend (Maven) y frontend (Angular/Karma)
3. **Generación de imágenes Docker**: Construye las imágenes Docker para backend y frontend
4. **Publicación en Docker Hub**: Publica automáticamente las imágenes en Docker Hub

### Configuración del Pipeline

El workflow se ejecuta automáticamente en:
- Push a las ramas `main` y `develop`
- Pull requests hacia `main` y `develop`

**Ubicación del workflow**: `.github/workflows/ci-cd.yml`

### Configuración de Secrets en GitHub

Para que el pipeline pueda publicar imágenes en Docker Hub, necesitas configurar el siguiente secret en tu repositorio de GitHub:

1. Ve a tu repositorio en GitHub
2. Navega a **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **New repository secret**
4. Crea un secret con:
   - **Name**: `DOCKERHUB_TOKEN`
   - **Value**: Tu token de acceso de Docker Hub

#### Cómo obtener el token de Docker Hub:

1. Inicia sesión en [Docker Hub](https://hub.docker.com/)
2. Ve a **Account Settings** → **Security**
3. Haz clic en **New Access Token**
4. Asigna un nombre (ej: "GitHub Actions CI/CD")
5. Copia el token generado (solo se muestra una vez)
6. Pega este token como valor del secret `DOCKERHUB_TOKEN` en GitHub

### Etapas del Pipeline

#### 1. Build and Test
- **Backend**: Compila con Maven, ejecuta tests y genera el JAR
- **Frontend**: Instala dependencias, ejecuta tests y genera el build de producción

#### 2. Build Docker Images (solo en push a main/develop)
- Construye las imágenes Docker usando los Dockerfiles
- Etiqueta las imágenes con:
  - `latest` (solo en la rama principal)
  - Nombre de la rama
  - SHA del commit
- Publica las imágenes en Docker Hub: `esteban652/recibos-backend` y `esteban652/recibos-frontend`

### Verificación del Pipeline

Puedes verificar el estado del pipeline:
- En la pestaña **Actions** de tu repositorio en GitHub
- Cada commit mostrará el estado del pipeline (✓ éxito o ✗ fallo)

### Notas sobre el Pipeline

- Los tests unitarios están implementados para backend (JUnit/Mockito) y frontend (Jasmine/Karma)
- El pipeline fallará si algún test falla, asegurando calidad del código
- Las imágenes se construyen con cache para optimizar tiempos de build
- Solo se publican imágenes en Docker Hub cuando hay push a `main` o `develop` (no en PRs)

### Tests Unitarios

El proyecto incluye tests unitarios completos:

**Backend (Java/Spring Boot)**:
- Tests para `ProductController` y `TicketController` (usando `@WebMvcTest`)
- Tests para `ProductAppService` y `TicketAppService` (usando Mockito)
- Cobertura de casos exitosos y de error (validaciones, stock insuficiente, etc.)

**Frontend (Angular)**:
- Tests para `ProductService` y `TicketService` (usando `HttpClientTestingModule`)
- Tests completos para `AppComponent` (formularios, validaciones, lógica de negocio)
- Tests de integración con servicios mockeados

Para ejecutar los tests localmente:
```bash
# Backend
cd backend
mvn test

# Frontend
cd frontend
npm test
```

## Notas
- JPA está configurado con `spring.jpa.hibernate.ddl-auto=update` para evolucionar el esquema automáticamente en desarrollo.
- Cambia credenciales de MySQL en producción y evita usar `mysql:latest` fijando una versión.
- Para entornos productivos, expón el frontend detrás de un proxy con TLS.
