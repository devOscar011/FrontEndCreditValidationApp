# Configuración de Variables de Entorno para Railway

## 🚀 Variables de Entorno Necesarias

Para desplegar tu aplicación en Railway, necesitas configurar las siguientes variables de entorno en el dashboard de Railway:

### Variables Requeridas

```
EXPO_PUBLIC_API_URL=https://tu-api-backend.railway.app/api
NODE_ENV=production
```

### Variables Opcionales (Recomendadas)

```
EXPO_PORT=8081
EXPO_PUBLIC_APP_SCHEME=creditvalidation
EXPO_DEBUG=false
```

---

## 📋 Guía Paso a Paso en Railway

### 1. **Ir al Dashboard de Railway**
   - Accede a https://railway.app
   - Ve a tu proyecto

### 2. **Agregar Variables de Entorno**
   - Selecciona tu servicio/aplicación
   - Ve a la pestaña **"Variables"**
   - Haz clic en **"+ Add Variable"**

### 3. **Variables a Configurar**

#### Variable 1: EXPO_PUBLIC_API_URL
```
Key: EXPO_PUBLIC_API_URL
Value: https://tu-api-backend.railway.app/api
```
⚠️ **IMPORTANTE**: Reemplaza `https://tu-api-backend.railway.app/api` con la URL REAL de tu backend en Railway.

#### Variable 2: NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### Variable 3: EXPO_PORT
```
Key: EXPO_PORT
Value: 8081
```

#### Variable 4: EXPO_DEBUG
```
Key: EXPO_DEBUG
Value: false
```

---

## 🔄 Cambios en el Código

El archivo `Services/Api.js` ha sido actualizado para usar la variable de entorno:

```javascript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

---

## 💡 Diferencias por Ambiente

### 🏠 Desarrollo Local
```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api
NODE_ENV=development
```

### 🚀 Producción (Railway)
```env
EXPO_PUBLIC_API_URL=https://tu-api-backend.railway.app/api
NODE_ENV=production
```

---

## ✅ Verificación

Para verificar que las variables se cargan correctamente:

1. **En desarrollo local**:
   ```bash
   npm start
   ```
   Abre la consola del navegador y verifica que las peticiones van a `http://127.0.0.1:8000`

2. **En Railway**:
   - Las peticiones deberían ir a tu URL de producción
   - Revisa los logs en Railway si hay errores

---

## 🔐 Buenas Prácticas

- ✅ **Usa variables de entorno** para todos los valores que cambien entre ambientes
- ✅ **Nunca commits** el archivo `.env` (está en .gitignore por defecto)
- ✅ **Usa `.env.example`** como referencia para los desarrolladores
- ✅ **EXPO_PUBLIC_** es necesario en Expo para que las variables sean públicas al cliente
- ✅ **Mantén secrets seguros** - nunca pongas tokens o passwords en `.env`

---

## 🐛 Troubleshooting

### Las peticiones siguen apuntando a localhost
- Verifica que `EXPO_PUBLIC_API_URL` esté configurado en Railway
- Reconstruye la app: `expo prebuild --clean` y redeploy

### La variable no se lee
- Las variables de Expo deben empezar con `EXPO_PUBLIC_`
- Reinicia el servidor de desarrollo: `npm start`

### CORS errors
- Asegúrate que tu backend en Railway permita requests desde tu frontend URL
- Configura CORS en tu backend para producción
