#!/usr/bin/env python3
import os
import time
import zipfile
import tarfile

zip_output = os.path.join('public', 'lluvia-en-mi-zona.zip')
tar_output = os.path.join('public', 'lluvia-en-mi-zona.tar.gz')
os.makedirs('public', exist_ok=True)

# Eliminar zip anterior si existe para evitar escribir sobre sí mismo
for f in [zip_output, tar_output]:
    if os.path.exists(f):
        os.remove(f)

ignored_dirs = {
    'node_modules',
    'dist',
    '.git',
    '__pycache__',
    '.idea',
    '.vscode'
}

ignored_files = {
    'package-project.py',
    'bun.lock',
    '.DS_Store'
}

# Recolectar todos los archivos y directorios
all_dirs = set()
all_files = []

for root, dirs, files in os.walk('.'):
    # Filtrar directorios ignorados
    dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith('.')]
    
    rel_root = os.path.relpath(root, '.')
    if rel_root != '.':
        all_dirs.add(rel_root.replace('\\', '/'))
        
    for file in files:
        if file in ignored_files or file.endswith('.zip') or file.endswith('.tar.gz'):
            continue
        file_path = os.path.normpath(os.path.join(root, file))
        file_rel = os.path.relpath(file_path, '.').replace('\\', '/')
        if not any(file_rel.startswith(ig + '/') for ig in ignored_dirs):
            all_files.append((file_path, file_rel))

# Crear archivo ZIP con compatibilidad universal (Windows, Android, macOS, Linux)
with zipfile.ZipFile(zip_output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
    # 1. Escribir entradas explícitas de directorio (esencial para Windows Explorer y Android)
    for d in sorted(all_dirs):
        dir_name = d if d.endswith('/') else d + '/'
        zinfo = zipfile.ZipInfo(dir_name)
        zinfo.date_time = time.localtime(time.time())[:6]
        # Permisos de directorio en Unix: drwxr-xr-x (0o755)
        zinfo.external_attr = 0o40755 << 16 | 0x10  # 0x10 = flag de directorio en DOS
        zipf.writestr(zinfo, '')
        
    # 2. Escribir archivos con atributos normales
    for file_path, file_rel in sorted(all_files, key=lambda x: x[1]):
        with open(file_path, 'rb') as f:
            data = f.read()
        zinfo = zipfile.ZipInfo(file_rel)
        zinfo.date_time = time.localtime(os.path.getmtime(file_path))[:6]
        zinfo.compress_type = zipfile.ZIP_DEFLATED
        # Permisos de archivo en Unix: -rw-r--r-- (0o644)
        zinfo.external_attr = 0o100644 << 16
        zipf.writestr(zinfo, data)

# Crear también un archivo tar.gz alternativo
with tarfile.open(tar_output, 'w:gz') as tar:
    for file_path, file_rel in all_files:
        tar.add(file_path, arcname=file_rel)

print(f"ZIP creado exitosamente: {zip_output} ({os.path.getsize(zip_output)} bytes)")
print(f"TAR.GZ creado exitosamente: {tar_output} ({os.path.getsize(tar_output)} bytes)")
