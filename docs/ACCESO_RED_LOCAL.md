# Acceso desde Red Local

Este documento explica cómo acceder a la aplicación (incluyendo el preregistro, test y todo el flujo) desde otros dispositivos en tu red local.

## Configuración Automática (Recomendada)

La aplicación ya está configurada para funcionar en red local automáticamente. Solo necesitas:

### 1. Iniciar el servidor backend
```bash
cd server
npm run dev
```

El servidor mostrará las IPs de red local disponibles, por ejemplo:
```
[server] Acceso LAN:
  -> http://192.168.1.50:1002
```

### 2. Iniciar el cliente frontend
```bash
cd client
npm run dev
```

El cliente también mostrará las IPs disponibles, por ejemplo:
```
  Local:   http://localhost:5173/
  Network: http://192.168.1.50:5173/
```

### 3. Acceder desde otro dispositivo

En otro dispositivo conectado a la misma red WiFi, abre el navegador y ve a:
```
http://192.168.1.50:5173
```
(Reemplaza `192.168.1.50` con la IP que mostró el servidor)

## Configuración Manual (Si hay problemas)

Si el acceso automático no funciona, puedes configurar manualmente:

### Opción 1: Usar variable de entorno VITE_API_URL

Edita `client/.env` y cambia:
```env
VITE_API_URL=http://TU_IP_LOCAL:1002/api
```

Por ejemplo, si tu IP local es `192.168.1.50`:
```env
VITE_API_URL=http://192.168.1.50:1002/api
```

### Opción 2: Usar variable de entorno VITE_API_TARGET (para el proxy)

Si necesitas que el proxy de Vite también use la IP local, agrega en `client/.env`:
```env
VITE_API_TARGET=http://TU_IP_LOCAL:1002
```

Por ejemplo:
```env
VITE_API_TARGET=http://192.168.1.50:1002
```

## Verificar tu IP Local

### Windows:
```cmd
ipconfig
```
Busca "Dirección IPv4" en la sección de tu adaptador de red.

### Linux/Mac:
```bash
ifconfig
# o
ip addr
```

## Notas Importantes

1. **Firewall**: Asegúrate de que el firewall de Windows permita conexiones en los puertos 1002 (backend) y 5173 (frontend).

2. **Misma Red**: Todos los dispositivos deben estar en la misma red WiFi/LAN.

3. **HTTPS**: Si necesitas HTTPS en producción, configura un proxy reverso (nginx, etc.).

4. **CORS**: El servidor ya está configurado para permitir acceso desde IPs locales (192.168.x.x, 10.x.x.x, 172.16-31.x.x).

## Flujo Completo Accesible

Una vez configurado, todo el flujo es accesible desde la red local:
- ✅ `/pre_registro` - Preregistro de asesor
- ✅ `/test` - Pruebas psicológicas
- ✅ `/resultados` - Resultados de pruebas
- ✅ `/registro_asesor` - Registro formal
- ✅ `/gracias` - Página final

Todos estos endpoints funcionarán correctamente desde cualquier dispositivo en tu red local.
