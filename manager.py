import tkinter as tk
from tkinter import ttk, messagebox, simpledialog, scrolledtext
import subprocess
import threading
import os
import socket
import webbrowser
import time

# ================= CONFIGURACIÓN =================
SERVER_DIR = "server"
CLIENT_DIR = "client"
SERVER_PORT = "1002"
CLIENT_PORT = "5173"

# Estética Cyberpunk/Hacker v3.1 (Safety Update)
APP_TITLE = "MQERK COMMANDER - SAFETY EDITION v3.1"
THEME_BG = "#0d0d0d"        # Negro puro
THEME_FG = "#00ffcc"        # Cyan Neón
THEME_BTN = "#1f1f1f"       # Gris oscuro
THEME_ACCENT = "#ff0055"    # Rojo Neón
THEME_WARN = "#ffcc00"      # Amarillo Advertencia

class MqerkCommander:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_TITLE)
        self.root.geometry("1000x720")
        self.root.configure(bg=THEME_BG)
        
        # Variables de estado
        self.local_ip = self.get_local_ip()
        self.is_busy = False

        # Configurar estilos
        self.setup_styles()
        
        # UI
        self.create_header()
        self.create_tabs()
        self.create_console()
        
        # Inicio
        self.check_git_status()
        self.log("✅ Sistema inicializado. Modo Seguro activado.")

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use('clam')
        
        style.configure("TNotebook", background=THEME_BG, borderwidth=0)
        style.configure("TNotebook.Tab", background="#222", foreground="white", padding=[15, 8], font=("Consolas", 10))
        style.map("TNotebook.Tab", background=[("selected", THEME_FG)], foreground=[("selected", "black")])
        
        style.configure("TFrame", background=THEME_BG)
        style.configure("TLabelframe", background=THEME_BG, foreground=THEME_FG, bordercolor="#333")
        style.configure("TLabelframe.Label", background=THEME_BG, foreground=THEME_FG, font=("Consolas", 10, "bold"))
        
        style.configure("TButton", background=THEME_BTN, foreground="white", borderwidth=1, font=("Segoe UI", 9))
        style.map("TButton", background=[("active", THEME_FG)], foreground=[("active", "black")])
        
        style.configure("Danger.TButton", foreground=THEME_ACCENT)
        style.map("Danger.TButton", background=[("active", THEME_ACCENT)], foreground=[("active", "white")])

    def get_local_ip(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "127.0.0.1"

    # ================= UI PRINCIPAL =================
    def create_header(self):
        header_frame = tk.Frame(self.root, bg=THEME_BG, pady=15)
        header_frame.pack(fill="x", padx=15)
        
        tk.Label(header_frame, text="MQERK COMMANDER", font=("Consolas", 24, "bold"), bg=THEME_BG, fg=THEME_FG).pack(side="left")
        
        # Panel de Estado (Derecha)
        self.status_frame = tk.Frame(header_frame, bg=THEME_BG)
        self.status_frame.pack(side="right")
        
        self.lbl_busy = tk.Label(self.status_frame, text="🟢 LISTO", font=("Consolas", 10, "bold"), bg=THEME_BG, fg="#00ff00")
        self.lbl_busy.pack(anchor="e")
        
        self.lbl_info = tk.Label(self.status_frame, text=f"IP: {self.local_ip} | RAMA: ...", font=("Consolas", 9), bg=THEME_BG, fg="white")
        self.lbl_info.pack(anchor="e")

    def create_tabs(self):
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(expand=True, fill="both", padx=15, pady=5)
        
        self.tab_dashboard = ttk.Frame(self.notebook)
        self.tab_git = ttk.Frame(self.notebook)
        self.tab_tools = ttk.Frame(self.notebook)
        self.tab_settings = ttk.Frame(self.notebook)
        
        self.notebook.add(self.tab_dashboard, text="🚀 DASHBOARD")
        self.notebook.add(self.tab_git, text="🐙 GIT MASTER")
        self.notebook.add(self.tab_tools, text="🛠️ HERRAMIENTAS")
        self.notebook.add(self.tab_settings, text="⚙️ AJUSTES")
        
        self.build_dashboard_tab()
        self.build_git_tab()
        self.build_tools_tab()
        self.build_settings_tab()

    def create_console(self):
        lbl = tk.Label(self.root, text="REGISTRO DE OPERACIONES (TIEMPO REAL):", bg=THEME_BG, fg="gray", anchor="w", font=("Consolas", 8))
        lbl.pack(fill="x", padx=15)
        
        self.console = scrolledtext.ScrolledText(
            self.root, height=10, bg="#050505", fg="#00ff00", 
            font=("Consolas", 10), state='disabled', insertbackground="white",
            selectbackground=THEME_FG, selectforeground="black"
        )
        self.console.pack(fill="x", padx=15, pady=(0, 15))
        
        self.console.tag_config("error", foreground=THEME_ACCENT)
        self.console.tag_config("info", foreground="white")
        self.console.tag_config("cmd", foreground=THEME_WARN)

    def set_busy(self, busy):
        self.is_busy = busy
        if busy:
            self.lbl_busy.config(text="🔴 PROCESANDO...", fg=THEME_ACCENT)
            self.root.config(cursor="watch")
        else:
            self.lbl_busy.config(text="🟢 LISTO", fg="#00ff00")
            self.root.config(cursor="")

    def log(self, message, type="normal"):
        self.console.config(state='normal')
        
        if type == "cmd":
            self.console.insert(tk.END, f"\n> {message}\n", "cmd")
        elif type == "error":
            self.console.insert(tk.END, f"{message}\n", "error")
        elif type == "info":
            self.console.insert(tk.END, f"{message}\n", "info")
        else:
            self.console.insert(tk.END, f"{message}\n")
            
        self.console.see(tk.END)
        self.console.config(state='disabled')
        self.root.update_idletasks()

    # ================= PESTAÑAS =================
    def build_dashboard_tab(self):
        frame = ttk.Frame(self.tab_dashboard, padding=20)
        frame.pack(fill="both", expand=True)
        
        lf_services = ttk.LabelFrame(frame, text="CONTROL DE SERVICIOS")
        lf_services.pack(fill="x", pady=10)
        
        ttk.Button(lf_services, text="⚡ INICIAR SERVIDORES", command=self.start_services).pack(side="left", padx=10, pady=15, expand=True, fill="x")
        ttk.Button(lf_services, text="🛑 DETENER TODO", command=self.stop_services, style="Danger.TButton").pack(side="left", padx=10, pady=15, expand=True, fill="x")
        
        lf_editor = ttk.LabelFrame(frame, text="ACCESOS RÁPIDOS")
        lf_editor.pack(fill="x", pady=10)
        
        ttk.Button(lf_editor, text="💻 VS Code", command=lambda: self.run_bg("code .")).pack(side="left", padx=5, pady=15, expand=True)
        ttk.Button(lf_editor, text="📂 Carpeta", command=lambda: os.startfile(os.getcwd())).pack(side="left", padx=5, pady=15, expand=True)
        ttk.Button(lf_editor, text="🌍 Web App", command=lambda: webbrowser.open(f"http://localhost:{CLIENT_PORT}")).pack(side="left", padx=5, pady=15, expand=True)

    def build_git_tab(self):
        frame = ttk.Frame(self.tab_git, padding=20)
        frame.pack(fill="both", expand=True)
        
        lf_actions = ttk.LabelFrame(frame, text="ACCIONES RÁPIDAS")
        lf_actions.pack(fill="x", pady=5)
        
        ttk.Button(lf_actions, text="📤 PUSH", command=self.git_push).grid(row=0, column=0, padx=5, pady=10, sticky="ew")
        ttk.Button(lf_actions, text="📥 PULL", command=self.git_pull).grid(row=0, column=1, padx=5, pady=10, sticky="ew")
        ttk.Button(lf_actions, text="🔄 STATUS", command=lambda: self.run_git_cmd("status -s")).grid(row=0, column=2, padx=5, pady=10, sticky="ew")
        lf_actions.columnconfigure(0, weight=1); lf_actions.columnconfigure(1, weight=1); lf_actions.columnconfigure(2, weight=1)

        lf_branches = ttk.LabelFrame(frame, text="GESTIÓN DE RAMAS")
        lf_branches.pack(fill="x", pady=15)
        
        ttk.Button(lf_branches, text="✨ Nueva Rama", command=self.git_new_branch).pack(side="left", padx=5, pady=10, expand=True)
        ttk.Button(lf_branches, text="🔀 CAMBIAR RAMA (Lista)", command=self.git_checkout_ui).pack(side="left", padx=5, pady=10, expand=True)
        ttk.Button(lf_branches, text="🔥 ELIMINAR RAMA (Seguro)", command=self.git_delete_ui, style="Danger.TButton").pack(side="left", padx=5, pady=10, expand=True)

        lf_history = ttk.LabelFrame(frame, text="HISTORIAL")
        lf_history.pack(fill="x", pady=5)
        ttk.Button(lf_history, text="🕒 Ver últimos commits", command=lambda: self.run_git_cmd("log --oneline -n 10")).pack(fill="x", padx=5, pady=10)

    def build_tools_tab(self):
        frame = ttk.Frame(self.tab_tools, padding=20)
        frame.pack(fill="both", expand=True)
        
        lf_gen = ttk.LabelFrame(frame, text="THE ARCHITECT")
        lf_gen.pack(fill="x", pady=5)
        ttk.Button(lf_gen, text="🏗️ Crear Componente React", command=self.create_react_component).pack(fill="x", padx=10, pady=10)
        
        lf_npm = ttk.LabelFrame(frame, text="NPM WIZARD")
        lf_npm.pack(fill="x", pady=10)
        self.npm_target = tk.StringVar(value="client")
        ttk.Radiobutton(lf_npm, text="Client", variable=self.npm_target, value="client").pack(side="left", padx=20)
        ttk.Radiobutton(lf_npm, text="Server", variable=self.npm_target, value="server").pack(side="left", padx=20)
        ttk.Button(lf_npm, text="📦 Instalar Paquete", command=self.npm_install).pack(side="right", padx=10, pady=10)

        lf_jarvis = ttk.LabelFrame(frame, text="JARVIS INSIGHTS")
        lf_jarvis.pack(fill="x", pady=10)
        ttk.Button(lf_jarvis, text="🔍 Buscar //TODOs", command=self.find_todos).pack(fill="x", padx=10, pady=10)

    def build_settings_tab(self):
        frame = ttk.Frame(self.tab_settings, padding=20)
        frame.pack(fill="both", expand=True)
        ttk.Button(frame, text="💾 Backup Proyecto", command=self.backup_project).pack(fill="x", pady=5)
        ttk.Button(frame, text="🔗 Cambiar URL Repo", command=self.change_repo_url).pack(fill="x", pady=5)
        tk.Label(frame, text="PELIGRO", bg=THEME_BG, fg=THEME_ACCENT, font=("Consolas", 12)).pack(pady=(30, 5))
        ttk.Button(frame, text="☢️ HARD RESET (Reinstalar Todo)", command=self.hard_reset, style="Danger.TButton").pack(fill="x", pady=5)

    # ================= LÓGICA DE FONDO =================
    
    def run_bg(self, cmd, cwd=None):
        def thread_task():
            self.set_busy(True)
            self.log(f"Ejecutando: {cmd}", "cmd")
            try:
                process = subprocess.Popen(
                    cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                    cwd=cwd, text=True, bufsize=1, universal_newlines=True
                )
                while True:
                    output = process.stdout.readline()
                    if output == '' and process.poll() is not None: break
                    if output: self.root.after(0, self.log, output.strip())

                err = process.stderr.read()
                if err:
                    if "npm WARN" not in err and "update available" not in err:
                         self.root.after(0, self.log, f"STDERR: {err.strip()}", "error")

                rc = process.poll()
                if rc == 0: self.root.after(0, self.log, "✅ Finalizado con éxito.", "info")
                else: self.root.after(0, self.log, f"⚠️ Finalizado con código {rc}", "error")

                if "git" in cmd: self.root.after(500, self.check_git_status)

            except Exception as e:
                self.root.after(0, self.log, f"❌ Error crítico: {str(e)}", "error")
            finally:
                self.root.after(0, lambda: self.set_busy(False))

        threading.Thread(target=thread_task, daemon=True).start()

    def run_git_cmd(self, args):
        self.run_bg(f"git {args}")

    def check_git_status(self):
        def _check():
            try:
                branch = subprocess.check_output("git rev-parse --abbrev-ref HEAD", shell=True).decode().strip()
                self.lbl_info.config(text=f"IP: {self.local_ip} | RAMA: {branch}")
            except:
                self.lbl_info.config(text=f"IP: {self.local_ip} | RAMA: NO GIT")
        threading.Thread(target=_check, daemon=True).start()

    # --- SERVICIOS ---
    def start_services(self):
        self.log("🚀 Abriendo terminales...", "info")
        def launch(cwd, title):
            cmd = "npm run dev -- --host"
            os.system(f'start "{title}" /D "{cwd}" cmd /k {cmd}')
        if os.path.exists(SERVER_DIR): launch(os.path.abspath(SERVER_DIR), "MQERK Server")
        else: self.log("⚠️ Falta carpeta server", "error")
        if os.path.exists(CLIENT_DIR): launch(os.path.abspath(CLIENT_DIR), "MQERK Client")
        else: self.log("⚠️ Falta carpeta client", "error")

    def stop_services(self):
        self.log("🛑 Deteniendo procesos...", "cmd")
        cmds = [
            f'for /f "tokens=5" %a in (\'netstat -ano ^| findstr :{SERVER_PORT} ^| findstr LISTENING\') do taskkill /F /PID %a',
            f'for /f "tokens=5" %a in (\'netstat -ano ^| findstr :{CLIENT_PORT} ^| findstr LISTENING\') do taskkill /F /PID %a',
            "taskkill /F /IM node.exe", 
            "taskkill /F /IM nodemon.exe"
        ]
        for c in cmds: self.run_bg(c)

    # --- GIT BASIC ---
    def git_push(self):
        msg = simpledialog.askstring("Git Push", "Mensaje del commit:", parent=self.root)
        if msg:
            try: remote = subprocess.check_output("git remote", shell=True).decode().strip().splitlines()[0]
            except: remote = "origin"
            self.run_bg(f'git add . && git commit -m "{msg}" && git push -u {remote} HEAD')

    def git_pull(self):
        self.run_bg("git pull")

    def git_new_branch(self):
        name = simpledialog.askstring("Nueva Rama", "Nombre de la rama:", parent=self.root)
        if name: self.run_bg(f"git checkout -b {name}")

    def git_checkout_ui(self):
        self.set_busy(True)
        try:
            raw = subprocess.check_output("git branch -a", shell=True).decode().splitlines()
            branches = []
            for b in raw:
                b = b.strip().replace("* ", "")
                if "->" in b: continue
                branches.append(b)
        except: branches = []
        self.set_busy(False)
            
        top = tk.Toplevel(self.root)
        top.title("Cambiar Rama")
        top.geometry("400x150")
        top.configure(bg=THEME_BG)
        
        tk.Label(top, text="Selecciona destino:", bg=THEME_BG, fg="white").pack(pady=10)
        combo = ttk.Combobox(top, values=branches, width=50)
        combo.pack(padx=10, pady=5)
        
        def do_checkout():
            full = combo.get()
            if not full: return
            top.destroy()
            if "remotes/" in full:
                clean = full.split("/")[-1]
                remote_ref = full.replace("remotes/", "")
                self.log(f"Conectando a remoto: {remote_ref}", "info")
                self.run_bg(f'git checkout {clean} 2>nul || git checkout -b {clean} --track {remote_ref}')
            else: 
                self.run_bg(f"git checkout {full}")

        ttk.Button(top, text="Ir a Rama", command=do_checkout).pack(pady=10)

    # === GIT DELETE SEGURO ===
    def git_delete_ui(self):
        top = tk.Toplevel(self.root)
        top.title("ELIMINAR RAMA - SEGURO")
        top.geometry("450x250")
        top.configure(bg=THEME_BG)
        
        tk.Label(top, text="⚠️ ZONA DE PELIGRO ⚠️", fg=THEME_ACCENT, bg=THEME_BG, font=("Arial", 12, "bold")).pack(pady=10)
        tk.Label(top, text="¿Qué quieres borrar?", fg="white", bg=THEME_BG).pack(pady=5)

        def show_selection_window(mode):
            is_remote = (mode == "REMOTE")
            
            if is_remote:
                self.log("🧹 Sincronizando (Prune)...", "info")
                try: subprocess.run("git fetch -p", shell=True, check=True)
                except: pass

            cmd = "git branch -r" if is_remote else "git branch"
            try: raw = subprocess.check_output(cmd, shell=True).decode().splitlines()
            except: 
                messagebox.showerror("Error", "Error leyendo ramas")
                return

            branches = [b.strip().replace("* ", "") for b in raw if "->" not in b]
            if not branches:
                messagebox.showinfo("Info", "No hay ramas.")
                return

            sel_win = tk.Toplevel(top)
            sel_win.title(f"Borrar {mode}")
            sel_win.geometry("450x220")
            sel_win.configure(bg=THEME_BG)
            
            tk.Label(sel_win, text=f"Selecciona la rama {mode} a eliminar:", fg="white", bg=THEME_BG).pack(pady=10)
            combo = ttk.Combobox(sel_win, values=branches, width=50, state="readonly")
            combo.pack(padx=10, pady=5)
            if branches: combo.current(0)

            def execute_delete():
                target = combo.get()
                if not target: return
                
                # --- EXPLICACIÓN Y CONFIRMACIÓN SEGURA ---
                if is_remote:
                    # Protección extra para ramas principales
                    clean_name = target.split("/")[-1] if "/" in target else target
                    if clean_name in ["master", "main", "dev", "develop"]:
                        if not messagebox.askyesno("⚠️ ALERTA CRÍTICA", f"¡ESTÁS INTENTANDO BORRAR '{clean_name}'!\n\nEsto suele ser catastrófico para el equipo.\n¿Estás 100% seguro?"):
                            return
                        if not messagebox.askyesno("CONFIRMACIÓN FINAL", "De verdad... ¿Seguro que quieres borrar la rama PRINCIPAL del servidor?"):
                            return
                    
                    # Mensaje estándar remoto
                    if not messagebox.askyesno("PELIGRO - SERVIDOR", 
                        f"⚠️ VAS A BORRAR '{target}' DE LA NUBE (GitHub/GitLab).\n\n"
                        f"• Esto afectará a TODOS los usuarios del proyecto.\n"
                        f"• Si borras la rama de un compañero, perderá su trabajo.\n\n"
                        f"¿Confirmas que esta es TU rama y deseas eliminarla?"):
                        return

                    sel_win.destroy(); top.destroy()
                    if "/" in target:
                        parts = target.split("/", 1)
                        self.run_bg(f"git push {parts[0]} --delete {parts[1]}")
                    else:
                        self.run_bg(f"git push origin --delete {target}")

                else:
                    # Mensaje estándar local
                    if not messagebox.askyesno("CONFIRMAR LOCAL", 
                        f"Vas a borrar '{target}' de TU computadora.\n\n"
                        f"• No afecta al servidor ni a otros usuarios.\n"
                        f"• Podrás volver a bajarla si está en la nube.\n\n"
                        f"¿Proceder?"):
                        return

                    sel_win.destroy(); top.destroy()
                    self.run_bg(f"git branch -D {target}")

            ttk.Button(sel_win, text="🗑️ ELIMINAR", command=execute_delete, style="Danger.TButton").pack(pady=15, fill="x", padx=20)

        frame_btns = tk.Frame(top, bg=THEME_BG)
        frame_btns.pack(fill="both", expand=True, padx=20, pady=10)
        ttk.Button(frame_btns, text="Borrar Local (Solo en mi PC)", command=lambda: show_selection_window("LOCAL")).pack(fill="x", pady=5)
        ttk.Button(frame_btns, text="Borrar Remota (EN EL SERVIDOR)", command=lambda: show_selection_window("REMOTE"), style="Danger.TButton").pack(fill="x", pady=5)

    # --- TOOLS ---
    def create_react_component(self):
        name = simpledialog.askstring("Architect", "Nombre del Componente:")
        if not name: return
        path = os.path.join(CLIENT_DIR, "src", "components", name)
        if os.path.exists(path):
            messagebox.showerror("Error", "Ya existe")
            return
        try:
            os.makedirs(path)
            jsx = f"import React from 'react'\nimport './{name}.css'\n\nconst {name} = () => {{\n  return <div className=\"{name}\">{name} Works!</div>\n}}\nexport default {name}"
            css = f".{name} {{ padding: 20px; }}"
            with open(os.path.join(path, f"{name}.jsx"), "w") as f: f.write(jsx)
            with open(os.path.join(path, f"{name}.css"), "w") as f: f.write(css)
            self.log(f"✅ Componente {name} creado.", "info")
        except Exception as e: self.log(f"❌ Error: {e}", "error")

    def npm_install(self):
        pkg = simpledialog.askstring("NPM", "Nombre del paquete:")
        if not pkg: return
        target = self.npm_target.get()
        cwd = SERVER_DIR if target == "server" else CLIENT_DIR
        self.run_bg(f"npm install {pkg}", cwd=os.path.abspath(cwd))

    def find_todos(self):
        self.run_bg('findstr /S /I /C:"// TODO" /C:"// FIXME" *.js *.jsx')

    def backup_project(self):
        import datetime
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M")
        self.run_bg(f'robocopy . "_backups/Backup_{ts}" /MIR /XD node_modules .git dist build _backups /XF *.log *.pyc')

    def hard_reset(self):
        if messagebox.askyesno("PELIGRO", "¿Borrar node_modules y reinstalar todo?"):
            self.stop_services()
            cmd = (f'rmdir /s /q "{SERVER_DIR}\\node_modules" & del "{SERVER_DIR}\\package-lock.json" & '
                   f'rmdir /s /q "{CLIENT_DIR}\\node_modules" & del "{CLIENT_DIR}\\package-lock.json" & '
                   f'cd "{SERVER_DIR}" & npm install & cd ..\\"{CLIENT_DIR}" & npm install')
            self.run_bg(cmd)

    def change_repo_url(self):
        url = simpledialog.askstring("Git", "Nueva URL del repositorio:")
        if url: self.run_bg(f"git remote set-url origin {url}")

if __name__ == "__main__":
    root = tk.Tk()
    app = MqerkCommander(root)
    root.mainloop()