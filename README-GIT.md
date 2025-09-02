# Git: comandos rápidos (Windows PowerShell)

Guía corta para subir cambios, traer cambios remotos, resolver conflictos y trabajar con varios repositorios.

## Configuración inicial (una sola vez por máquina)
- Establecer tu identidad:
  - git config --global user.name "Tu Nombre"
  - git config --global user.email "tu@correo.com"

## Ver estado y rama actual
- git status -sb
- git remote -v
- git branch

## Guardar y subir tus cambios (commit & push)
1) Ver archivos modificados
- git status -sb

2) Agregar archivos al commit
- git add .
# o selectivo: git add ruta/del/archivo

3) Crear commit con mensaje
- git commit -m "descripcion de tus cambios"

4) Subir al remoto (tu rama actual)
- git push origin $(git branch --show-current)
# Si te marca upstream requerido: git push -u origin nombre-de-tu-rama

## Traer cambios del remoto (pull)
- git pull
# Si hay conflictos, edita los archivos con marcas <<<<<<<, =======, >>>>>>>, resuélvelos y:
- git add archivo-conflicto
- git commit

## Actualizar tu rama con main sin mezclar commits de más
- git fetch origin
- git rebase origin/main
# Si hay conflictos: resuélvelos, luego
- git add archivo
- git rebase --continue
# Si prefieres mezclar en un merge:
- git merge origin/main

## Trabajar con varias ramas
- Crear nueva rama desde tu rama actual
- git checkout -b feature/nueva-funcion

- Cambiar de rama
- git checkout nombre-de-rama

- Subir nueva rama
- git push -u origin feature/nueva-funcion

## Revertir cambios locales (aún no comiteados)
- git restore archivo
- git restore --staged archivo  # quitar del stage
- git reset --hard              # cuidado: descarta todo local no comiteado

## Ver historial
- git log --oneline --graph --decorate -n 20

## Añadir otro remoto (por ejemplo, un fork o repo alterno)
- git remote add otro https://github.com/usuario/otro-repo.git
- git fetch otro
- git checkout -b rama-de-otro otro/rama-de-otro
- git push -u origin rama-de-otro

## Copiar una carpeta de componentes a otra (PowerShell)
Ejemplo: copiar todo de client/src/components/Asesores a client/src/components/Asesor
- New-Item -ItemType Directory -Force -Path "client/src/components/Asesor"
- Copy-Item -Path "client/src/components/Asesores/*" -Destination "client/src/components/Asesor" -Recurse -Force

Mover (en lugar de copiar):
- Move-Item -Path "client/src/components/Asesores/*" -Destination "client/src/components/Asesor" -Force

## Consejos
- Commits pequeños con mensajes claros.
- Siempre hacer pull/fetch antes de comenzar a trabajar.
- En conflictos, conserva el esquema más reciente y prueba el proyecto antes de subir.

---

## Caso práctico: subir a otra rama remota y manejar “non-fast-forward”
Escenario real: subir tu trabajo a la rama `Miguel-el-Angel` en un remoto alterno llamado `darian` (GitHub: alexT1132/mqerk_ver1).

1) Verifica remotos y trae refs actualizadas
- git remote -v
- git fetch darian --prune

2) Intenta subir tu HEAD actual a esa rama remota
- git push darian HEAD:refs/heads/Miguel-el-Angel

3) Si aparece rechazo “non-fast-forward”, tienes opciones:

Opción A) Integrar cambios remotos y luego subir
- git merge --no-edit darian/Miguel-el-Angel
# Resolver conflictos (archivos con <<<<<<< ======= >>>>>>>)
- git status
- git diff --name-only --diff-filter=U   # ver archivos en conflicto
- git add -A
- git commit -m "Resuelve conflictos de merge desde darian/Miguel-el-Angel"
- git push darian HEAD:refs/heads/Miguel-el-Angel

Opción B) Abortas el merge si decides no mezclar (vuelves al estado previo)
- git merge --abort

Opción C) Reemplazas el historial remoto con tu HEAD (útil si acordado con el equipo)
- git push --force-with-lease darian HEAD:refs/heads/Miguel-el-Angel

Notas:
- Prefiere `--force-with-lease` en lugar de `--force` para evitar sobrescribir cambios ajenos por accidente.
- Si estabas haciendo rebase en vez de merge y hubo conflictos:
  - Tras resolver: `git add archivo` y `git rebase --continue`
  - Para cancelar: `git rebase --abort`
