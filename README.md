# PERN Tasks paso a paso

**P**ostgreSQL · **E**xpress · **R**eact · **N**ode — con **pnpm** (no se usa npm).

Cada etapa termina con un **test** para confirmar que esa conexión funciona antes de pasar a la siguiente.

```
Navegador ──► React (Vite :5173) ──proxy /api──► Express (:3000) ──pg──► PostgreSQL (:5432)
              Tailwind · Router ·                 REST API · JWT
              Hook Form · Axios · Context         en cookie httpOnly
```

## Índice

1. [Estructura del proyecto](#1-estructura-del-proyecto)
2. [Requisitos y pnpm](#2-requisitos-y-pnpm)
3. [Inicio del backend y dependencias de producción](#3-inicio-del-backend-y-dependencias-de-producción)
4. [Dependencias de desarrollo](#4-dependencias-de-desarrollo)
5. [Carpetas del backend y de la base de datos](#5-carpetas-del-backend-y-de-la-base-de-datos)
6. [Conexión con la base de datos](#6-conexión-con-la-base-de-datos)
7. [Servidor de Express: creación, lanzamiento y mejoras](#7-servidor-de-express-creación-lanzamiento-y-mejoras)
8. [CRUD de tareas](#8-crud-de-tareas)
9. [Registro y autenticación](#9-registro-y-autenticación)
10. [Middleware de autenticación](#10-middleware-de-autenticación)
11. [Frontend](#11-frontend)
12. [Resumen de tests](#12-resumen-de-tests)
13. [Despliegue en Railway](#13-despliegue-en-railway)
14. [Problemas comunes](#14-problemas-comunes)
15. [Documentación oficial](#15-documentación-oficial)

---

## 1. Estructura del proyecto

```
pern-tasks/
├── README.md · package.json · .gitignore
├── backend/
│   ├── src/
│   │   ├── index.js                     servidor de Express
│   │   ├── db/                          db.js · init.sql · test-connection.js
│   │   ├── routes/                      health · auth · tasks
│   │   ├── controllers/                 auth.controller.js · tasks.controller.js
│   │   ├── middlewares/                 auth.middleware.js · validate.middleware.js
│   │   └── schemas/                     validaciones con zod
│   ├── eslint.config.js · nodemon.json · .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/                         axios.js · auth.js · tasks.js
    │   ├── context/                     AuthContext.jsx
    │   ├── components/                  Navbar · ProtectedRoute · ConnectionTests
    │   └── pages/                       Home · Login · Register · Tasks · TaskForm · Profile
    └── vite.config.js                   Tailwind + proxy /api → backend
```

---

## 2. Requisitos y pnpm

Se requiere **Node 20.6 o superior** (por el uso de `--env-file`) y **PostgreSQL**.

```bash
node -v
corepack enable        # activa pnpm 
pnpm -v
```

Desde Node 25, Corepack ya no se distribuye con Node. En ese caso pnpm se instala con el script independiente de su guía de instalación (enlace en la sección 15).

Si alguien ejecuta `npm install` por error, el script `preinstall` lo frena con un mensaje.

---

## 3. Inicio del backend y dependencias de producción

Estos son los comandos con los que inicié el backend. En otra máquina alcanza con `pnpm install` dentro de `backend`:

```bash
mkdir backend && cd backend
pnpm init
pnpm i express cookie-parser cors morgan pg zod md5 jsonwebtoken express-promise-router
```

| Librería                 | Para qué sirve                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------- |
| `express`                | Servidor HTTP y rutas. Se usa la versión 4 porque `express-promise-router` la pide.   |
| `express-promise-router` | Los errores de funciones `async` llegan al manejador de errores sin `try/catch`.      |
| `pg`                     | Cliente de PostgreSQL (con un `Pool` de conexiones).                                  |
| `cors`                   | Permite que el frontend llame a la API enviando cookies.                              |
| `cookie-parser`          | Lee la cookie donde se guarda el JWT.                                                 |
| `morgan`                 | Muestra cada petición en la consola.                                                  |
| `zod`                    | Valida los datos que llegan desde el cliente.                                         |
| `jsonwebtoken`           | Crea y verifica el token de sesión.                                                   |
| `md5`                    | Genera el hash del email para el avatar de **Gravatar** (no se usa para contraseñas). |

> **Express 4:** si se instala con `pnpm i express`, pnpm trae la versión 5 y `express-promise-router` avisa de un conflicto de versiones. Con `pnpm i express@4` se evita.

---

## 4. Dependencias de desarrollo

```bash
pnpm i nodemon eslint -D
```

También se agregaron `@eslint/js` y `globals`, necesarios para la configuración de ESLint (`eslint.config.js`).

- `pnpm dev` → arranca con **nodemon** (se reinicia al guardar).
- `pnpm lint` → revisa el código con **eslint**.

---

## 5. Carpetas del backend y de la base de datos

Las carpetas `routes`, `controllers`, `middlewares` y `schemas` separan responsabilidades. La carpeta `src/db/` contiene `db.js` (el pool de conexiones), `init.sql` (las tablas) y `test-connection.js`.

La base `pern_db` y sus tablas se crean desde **pgAdmin**:

1. Clic derecho sobre **Databases** → **Create → Database…**, nombre `pern_db` y **Save**.
2. Con `pern_db` seleccionada, abrir **Tools → Query Tool**, cargar `backend/src/db/init.sql` con el botón de carpeta (_Open File_) y ejecutarlo con ▶ (o `F5`).
3. Actualizar **Schemas → public → Tables**: deben aparecer `users` y `tasks`.

Alternativa con `psql`, si está disponible en el PATH:

```bash
psql -U postgres -c "CREATE DATABASE pern_db;"
psql -U postgres -d pern_db -f backend/src/db/init.sql
```

**Test:** `psql -U postgres -d pern_db -c "\dt"` debe listar `users` y `tasks`.

---

## 6. Conexión con la base de datos

```bash
cd backend
cp .env.example .env     # completar usuario/clave de PostgreSQL y cambiar JWT_SECRET
pnpm install
```

**🧪 Test 1 — Node ↔ PostgreSQL**

```bash
pnpm test:db
# ✅ Conexión a PostgreSQL OK
#    Base de datos: pern_db
```

Si falla, revisar `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` en `.env`.

---

## 7. Servidor de Express: creación, lanzamiento y mejoras

`src/index.js` configura los middlewares (`morgan`, `cors`, `express.json`, `cookieParser`), monta las rutas bajo `/api`, responde 404 a rutas inexistentes y tiene un manejador de errores final.

```bash
pnpm dev     # 🚀 API escuchando en http://localhost:3000
```

En otra terminal:

- **🧪 Test 2 — Express responde** · `curl http://localhost:3000/api/health/ping`
- **🧪 Test 3 — Express ↔ PostgreSQL** · `curl http://localhost:3000/api/health/db`

---

## 8. CRUD de tareas

| Función                  | Ruta                    |
| ------------------------ | ----------------------- |
| `crearTarea`             | `POST /api/tasks`       |
| `listarTareas` (plural)  | `GET /api/tasks`        |
| `listarTarea` (singular) | `GET /api/tasks/:id`    |
| `eliminarTarea`          | `DELETE /api/tasks/:id` |
| `actualizarTarea`        | `PUT /api/tasks/:id`    |

Puntos clave de `crearTarea`:

1. **Validación de lo que viene del cliente:** `validate.middleware.js` valida `req.body` con zod y responde 400 con el detalle.
2. **Base y tabla:** `init.sql` y `src/db/db.js`.
3. **Pruebas y manejo de errores:** ids no numéricos devuelven 400, tareas inexistentes devuelven 404.
4. **`RETURNING`:** el `INSERT` y el `UPDATE` devuelven la fila resultante en la misma consulta.

Cada usuario solo ve y modifica **sus** tareas (todas las consultas filtran por `user_id`).

Las rutas de tareas requieren sesión, por eso los tests de este CRUD se hacen después de la autenticación (secciones 9 y 10).

---

## 9. Registro y autenticación

| Etapa  | Qué hace                                                                               |
| ------ | -------------------------------------------------------------------------------------- |
| signup | `POST /api/auth/signup` valida, guarda el usuario y devuelve 409 si el email ya existe |
| bcrypt | **bcrypt** protege la contraseña: se guarda el hash, nunca el texto plano              |
| jwt    | Se crea un **JWT** con el id del usuario (vence en 1 día)                              |
| cookie | El token se guarda en una **cookie `httpOnly`**                                        |

También hay `signin`, `signout` y `profile`.

**bcrypt y pnpm:** pnpm 10 bloquea por defecto los scripts de instalación de las dependencias. Por eso `package.json` incluye `pnpm.onlyBuiltDependencies: ["bcrypt"]`. Si en otro proyecto aparece el aviso _"Ignored build scripts"_, se ejecuta `pnpm approve-builds`.

**md5** se usa solo para el avatar: `https://www.gravatar.com/avatar/<md5 del email>`.

**🧪 Test 4 — Autenticación** (`-c` guarda la cookie y `-b` la envía)

```bash
B=http://localhost:3000/api; H='Content-Type: application/json'

curl -X POST $B/auth/signup -H "$H" -d '{"name":"G","email":"x","password":"1"}'        # 400
curl -c cookies.txt -X POST $B/auth/signup -H "$H" \
  -d '{"name":"Gustavo","email":"gustavo@test.com","password":"123456"}'                 # 201
curl -X POST $B/auth/signup -H "$H" \
  -d '{"name":"Otro","email":"gustavo@test.com","password":"123456"}'                    # 409
curl -X POST $B/auth/signin -H "$H" -d '{"email":"gustavo@test.com","password":"mal"}'   # 401
curl -c cookies.txt -X POST $B/auth/signin -H "$H" \
  -d '{"email":"gustavo@test.com","password":"123456"}'                                  # 200
```

Para comprobar que el password quedó cifrado (la misma consulta sirve en el Query Tool de pgAdmin):

```bash
psql -U postgres -d pern_db -c "SELECT email, left(password, 4) FROM users;"   # empieza con $2b$
```

---

## 10. Middleware de autenticación

`isAuth` (en `auth.middleware.js`) lee la cookie `token`, verifica el JWT y deja el usuario en `req.user`. Protege `/api/auth/profile` y todas las rutas de `/api/tasks`.

Los comandos de esta sección usan las variables `B` y `H` y el archivo `cookies.txt` del Test 4.

```bash
curl -i $B/auth/profile                  # 401 (sin cookie)
curl -b cookies.txt $B/auth/profile      # devuelve el usuario
```

**🧪 Test 5 — CRUD con sesión**

```bash
curl -b cookies.txt -X POST $B/tasks -H "$H" -d '{"title":"Aprender PERN"}'    # 201 + la tarea creada
curl -b cookies.txt $B/tasks                                                   # lista
curl -b cookies.txt $B/tasks/1                                                 # una tarea
curl -b cookies.txt -X PUT $B/tasks/1 -H "$H" -d '{"done":true}'               # actualiza
curl -b cookies.txt -i -X DELETE $B/tasks/1                                    # 204
curl -b cookies.txt -i $B/tasks/999                                            # 404
curl -b cookies.txt -i $B/tasks/abc                                            # 400
```

Rutas de la API:

| Método           | Ruta                                        | Requiere sesión |
| ---------------- | ------------------------------------------- | --------------- |
| GET              | `/api/health/ping` · `/api/health/db`       | No              |
| POST             | `/api/auth/signup` · `/signin` · `/signout` | No              |
| GET              | `/api/auth/profile`                         | Sí              |
| GET, POST        | `/api/tasks`                                | Sí              |
| GET, PUT, DELETE | `/api/tasks/:id`                            | Sí              |

---

## 11. Frontend

React · Tailwind · React Router · React Hook Form · Axios · Context

```bash
cd frontend
pnpm install
pnpm dev          # http://localhost:5173  (con el backend corriendo)
```

Así se instalaron las librerías del diagrama:

```bash
pnpm add react react-dom react-router-dom react-hook-form axios
pnpm add -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite
```

| Pieza               | Dónde se usa                                                                      |
| ------------------- | --------------------------------------------------------------------------------- |
| **React Router**    | `App.jsx` define las rutas; `ProtectedRoute` redirige a `/login` si no hay sesión |
| **Context**         | `AuthContext.jsx` guarda el usuario y expone `signup`, `signin`, `signout`        |
| **Axios**           | `api/axios.js` crea el cliente con `withCredentials` para enviar la cookie        |
| **React Hook Form** | Formularios de login, registro y tareas, con sus validaciones                     |
| **Tailwind CSS**    | Estilos con clases; se activa con el plugin en `vite.config.js`                   |

El archivo `vite.config.js` reenvía todo lo que empieza con `/api` hacia `localhost:3000`. Así el navegador ve un solo origen y la cookie del JWT viaja sin problemas.

Páginas: `/` (inicio y tests), `/login`, `/register`, `/tasks`, `/tasks/new`, `/tasks/:id/edit` y `/profile`.

**🧪 Test 6 — React ↔ Express ↔ PostgreSQL**

La página de inicio muestra el panel **"Tests de conexión"**, que se ejecuta solo:

- ✅ React → Express (proxy + CORS)
- ✅ React → Express → PostgreSQL

Después se prueba el flujo completo: registrarse, crear, marcar, editar y eliminar tareas, y ver el perfil con el avatar.

---

## 12. Resumen de tests

| #   | Qué prueba              | Sección | Cómo                           |
| --- | ----------------------- | ------- | ------------------------------ |
| 1   | Node ↔ PostgreSQL       | 6       | `pnpm test:db`                 |
| 2   | Express responde        | 7       | `GET /api/health/ping`         |
| 3   | Express ↔ PostgreSQL    | 7       | `GET /api/health/db`           |
| 4   | Signup, signin y cookie | 9       | curl de la sección 9           |
| 5   | CRUD con sesión         | 10      | curl de la sección 10          |
| 6   | React ↔ API ↔ base      | 11      | panel en http://localhost:5173 |

---

## 13. Despliegue en Railway

El diagrama de la guía termina en Railway:

- `db.js` usa `DATABASE_URL` si existe, que es la variable que entrega el servicio de PostgreSQL de Railway.
- Hay que definir `JWT_SECRET`, `FRONTEND_URL` y `NODE_ENV=production` en el servicio del backend.
- Con `NODE_ENV=production` la cookie se envía con `secure: true` (solo HTTPS).
- Si el frontend y el backend quedan en **dominios distintos**, la cookie necesita `sameSite: "none"` en `auth.controller.js` y el frontend debe apuntar a la URL del backend en lugar del proxy de Vite.
- Las tablas hay que crearlas ejecutando `init.sql` sobre la base de Railway.

---

## 14. Problemas comunes

- **`password authentication failed`**: la clave de `.env` no coincide con la del usuario de PostgreSQL.
- **`database "pern_db" does not exist`**: falta el `CREATE DATABASE`.
- **`relation "users" does not exist`**: falta ejecutar `init.sql`.
- **`EADDRINUSE`**: el puerto 3000 ya está ocupado (por ejemplo, otro servidor que quedó abierto). Se cierra ese servidor o se cambia `PORT` en `.env` y el destino del proxy en `vite.config.js`.
- **El panel del frontend muestra ❌**: el backend no está corriendo o no está en el puerto 3000.
- **`Ignored build scripts: bcrypt`**: ejecutar `pnpm approve-builds`.

Antes de publicar el proyecto se cambia `JWT_SECRET` por un valor largo y aleatorio. El archivo `.env` está en `.gitignore` y no se sube a GitHub.

---

## 15. Documentación oficial

Enlaces oficiales de las herramientas usadas en cada punto. La lista se amplía a medida que se suman actividades.

**2. Requisitos y pnpm**

- [pnpm](https://pnpm.io/)
- [pnpm: instalación](https://pnpm.io/installation)
- [Node.js: opciones de línea de comandos (`--env-file`)](https://nodejs.org/api/cli.html)
- [Corepack](https://github.com/nodejs/corepack)

**3. Inicio del backend y dependencias de producción**

- [Express](https://expressjs.com/)
- [express-promise-router](https://github.com/express-promise-router/express-promise-router)
- [node-postgres (`pg`)](https://node-postgres.com/)
- [Express: middleware `cors`](https://expressjs.com/en/resources/middleware/cors.html)
- [Express: middleware `cookie-parser`](https://expressjs.com/en/resources/middleware/cookie-parser.html)
- [Express: middleware `morgan`](https://expressjs.com/en/resources/middleware/morgan.html)
- [Zod](https://zod.dev/)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [md5](https://github.com/pvorb/node-md5)
- [Gravatar para desarrolladores](https://docs.gravatar.com/)

**4. Dependencias de desarrollo**

- [nodemon](https://nodemon.io/)
- [ESLint](https://eslint.org/docs/latest/)

**5. Carpetas del backend y de la base de datos**

- [PostgreSQL: documentación](https://www.postgresql.org/docs/)
- [pgAdmin: documentación](https://www.pgadmin.org/docs/)

**6. Conexión con la base de datos**

- [node-postgres (`pg`)](https://node-postgres.com/)
- [Node.js: opciones de línea de comandos (`--env-file`)](https://nodejs.org/api/cli.html)

**7. Servidor de Express: creación, lanzamiento y mejoras**

- [Express: manejo de errores](https://expressjs.com/en/guide/error-handling.html)
- [Express: uso de middleware](https://expressjs.com/en/guide/using-middleware.html)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

**8. CRUD de tareas**

- [Zod](https://zod.dev/)
- [PostgreSQL: `RETURNING` en `INSERT` y `UPDATE`](https://www.postgresql.org/docs/current/dml-returning.html)
- [MDN: códigos de estado HTTP](https://developer.mozilla.org/es/docs/Web/HTTP/Status)

**9. Registro y autenticación**

- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [JWT: introducción](https://jwt.io/introduction)
- [MDN: cookies HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [pnpm: `approve-builds`](https://pnpm.io/cli/approve-builds)

**10. Middleware de autenticación**

- [Express: uso de middleware](https://expressjs.com/en/guide/using-middleware.html)
- [MDN: códigos de estado HTTP](https://developer.mozilla.org/es/docs/Web/HTTP/Status)

**11. Frontend**

- [React](https://react.dev/)
- [React: `useContext`](https://react.dev/reference/react/useContext)
- [React Router](https://reactrouter.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Axios](https://axios-http.com/docs/intro)
- [Vite: opciones del servidor (proxy)](https://vite.dev/config/server-options)
- [Tailwind CSS con Vite](https://tailwindcss.com/docs/installation/using-vite)

**13. Despliegue en Railway**

- [Railway: documentación](https://docs.railway.com/)

**Control de versiones (commits y tags del repositorio)**

- [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/)
- [Git: etiquetado](https://git-scm.com/book/es/v2/Fundamentos-de-Git-Etiquetado)
