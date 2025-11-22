# Authentication API

Servidor Express con arquitectura por capas similar a NestJS y autenticación JWT completa y segura.

## Estructura del Proyecto

```
authentication/
├── config/          # Configuraciones (CORS, base de datos)
├── controllers/     # Controladores (manejan peticiones HTTP)
├── services/        # Servicios (lógica de negocio)
├── repositories/    # Repositorios (interacción con base de datos)
├── routes/          # Definición de rutas
├── middleware/      # Middlewares personalizados
├── utils/           # Utilidades (JWT helpers)
├── prisma/          # Schema y migraciones de Prisma
└── index.js         # Punto de entrada de la aplicación
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
```env
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=tu_secreto_super_seguro_cambia_esto_en_produccion_minimo_32_caracteres
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Database
DATABASE_URL="file:./prisma/dev.db"

# Security
BCRYPT_ROUNDS=12
```

**⚠️ IMPORTANTE:** En producción, cambia `JWT_SECRET` por un valor seguro de al menos 32 caracteres aleatorios.

3. Generar el cliente de Prisma:
```bash
npm run prisma:generate
```

4. Ejecutar migraciones (crea la base de datos):
```bash
npm run prisma:migrate
```

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Prisma Studio (Interfaz visual de la base de datos)
```bash
npm run prisma:studio
```

## Endpoints de Autenticación

### Públicos (no requieren autenticación)

- `POST /api/auth/register` - Registrar un nuevo usuario
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "name": "Nombre del Usuario"
  }
  ```

- `POST /api/auth/login` - Iniciar sesión
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }
  ```

- `POST /api/auth/refresh` - Refrescar access token
  ```json
  {
    "refreshToken": "refresh_token_aquí"
  }
  ```
  O enviar el refresh token como cookie httpOnly.

### Protegidos (requieren autenticación)

- `POST /api/auth/logout` - Cerrar sesión
  - Header: `Authorization: Bearer <access_token>`

- `GET /api/auth/profile` - Obtener perfil del usuario autenticado
  - Header: `Authorization: Bearer <access_token>`

## Endpoints de Usuarios

**Todas las rutas de usuarios requieren autenticación** (header `Authorization: Bearer <access_token>`)

- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener un usuario por ID
- `POST /api/users` - ⚠️ No disponible (usar `/api/auth/register` para crear usuarios)
- `PUT /api/users/:id` - Actualizar un usuario
- `DELETE /api/users/:id` - Eliminar un usuario

## Autenticación JWT

### Cómo funciona

1. **Registro/Login**: El usuario se registra o inicia sesión
   - Se genera un **access token** (válido por 15 minutos)
   - Se genera un **refresh token** (válido por 7 días)
   - El refresh token se almacena como cookie httpOnly y en la base de datos

2. **Acceso a rutas protegidas**: 
   - Incluir el access token en el header: `Authorization: Bearer <access_token>`

3. **Renovación del access token**:
   - Cuando el access token expire, usar el refresh token para obtener uno nuevo
   - El refresh token puede enviarse en el body o como cookie httpOnly

4. **Cerrar sesión**:
   - El refresh token se elimina de la base de datos y de las cookies

### Ejemplo de uso con cURL

```bash
# 1. Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "name": "Usuario Ejemplo"
  }'

# Respuesta incluye accessToken
# {
#   "success": true,
#   "message": "Usuario registrado exitosamente",
#   "data": {
#     "user": { ... },
#     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#   }
# }

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }'

# 3. Acceder a ruta protegida
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <access_token>"

# 4. Refrescar token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'

# 5. Cerrar sesión
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

## Características de Seguridad

- ✅ **Passwords hasheados** con bcrypt (12 rounds)
- ✅ **JWT con expiración corta** para access tokens (15 min)
- ✅ **Refresh tokens** con expiración larga (7 días)
- ✅ **Refresh tokens almacenados en BD** para invalidación
- ✅ **Cookies httpOnly** para refresh tokens (protección XSS)
- ✅ **Validación de email y password** (mínimo 8 caracteres)
- ✅ **Tokens firmados** con secreto seguro
- ✅ **Middleware de autenticación** para proteger rutas
- ✅ **Manejo de errores** específico para tokens expirados/inválidos
- ✅ **Datos sensibles nunca expuestos** (passwords y refresh tokens no se devuelven)

## Características Técnicas

- ✅ Express con configuración básica
- ✅ CORS configurado
- ✅ Handler global para endpoints no definidos (404)
- ✅ Handler global para el manejo de errores
- ✅ Prisma con SQLite3
- ✅ Arquitectura por capas (Routes → Controllers → Services → Repositories)
- ✅ Autenticación JWT completa y segura
- ✅ Gestión de refresh tokens
- ✅ Validación de datos de entrada

## Modelo de Datos

```prisma
model User {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  name         String?
  password     String    // Hasheado con bcrypt
  refreshToken String?   // Refresh token actual
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

## Notas de Seguridad

1. **En producción**, cambia el `JWT_SECRET` por un valor aleatorio seguro de al menos 32 caracteres
2. **Usa HTTPS** en producción para proteger los tokens en tránsito
3. **Configura CORS** apropiadamente según tu frontend
4. **Considera rate limiting** para prevenir ataques de fuerza bruta
5. **Implementa logging** de intentos de autenticación fallidos
6. **Considera 2FA** para mayor seguridad en producción

