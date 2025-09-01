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

## Consejos
- Commits pequeños con mensajes claros.
- Siempre hacer pull/fetch antes de comenzar a trabajar.
- En conflictos, conserva el esquema más reciente y prueba el proyecto antes de subir.
