# Uber App (Ionic + Angular)

App móvil que consume la API REST de Laravel (ver `API_DOCUMENTATION.md`). Tiene 3 roles:

- **Pasajero**: estima la tarifa, pide el viaje, ve al conductor asignado, cancela, califica e historial.
- **Conductor**: se conecta/desconecta, ve solicitudes, acepta, y avanza el viaje (llegué → iniciar → finalizar).
- **Admin**: resumen (KPIs), aprobar/suspender conductores, tarifas y viajes.

## 1. Requisitos

- **Node.js 24.15 o superior** (o 22.22.3+). Verifica con `node -v`. Descarga: https://nodejs.org
- **Git**
- Ionic CLI (opcional): `npm i -g @ionic/cli`

## 2. Configurar la API

Edita `src/environments/environment.ts` y deja la IP del computador donde corre Laravel:

```ts
apiUrl: 'http://20.20.1.52:8000/api'
```

El servidor Laravel debe estar corriendo con `php artisan serve --host=0.0.0.0 --port=8000`
y tener **CORS** habilitado para poder probar en el navegador.
El computador y el celular deben estar en la **misma red**.

## 3. Instalar y correr

```bash
npm install
npm start
```

Se abre en `http://localhost:4200`. Para verlo como celular: F12 → icono de móvil.

Usuarios de prueba de la documentación: `cliente@uber.com` / `cliente123`
(los de conductor y admin los define el seeder del backend).

## 4. Probar en un celular Android (opcional)

```bash
npm run build
npx cap add android      # solo la primera vez
npx cap sync android
npx cap open android     # abre Android Studio y le das Run
```

## 5. Subir al repositorio

Repositorio: https://github.com/KarenSerrano02/Desarrolo-de-Apps

Primera vez (si la carpeta aún no es un repo):

```bash
git init
git remote add origin https://github.com/KarenSerrano02/Desarrolo-de-Apps.git
git add .
git commit -m "App Ionic Uber: login, pasajero, conductor y admin"
git branch -M main
git push -u origin main
```

Si el repositorio ya tiene contenido y `push` lo rechaza, primero:

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

Las siguientes veces: `git add .` → `git commit -m "mensaje"` → `git push`.

> `node_modules` y `www` no se suben (ya están en `.gitignore`). Quien clone el repo solo corre `npm install`.
