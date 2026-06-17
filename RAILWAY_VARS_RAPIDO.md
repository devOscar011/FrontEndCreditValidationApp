# 🚀 RESUMEN RÁPIDO - Variables para Railway

## Copia y Pega Estas Variables en Railway

### Opción 1: Configuración Mínima (Recomendada)

```
EXPO_PUBLIC_API_URL = https://TU-API-BACKEND.railway.app/api
NODE_ENV = production
```

### Opción 2: Configuración Completa

```
EXPO_PUBLIC_API_URL = https://TU-API-BACKEND.railway.app/api
NODE_ENV = production
EXPO_PORT = 8081
EXPO_PUBLIC_APP_SCHEME = creditvalidation
EXPO_DEBUG = false
```

---

## ⚠️ MÁS IMPORTANTE

**Reemplaza `TU-API-BACKEND.railway.app`** con la URL REAL de tu backend en Railway.

### Ejemplo Real:
```
EXPO_PUBLIC_API_URL = https://credit-validation-api.railway.app/api
NODE_ENV = production
```

---

## 📍 Dónde Configurarlas en Railway

1. Dashboard de Railway → Tu Proyecto → Selecciona el servicio frontend
2. Pestaña **"Variables"** 
3. Agregar cada variable (Key / Value)
4. **Deploy** la aplicación nuevamente

---

## 🔗 Enlaces útiles

- **Documentación Railway**: https://docs.railway.app/
- **Documentación Expo Variables**: https://docs.expo.dev/guides/environment-variables/
- **Tu archivo local**: `.env` (desarrollo)

---

## 💾 Archivos Actualizados

✅ `.env` - Variables para desarrollo local
✅ `.env.example` - Plantilla de referencia
✅ `Services/Api.js` - Ahora usa variables de entorno
✅ `RAILWAY_CONFIG.md` - Guía completa

