# 📦 Guía para Importar la Base de Datos en WampServer

## Método 1: Usando phpMyAdmin (Recomendado)

1. **Abre WampServer** y asegúrate de que esté en verde (todo corriendo)

2. **Abre phpMyAdmin**:
   - Haz clic en el icono de WampServer en la bandeja del sistema
   - Selecciona **"phpMyAdmin"**
   - O ve directamente a: `http://localhost/phpmyadmin`

3. **Crea la base de datos**:
   - En el menú lateral izquierdo, haz clic en **"Nueva"** o **"New"**
   - Nombre de la base de datos: `mqerkacademy`
   - Intercalación: `utf8mb4_general_ci` (o déjalo por defecto)
   - Haz clic en **"Crear"** o **"Create"**

4. **Importa el archivo SQL**:
   - Selecciona la base de datos `mqerkacademy` en el menú lateral
   - Ve a la pestaña **"Importar"** o **"Import"**
   - Haz clic en **"Elegir archivo"** o **"Choose File"**
   - Navega a: `C:\Users\isc20\Desktop\MQERK\mqerk_ver1-Miguel-el-Angel\base de datos\mqerkacademy.sql`
   - Asegúrate de que el formato sea **SQL**
   - Haz clic en **"Continuar"** o **"Go"** al final de la página
   - ⏳ Espera a que termine la importación (puede tardar unos minutos)

5. **Verifica**:
   - Deberías ver todas las tablas en el menú lateral izquierdo
   - Reinicia tu servidor Node.js

---

## Método 2: Usando línea de comandos (Más rápido)

Abre PowerShell o CMD como Administrador y ejecuta:

```powershell
# Ajusta la ruta según tu instalación de WampServer
# Por defecto suele estar en C:\wamp64\bin\mysql\mysql8.x.x\bin\mysql.exe
# O C:\wamp\bin\mysql\mysql8.x.x\bin\mysql.exe

# Reemplaza la ruta con la tuya
$mysqlPath = "C:\wamp64\bin\mysql\mysql8.0.37\bin\mysql.exe"
$sqlFile = "C:\Users\isc20\Desktop\MQERK\mqerk_ver1-Miguel-el-Angel\base de datos\mqerkacademy.sql"

# Importar (crea la base de datos primero si no existe)
& $mysqlPath -u root -e "CREATE DATABASE IF NOT EXISTS mqerkacademy CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
& $mysqlPath -u root mqerkacademy < $sqlFile
```

**Para encontrar la ruta de MySQL en WampServer:**
- Haz clic derecho en el icono de WampServer → Tools → MySQL → MySQL Console
- O busca en: `C:\wamp64\bin\mysql\` o `C:\wamp\bin\mysql\`

---

## Método 3: Script Automático (Más fácil)

Ejecuta el script `importar-db.ps1` que está en la raíz del proyecto.

---

## ✅ Verificación

Después de importar, reinicia tu servidor Node.js y deberías ver:
- ✅ Sin errores de "Unknown database"
- ✅ Todas las tablas inicializadas correctamente

## ❌ Si tienes problemas

1. **Error de permisos**: Asegúrate de que MySQL esté corriendo en WampServer
2. **Error de tamaño**: Si el archivo es muy grande, aumenta el límite en phpMyAdmin:
   - Ve a `php.ini` en WampServer
   - Aumenta `upload_max_filesize` y `post_max_size` a al menos 50M
   - Reinicia WampServer
3. **Error de codificación**: Asegúrate de que la base de datos use `utf8mb4`

