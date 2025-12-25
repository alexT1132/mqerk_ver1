#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MQERK Database Cleanup Script
Limpia la base de datos manteniendo usuarios admin y asesores
"""

import mysql.connector
from mysql.connector import Error
import sys
import io

# Configurar salida UTF-8 para Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configuración de la base de datos
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Cambia esto si tienes contraseña
    'database': 'mqerkacademy'
}

def connect_db():
    """Conecta a la base de datos"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("✅ Conectado a la base de datos")
            return connection
    except Error as e:
        print(f"❌ Error al conectar: {e}")
        sys.exit(1)

def cleanup_database(connection):
    """Limpia la base de datos manteniendo admin y asesores"""
    cursor = connection.cursor()
    
    try:
        print("\n🧹 Iniciando limpieza de base de datos...")
        print("=" * 60)
        
        # 1. Eliminar todos los estudiantes (esto eliminará usuarios y comprobantes por CASCADE)
        print("\n📋 Eliminando estudiantes...")
        cursor.execute("DELETE FROM estudiantes")
        estudiantes_deleted = cursor.rowcount
        print(f"   ✅ {estudiantes_deleted} estudiantes eliminados")
        
        # 2. Eliminar comprobantes huérfanos (por si acaso)
        print("\n📄 Limpiando comprobantes huérfanos...")
        cursor.execute("DELETE FROM comprobantes WHERE id_estudiante NOT IN (SELECT id FROM estudiantes)")
        comprobantes_deleted = cursor.rowcount
        print(f"   ✅ {comprobantes_deleted} comprobantes huérfanos eliminados")
        
        # 3. Eliminar usuarios que no sean admin ni asesor
        print("\n👥 Limpiando usuarios (manteniendo admin y asesores)...")
        cursor.execute("""
            DELETE FROM usuarios 
            WHERE role NOT IN ('admin', 'administrador', 'asesor', 'administrativo')
        """)
        usuarios_deleted = cursor.rowcount
        print(f"   ✅ {usuarios_deleted} usuarios estudiantes eliminados")
        
        # 4. Limpiar cursos (opcional - descomenta si quieres limpiar cursos)
        # print("\n📚 Limpiando cursos...")
        # cursor.execute("DELETE FROM cursos")
        # cursos_deleted = cursor.rowcount
        # print(f"   ✅ {cursos_deleted} cursos eliminados")
        
        # 5. Limpiar inscripciones
        print("\n📝 Limpiando inscripciones...")
        cursor.execute("DELETE FROM inscripciones")
        inscripciones_deleted = cursor.rowcount
        print(f"   ✅ {inscripciones_deleted} inscripciones eliminadas")
        
        # 6. Limpiar actividades y entregas
        print("\n📊 Limpiando actividades y entregas...")
        cursor.execute("DELETE FROM entregas")
        entregas_deleted = cursor.rowcount
        print(f"   ✅ {entregas_deleted} entregas eliminadas")
        
        cursor.execute("DELETE FROM actividades")
        actividades_deleted = cursor.rowcount
        print(f"   ✅ {actividades_deleted} actividades eliminadas")
        
        # 7. Limpiar mensajes de chat
        print("\n💬 Limpiando mensajes de chat...")
        cursor.execute("DELETE FROM mensajes")
        mensajes_deleted = cursor.rowcount
        print(f"   ✅ {mensajes_deleted} mensajes eliminados")
        
        # 8. Limpiar notificaciones
        print("\n🔔 Limpiando notificaciones...")
        cursor.execute("DELETE FROM notificaciones")
        notificaciones_deleted = cursor.rowcount
        print(f"   ✅ {notificaciones_deleted} notificaciones eliminadas")
        
        # Commit de todos los cambios
        connection.commit()
        
        print("\n" + "=" * 60)
        print("✅ LIMPIEZA COMPLETADA EXITOSAMENTE")
        print("=" * 60)
        
        # Mostrar resumen
        print("\n📊 RESUMEN:")
        print(f"   • Estudiantes eliminados: {estudiantes_deleted}")
        print(f"   • Comprobantes eliminados: {comprobantes_deleted}")
        print(f"   • Usuarios estudiantes eliminados: {usuarios_deleted}")
        print(f"   • Inscripciones eliminadas: {inscripciones_deleted}")
        print(f"   • Entregas eliminadas: {entregas_deleted}")
        print(f"   • Actividades eliminadas: {actividades_deleted}")
        print(f"   • Mensajes eliminados: {mensajes_deleted}")
        print(f"   • Notificaciones eliminadas: {notificaciones_deleted}")
        
        # Mostrar usuarios que quedaron
        print("\n👥 USUARIOS RESTANTES:")
        cursor.execute("SELECT id, username, role FROM usuarios ORDER BY role, id")
        usuarios = cursor.fetchall()
        for user in usuarios:
            print(f"   • ID: {user[0]}, Usuario: {user[1]}, Rol: {user[2]}")
        
    except Error as e:
        connection.rollback()
        print(f"\n❌ Error durante la limpieza: {e}")
        sys.exit(1)
    finally:
        cursor.close()

def main():
    """Función principal"""
    print("=" * 60)
    print("🧹 MQERK DATABASE CLEANUP SCRIPT")
    print("=" * 60)
    print("\n⚠️  ADVERTENCIA:")
    print("   Este script eliminará TODOS los estudiantes y sus datos.")
    print("   Se mantendrán SOLO usuarios admin y asesores.")
    print("\n¿Estás seguro de continuar? (escribe 'SI' para confirmar)")
    
    confirmacion = input("\n> ").strip()
    
    if confirmacion != "SI":
        print("\n❌ Operación cancelada.")
        sys.exit(0)
    
    # Conectar y limpiar
    connection = connect_db()
    cleanup_database(connection)
    connection.close()
    print("\n✅ Conexión cerrada. Script finalizado.")

if __name__ == "__main__":
    main()
