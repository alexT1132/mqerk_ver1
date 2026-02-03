import tkinter as tk
from tkinter import ttk, messagebox, simpledialog, scrolledtext
import subprocess
import threading
import os
import socket
import webbrowser
import json

# ================= CONFIGURACIÓN =================
SERVER_DIR = "server"
CLIENT_DIR = "client"
SERVER_PORT = "1002"
CLIENT_PORT = "5173"

# --- PALETA DE COLORES "MATERIAL CYBER" ---
COL_BG = "#121212"        # Fondo Principal (Casi negro)
COL_SURFACE = "#1E1E1E"   # Fondo de Tarjetas/Paneles
COL_ACCENT = "#00E5FF"    # Cyan Eléctrico (Principal)
COL_TEXT = "#E0E0E0"      # Texto Blanco Suave
COL_BTN_BG = "#2C2C2C"    # Botones Normales
COL_BTN_HOVER = "#3A3A3A" # Hover Botones
COL_DANGER = "#CF6679"    # Rojo Suave (Error/Peligro)
COL_SUCCESS = "#03DAC6"   # Verde Teal (Éxito)
COL_WARN = "#FFB74D"      # Naranja (Advertencia)
COL_OFF = "#424242"       # Gris Apagado (Puerto cerrado)

APP_TITLE = "AYUDA COMMANDER v5.0 Ultimate"

def get_npm_command():
    """Devuelve 'npm.cmd' en Windows para evitar errores de política de PowerShell."""
    import platform
    return "npm.cmd" if platform.system() == "Windows" else "npm"

class MqerkCommander:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_TITLE)
        self.root.geometry("950x700") # Ajustado para más espacio vertical
        self.root.configure(bg=COL_BG)
        
        self.local_ip = self.get_local_ip()
        self.is_busy = False
        self.port_status = {SERVER_PORT: False, CLIENT_PORT: False}
        self.indicators = {} # Referencias a los widgets canvas

        self.setup_styles()
        self.create_ui()
        
        # Init Loops
        self.check_git_status()
        self.start_port_monitor() # Iniciar el loop del monitor
        self.log("✨ AYUDA COMMANDER v5.0 Cargado.", "success")

    def get_local_ip(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except: return "127.0.0.1"

    # ================= ESTILOS MODERNOS (FLAT) =================
    def setup_styles(self):
        style = ttk.Style()
        style.theme_use('clam') 

        # Configuración General
        style.configure(".", background=COL_BG, foreground=COL_TEXT, font=("Segoe UI", 9))
        
        # Pestañas
        style.configure("TNotebook", background=COL_BG, borderwidth=0)
        style.configure("TNotebook.Tab", background=COL_BG, foreground="gray", padding=[15, 10], font=("Segoe UI", 10, "bold"), borderwidth=0)
        style.map("TNotebook.Tab", background=[("selected", COL_SURFACE)], foreground=[("selected", COL_ACCENT)])

        # Marcos
        style.configure("Card.TFrame", background=COL_SURFACE, relief="flat")
        
        # LabelFrames
        style.configure("TLabelframe", background=COL_SURFACE, foreground=COL_ACCENT, bordercolor=COL_SURFACE, relief="flat")
        style.configure("TLabelframe.Label", background=COL_SURFACE, foreground=COL_ACCENT, font=("Segoe UI", 9, "bold"))

        # BOTONES
        style.configure("TButton", background=COL_BTN_BG, foreground="white", borderwidth=0, focuscolor=COL_SURFACE, padding=6, font=("Segoe UI", 9))
        style.map("TButton", background=[("active", COL_ACCENT), ("pressed", COL_ACCENT)], foreground=[("active", "black"), ("pressed", "black")])
        
        style.configure("Danger.TButton", background=COL_BTN_BG, foreground=COL_DANGER)
        style.map("Danger.TButton", background=[("active", COL_DANGER)], foreground=[("active", "black")])

        style.configure("Info.TButton", foreground=COL_ACCENT)
        style.map("Info.TButton", background=[("active", COL_ACCENT)], foreground=[("active", "black")])

    # ================= CONSTRUCCIÓN UI =================
    def create_ui(self):
        # 1. HEADER
        header = tk.Frame(self.root, bg=COL_BG, height=40)
        header.pack(fill="x", padx=15, pady=(10, 5))
        
        tk.Label(header, text="AYUDA", font=("Segoe UI", 16, "bold"), fg=COL_ACCENT, bg=COL_BG).pack(side="left")
        tk.Label(header, text="COMMANDER", font=("Segoe UI", 16), fg="gray", bg=COL_BG).pack(side="left", padx=5)
        
        self.lbl_status = tk.Label(header, text="Ready", font=("Segoe UI", 9), fg=COL_SUCCESS, bg=COL_BG)
        self.lbl_status.pack(side="right")
        self.lbl_branch = tk.Label(header, text="...", font=("Consolas", 9), fg="gray", bg=COL_BG)
        self.lbl_branch.pack(side="right", padx=10)

        # 2. TABS
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(expand=True, fill="both", padx=10, pady=5)
        
        self.tab_dash = ttk.Frame(self.notebook, style="Card.TFrame"); self.notebook.add(self.tab_dash, text="DASHBOARD")
        self.tab_git = ttk.Frame(self.notebook, style="Card.TFrame"); self.notebook.add(self.tab_git, text="GIT CONTROL")
        self.tab_tools = ttk.Frame(self.notebook, style="Card.TFrame"); self.notebook.add(self.tab_tools, text="HERRAMIENTAS")
        
        self.build_dashboard()
        self.build_git()
        self.build_tools()

        # 3. CONSOLA
        console_frame = tk.Frame(self.root, bg=COL_BG)
        console_frame.pack(fill="x", side="bottom", padx=10, pady=10)
        
        bar = tk.Frame(console_frame, bg=COL_BG)
        bar.pack(fill="x", pady=(0,2))
        tk.Label(bar, text="TERMINAL OUTPUT", font=("Consolas", 7, "bold"), fg="#555", bg=COL_BG).pack(side="left")
        tk.Button(bar, text="✖ Limpiar", command=self.clear_console, bg=COL_BG, fg="gray", bd=0, font=("Arial", 7), cursor="hand2").pack(side="right")

        self.console = scrolledtext.ScrolledText(console_frame, height=6, bg="#0F0F0F", fg=COL_SUCCESS, font=("Consolas", 9), state='disabled', bd=0, highlightthickness=0)
        self.console.pack(fill="x")
        self.console.tag_config("err", foreground=COL_DANGER)
        self.console.tag_config("cmd", foreground="gray")
        self.console.tag_config("suc", foreground=COL_SUCCESS)

    # ================= DASHBOARD + MONITOR EN VIVO =================
    def build_dashboard(self):
        container = tk.Frame(self.tab_dash, bg=COL_SURFACE)
        container.pack(fill="both", expand=True, padx=20, pady=20)

        # --- MONITOR DE PUERTOS ---
        f_monitor = tk.Frame(container, bg=COL_SURFACE)
        f_monitor.grid(row=0, column=0, columnspan=3, sticky="ew", pady=(0, 20))
        
        tk.Label(f_monitor, text="ESTADO DE PUERTOS (LIVE)", fg="gray", bg=COL_SURFACE, font=("Segoe UI", 8, "bold")).pack(side="left")
        
        # Indicador Server
        self.create_indicator(f_monitor, "SERVER", SERVER_PORT)
        # Separador
        tk.Frame(f_monitor, width=20, bg=COL_SURFACE).pack(side="left")
        # Indicador Client
        self.create_indicator(f_monitor, "CLIENT", CLIENT_PORT)

        # --- SECCION 1: SERVICIOS ---
        lbl = ttk.Label(container, text="CONTROL DE SERVICIOS", foreground=COL_ACCENT, background=COL_SURFACE, font=("Segoe UI", 10, "bold"))
        lbl.grid(row=1, column=0, sticky="w", pady=(0, 10))

        btn_start = ttk.Button(container, text="⚡ INICIAR TODO", command=self.start_services)
        btn_start.grid(row=2, column=0, sticky="ew", padx=2, ipady=5)

        btn_stop = ttk.Button(container, text="🛑 DETENER TODO", command=self.stop_services, style="Danger.TButton")
        btn_stop.grid(row=2, column=1, sticky="ew", padx=2, ipady=5)

        # --- SECCION 2: ACCESOS ---
        lbl2 = ttk.Label(container, text="ACCESOS RÁPIDOS", foreground=COL_ACCENT, background=COL_SURFACE, font=("Segoe UI", 10, "bold"))
        lbl2.grid(row=3, column=0, sticky="w", pady=(20, 10))

        btn_code = ttk.Button(container, text="💻 VS Code", command=lambda: self.run_bg("code ."))
        btn_code.grid(row=4, column=0, sticky="ew", padx=2)
        
        btn_web = ttk.Button(container, text="🌍 Web App", command=lambda: webbrowser.open(f"http://localhost:{CLIENT_PORT}"))
        btn_web.grid(row=4, column=1, sticky="ew", padx=2)
        
        btn_dir = ttk.Button(container, text="📂 Carpeta", command=lambda: os.startfile(os.getcwd()))
        btn_dir.grid(row=4, column=2, sticky="ew", padx=2)

        # --- SECCION 3: MANTENIMIENTO & SEGURIDAD ---
        lbl3 = ttk.Label(container, text="SEGURIDAD & MANTENIMIENTO", foreground=COL_ACCENT, background=COL_SURFACE, font=("Segoe UI", 10, "bold"))
        lbl3.grid(row=5, column=0, sticky="w", pady=(20, 10))

        btn_bak = ttk.Button(container, text="💾 Backup Rápido", command=self.backup_project)
        btn_bak.grid(row=6, column=0, sticky="ew", padx=2)

        # --- BOTÓN AUTO-PROTECT INTEGRADO ---
        btn_sec = ttk.Button(container, text="🛡️ AUTO-PROTECT", command=self.auto_protect_secrets, style="Info.TButton")
        btn_sec.grid(row=6, column=1, sticky="ew", padx=2)

        btn_hard = ttk.Button(container, text="☢️ Hard Reset", command=self.hard_reset, style="Danger.TButton")
        btn_hard.grid(row=6, column=2, sticky="ew", padx=2)

        container.columnconfigure(0, weight=1); container.columnconfigure(1, weight=1); container.columnconfigure(2, weight=1)

    def create_indicator(self, parent, label_text, port):
        # Frame contenedor
        f = tk.Frame(parent, bg=COL_SURFACE)
        f.pack(side="left", padx=10)
        
        # Canvas círculo
        c = tk.Canvas(f, width=14, height=14, bg=COL_SURFACE, highlightthickness=0)
        c.pack(side="left", padx=5)
        circle = c.create_oval(2, 2, 12, 12, fill=COL_OFF, outline="")
        
        lbl = tk.Label(f, text=f"{label_text} :{port}", fg=COL_TEXT, bg=COL_SURFACE, font=("Consolas", 9))
        lbl.pack(side="left")
        
        self.indicators[port] = {"canvas": c, "id": circle}

    # ================= GIT CONTROL + DIFF VIEW =================
    def build_git(self):
        container = tk.Frame(self.tab_git, bg=COL_SURFACE)
        container.pack(fill="both", expand=True, padx=20, pady=20)

        # Fila 1: Acciones Principales
        ttk.Label(container, text="FLUJO DE TRABAJO", background=COL_SURFACE, foreground="gray", font=("Segoe UI", 8)).pack(anchor="w")
        row1 = tk.Frame(container, bg=COL_SURFACE); row1.pack(fill="x", pady=(5, 15))
        
        ttk.Button(row1, text="📤 PUSH CONTROLADO", command=self.git_push_ui).pack(side="left", fill="x", expand=True, padx=2)
        ttk.Button(row1, text="📥 PULL", command=self.git_pull).pack(side="left", fill="x", expand=True, padx=2)
        ttk.Button(row1, text="🔄 STATUS", command=lambda: self.run_git_cmd("status -s")).pack(side="left", fill="x", expand=True, padx=2)

        # Fila 2: Stash
        ttk.Label(container, text="EL BOLSILLO (STASH)", background=COL_SURFACE, foreground="gray", font=("Segoe UI", 8)).pack(anchor="w")
        row2 = tk.Frame(container, bg=COL_SURFACE); row2.pack(fill="x", pady=(5, 15))
        ttk.Button(row2, text="📥 Guardar", command=self.git_stash_save, style="Info.TButton").pack(side="left", fill="x", expand=True, padx=2)
        ttk.Button(row2, text="📤 Sacar (Pop)", command=lambda: self.run_git_cmd("stash pop"), style="Info.TButton").pack(side="left", fill="x", expand=True, padx=2)
        ttk.Button(row2, text="👀 Ver Lista", command=lambda: self.run_git_cmd("stash list"), style="Info.TButton").pack(side="left", fill="x", expand=True, padx=2)

        # Fila 3: Ramas
        ttk.Label(container, text="RAMAS", background=COL_SURFACE, foreground="gray", font=("Segoe UI", 8)).pack(anchor="w")
        row3 = tk.Frame(container, bg=COL_SURFACE); row3.pack(fill="x", pady=(5, 15))
        ttk.Button(row3, text="✨ Nueva", command=self.git_new_branch).pack(side="left", fill="x", expand=True, padx=2)
        ttk.Button(row3, text="🔀 Cambiar", command=self.git_checkout_ui).pack(side="left", fill="x", expand=True, padx=2)
        ttk.Button(row3, text="🗑️ Borrar", command=self.git_delete_ui, style="Danger.TButton").pack(side="left", fill="x", expand=True, padx=2)

        # Fila 4: Funciones Avanzadas de Git
        ttk.Label(container, text="AVANZADO", background=COL_SURFACE, foreground="gray", font=("Segoe UI", 8)).pack(anchor="w", pady=(15,0))
        row4 = tk.Frame(container, bg=COL_SURFACE); row4.pack(fill="x", pady=(5, 15))
        ttk.Button(row4, text="🧹 Limpiar Ramas Fusionadas", command=self.git_clean_merged_branches, style="Info.TButton").pack(side="left", fill="x", expand=True, padx=2)
        ttk.Button(row4, text="📜 Ver Log Compacto", command=self.git_show_compact_log, style="Info.TButton").pack(side="left", fill="x", expand=True, padx=2)

    # ================= HERRAMIENTAS + JSON EDITOR =================
    def build_tools(self):
        container = tk.Frame(self.tab_tools, bg=COL_SURFACE)
        container.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Generadores
        lf = ttk.LabelFrame(container, text="GENERADORES")
        lf.pack(fill="x", pady=5)
        ttk.Button(lf, text="🏗️ Crear Componente React", command=self.create_react_component).pack(fill="x", padx=10, pady=10)

        # NPM
        lf2 = ttk.LabelFrame(container, text="PAQUETES (NPM)")
        lf2.pack(fill="x", pady=10)
        f_npm = tk.Frame(lf2, bg=COL_SURFACE); f_npm.pack(fill="x", padx=10, pady=10)
        self.npm_target = tk.StringVar(value="client")
        tk.Radiobutton(f_npm, text="Client", variable=self.npm_target, value="client", bg=COL_SURFACE, fg="white", selectcolor=COL_BG, activebackground=COL_SURFACE, activeforeground=COL_ACCENT).pack(side="left", padx=10)
        tk.Radiobutton(f_npm, text="Server", variable=self.npm_target, value="server", bg=COL_SURFACE, fg="white", selectcolor=COL_BG, activebackground=COL_SURFACE, activeforeground=COL_ACCENT).pack(side="left", padx=10)
        ttk.Button(f_npm, text="📦 Instalar", command=self.npm_install).pack(side="right")

        # Configuración & Editores
        lf3 = ttk.LabelFrame(container, text="CONFIGURACIÓN & ARCHIVOS")
        lf3.pack(fill="x", pady=10)
        
        f_conf = tk.Frame(lf3, bg=COL_SURFACE)
        f_conf.pack(fill="x", padx=5, pady=5)

        # Fila .env
        ttk.Button(f_conf, text="🔐 .env Server", command=lambda: self.edit_file_ui("server", ".env")).grid(row=0, column=0, sticky="ew", padx=2, pady=2)
        ttk.Button(f_conf, text="🔐 .env Client", command=lambda: self.edit_file_ui("client", ".env")).grid(row=0, column=1, sticky="ew", padx=2, pady=2)
        
        # Fila package.json
        ttk.Button(f_conf, text="📋 JSON Server", command=lambda: self.edit_file_ui("server", "package.json")).grid(row=1, column=0, sticky="ew", padx=2, pady=2)
        ttk.Button(f_conf, text="📋 JSON Client", command=lambda: self.edit_file_ui("client", "package.json")).grid(row=1, column=1, sticky="ew", padx=2, pady=2)
        
        f_conf.columnconfigure(0, weight=1); f_conf.columnconfigure(1, weight=1)

        # Comandos Personalizados
        lf4 = ttk.LabelFrame(container, text="EJECUTAR COMANDOS DE TERMINAL (CLI)")
        lf4.pack(fill="x", pady=10)
        
        f_custom_cmd = tk.Frame(lf4, bg=COL_SURFACE)
        f_custom_cmd.pack(fill="x", padx=10, pady=10)
        
        self.e_custom_cmd = tk.Entry(f_custom_cmd, bg="#333", fg="white", font=("Segoe UI", 9))
        self.e_custom_cmd.pack(side="left", fill="x", expand=True, padx=(0, 5))
        
        ttk.Button(f_custom_cmd, text="▶️ Ejecutar", command=self.run_custom_command).pack(side="right")
        
        tk.Label(lf4, text="Ejemplos: git status, npm test, python script.py, ls -la", fg="gray", bg=COL_SURFACE, font=("Segoe UI", 8)).pack(anchor="w", padx=10, pady=(0,5))

    # ================= LOGICA CORE =================
    def start_port_monitor(self):
        """Monitor de puertos en hilo secundario no bloqueante con socket"""
        def check():
            for port in [SERVER_PORT, CLIENT_PORT]:
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(0.5) # Timeout rápido para no congelar
                    result = sock.connect_ex(('127.0.0.1', int(port)))
                    is_open = (result == 0)
                    sock.close()
                    
                    final_col = COL_SUCCESS if is_open else COL_OFF
                    self.indicators[port]["canvas"].itemconfig(self.indicators[port]["id"], fill=final_col)
                except:
                    pass
            
            self.root.after(5000, check)
        
        self.root.after(1000, check)

    def clear_console(self):
        self.console.config(state='normal')
        self.console.delete(1.0, tk.END)
        self.console.config(state='disabled')

    def log(self, msg, type="norm"):
        self.console.config(state='normal')
        if type == "cmd": self.console.insert(tk.END, f"> {msg}\n", "cmd")
        elif type == "error": self.console.insert(tk.END, f"❌ {msg}\n", "err")
        elif type == "success": self.console.insert(tk.END, f"✅ {msg}\n", "suc")
        else: self.console.insert(tk.END, f"{msg}\n")
        self.console.see(tk.END)
        self.console.config(state='disabled')
        self.root.update_idletasks()

    def set_busy(self, busy):
        self.is_busy = busy
        if busy:
            self.lbl_status.config(text="BUSY...", fg=COL_WARN)
            self.root.config(cursor="watch")
        else:
            self.lbl_status.config(text="READY", fg=COL_SUCCESS)
            self.root.config(cursor="")

    def run_bg(self, cmd, cwd=None):
        def task():
            self.set_busy(True)
            self.log(cmd, "cmd")
            try:
                p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=cwd, text=True, encoding='utf-8', errors='replace')
                out, err = p.communicate()
                if out: self.log(out.strip())
                if err:
                    # Detectar error de política de PowerShell (español/inglés)
                    if "ejecución de scripts está deshabilitada" in err.lower() or "execution of scripts is disabled" in err.lower():
                        self.log("❌ ERROR: PowerShell bloquea la ejecución de scripts", "error")
                        self.log("💡 Solución: Usa 'npm.cmd' en lugar de 'npm'", "error")
                        self.log("   O ejecuta en PowerShell como Admin:", "error")
                        self.log("   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser", "error")
                    elif "git push" in cmd.lower() and ("authentication failed" in err.lower() or "credenciales" in err.lower() or "fatal: unable to access" in err.lower() or "remote: Invalid username or password" in err.lower()):
                        self.log("❌ ERROR DE AUTENTICACIÓN GIT:", "error")
                        self.log("   Parece que tus credenciales de Git no son válidas o han expirado.", "error")
                        self.log("   Asegúrate de que tu token de acceso personal (PAT) o contraseña sean correctos.", "error")
                        self.log("   Puedes intentar actualizar tus credenciales con 'git credential reject' o 'git config --global credential.helper store'.", "error")
                        self.log(f"   Mensaje original de Git: {err.strip()}", "error")
                    elif "npm WARN" not in err:
                        self.log(err.strip(), "error")
                if "git" in cmd: self.root.after(500, self.check_git_status)
            except Exception as e:
                self.log(f"Excepción: {str(e)}", "error")
            finally:
                self.root.after(0, lambda: self.set_busy(False))
        threading.Thread(target=task, daemon=True).start()

    def run_git_cmd(self, args): self.run_bg(f"git {args}")

    def check_git_status(self):
        def _c():
            try:
                b = subprocess.check_output("git rev-parse --abbrev-ref HEAD", shell=True).decode().strip()
                self.lbl_branch.config(text=f"🌿 {b}")
            except: self.lbl_branch.config(text="No Git")
        threading.Thread(target=_c, daemon=True).start()

    # --- ACCIONES ---
    def start_services(self):
        npm_cmd = get_npm_command()  # <-- AGREGAR ESTA LÍNEA
        if os.path.exists(SERVER_DIR):
            os.system(f'start "SERVER" /D "{os.path.abspath(SERVER_DIR)}" cmd /k {npm_cmd} run dev -- --host')
        if os.path.exists(CLIENT_DIR):
            os.system(f'start "CLIENT" /D "{os.path.abspath(CLIENT_DIR)}" cmd /k {npm_cmd} run dev -- --host')
        self.log("Terminales lanzadas.", "success")

    def stop_services(self):
        cmds = [
            f'for /f "tokens=5" %a in (\'netstat -ano ^| findstr :{SERVER_PORT} ^| findstr LISTENING\') do taskkill /F /PID %a',
            f'for /f "tokens=5" %a in (\'netstat -ano ^| findstr :{CLIENT_PORT} ^| findstr LISTENING\') do taskkill /F /PID %a',
            "taskkill /F /IM node.exe"
        ]
        for c in cmds: self.run_bg(c)

    # GIT PUSH UI (MEJORADO CON DIFF)
    def git_push_ui(self):
        try:
            curr = subprocess.check_output("git rev-parse --abbrev-ref HEAD", shell=True).decode().strip()
            rem_url = subprocess.check_output("git remote", shell=True).decode().strip().splitlines()[0]
            # OBTENER DIFF STAT
            diff_stat = subprocess.check_output("git diff --stat", shell=True).decode().strip()
            if not diff_stat: diff_stat = "No hay cambios sin stagear (o todo está commited)."
        except: return messagebox.showerror("Error", "No git repo")

        top = tk.Toplevel(self.root)
        top.title("Preparar y Enviar Cambios (Git Push)"); top.geometry("500x500"); top.configure(bg=COL_BG)
        
        # Info Header
        tk.Label(top, text=f"Rama Actual: {curr}", fg=COL_ACCENT, bg=COL_BG, font=("Segoe UI", 10, "bold")).pack(pady=5)
        
        # VISUALIZADOR DE DIFF
        tk.Label(top, text="Archivos Modificados (Diff Stat):", fg="gray", bg=COL_BG, anchor="w").pack(fill="x", padx=20)
        f_diff = tk.Frame(top, bg="#222")
        f_diff.pack(fill="both", expand=True, padx=20, pady=5)
        txt_diff = scrolledtext.ScrolledText(f_diff, height=8, bg="#111", fg=COL_WARN, font=("Consolas", 8), bd=0)
        txt_diff.pack(fill="both", expand=True)
        txt_diff.insert(tk.END, diff_stat)
        txt_diff.config(state='disabled')

        # Formulario
        tk.Label(top, text="Mensaje del Commit:", fg="white", bg=COL_BG).pack(anchor="w", padx=20, pady=(10,0))
        e_msg = tk.Entry(top, bg="#333", fg="white", font=("Segoe UI", 9)); e_msg.pack(fill="x", padx=20, pady=5)
        e_msg.focus()

        # Remote Check
        remotes = [curr]
        try:
            raw = subprocess.check_output("git branch -r", shell=True).decode().splitlines()
            for r in raw: 
                c = r.strip().split("/")[-1]
                if "->" not in r and c not in remotes: remotes.append(c)
        except: pass
        
        f_rem = tk.Frame(top, bg=COL_BG)
        f_rem.pack(fill="x", padx=20, pady=5)
        tk.Label(f_rem, text="Destino:", fg="gray", bg=COL_BG).pack(side="left")
        c_tgt = ttk.Combobox(f_rem, values=remotes, width=20); c_tgt.pack(side="left", padx=10); c_tgt.current(0)

        def go():
            msg = e_msg.get().strip(); tgt = c_tgt.get()
            if not msg: return messagebox.showwarning("!", "El mensaje del commit no puede estar vacío.")
            if tgt in ['master','main'] and curr not in ['master','main']:
                if not messagebox.askyesno("Wait", f"Vas a subir a {tgt}. Seguro?"): return
            top.destroy()
            self.run_bg(f'git add . && git commit -m "{msg}" && git push -u {rem_url} {curr}:{tgt}')

        ttk.Button(top, text="🚀 ENVIAR CAMBIOS", command=go).pack(pady=15, fill="x", padx=50)

    # GIT UTILS
    def git_stash_save(self):
        m = simpledialog.askstring("Stash", "Nombre (opcional):")
        if m is None: return # El usuario canceló
        if m: self.run_bg(f'git stash save "{m}"')
        else: self.run_bg('git stash')

    def git_pull(self): self.run_bg("git pull")
    
    def git_new_branch(self):
        n = simpledialog.askstring("Nueva", "Nombre de la nueva rama:")
        if n is None: return # El usuario canceló
        if not n.strip():
            messagebox.showwarning("Entrada inválida", "El nombre de la rama no puede estar vacío.")
            return
        self.run_bg(f"git checkout -b {n.strip()}")

    def git_checkout_ui(self):
        try:
            raw = subprocess.check_output("git branch -a", shell=True).decode().splitlines()
            brs = [b.strip().replace("* ", "") for b in raw if "->" not in b]
        except: brs = []
        top = tk.Toplevel(self.root); top.title("Cambiar"); top.geometry("300x120"); top.configure(bg=COL_BG)
        cb = ttk.Combobox(top, values=brs, width=30); cb.pack(pady=20)
        def go():
            v = cb.get()
            if not v: return
            
            # Verificar si hay cambios sin guardar
            try:
                status_output = subprocess.check_output("git status --porcelain", shell=True).decode().strip()
                if status_output:
                    if not messagebox.askyesno("Advertencia", "Tienes cambios sin guardar. ¿Deseas continuar y perderlos?"):
                        return
            except Exception as e:
                self.log(f"Error al verificar el estado de Git: {e}", "error")
                return

            top.destroy()
            if "remotes/" in v:
                c = v.split("/")[-1]; r = v.replace("remotes/","")
                self.run_bg(f'git checkout {c} 2>nul || git checkout -b {c} --track {r}')
            else: self.run_bg(f"git checkout {v}")
        ttk.Button(top, text="IR", command=go).pack()

    def git_delete_ui(self):
        top = tk.Toplevel(self.root); top.title("Borrar"); top.geometry("350x200"); top.configure(bg=COL_BG)
        def show(mode):
            is_r = (mode=="REMOTE")
            if is_r: subprocess.run("git fetch -p", shell=True)
            cmd = "git branch -r" if is_r else "git branch"
            try: raw = subprocess.check_output(cmd, shell=True).decode().splitlines()
            except: return
            brs = [b.strip().replace("* ","") for b in raw if "->" not in b]
            w = tk.Toplevel(top); w.configure(bg=COL_BG)
            cb = ttk.Combobox(w, values=brs); cb.pack(pady=10)
            def do():
                t = cb.get()
                if not t: return
                if is_r:
                    if not messagebox.askyesno("⚠️", f"Borrar {t} de la NUBE?"): return
                    w.destroy(); top.destroy()
                    if "/" in t: p=t.split("/",1); self.run_bg(f"git push {p[0]} --delete {p[1]}")
                    else: self.run_bg(f"git push origin --delete {t}")
                else:
                    self.run_bg(f"git branch -D {t}"); w.destroy(); top.destroy()
            ttk.Button(w, text="BORRAR", command=do, style="Danger.TButton").pack(pady=10)
        ttk.Button(top, text="Local", command=lambda: show("LOCAL")).pack(pady=10, fill="x", padx=50)
        ttk.Button(top, text="Remota", command=lambda: show("REMOTE"), style="Danger.TButton").pack(pady=10, fill="x", padx=50)

    def git_clean_merged_branches(self):
        if not messagebox.askyesno("Confirmar Limpieza", "¿Estás seguro de que quieres eliminar todas las ramas locales fusionadas con la rama actual (main/master)?"):
            return
        self.run_bg("git branch --merged | egrep -v '(^\\*|main|master)' | xargs git branch -d")
        self.log("Limpieza de ramas fusionadas iniciada.", "success")

    def git_show_compact_log(self):
        self.run_bg("git log --oneline --graph --decorate --all")

    # TOOLS
    def create_react_component(self):
        n = simpledialog.askstring("React", "Nombre del componente (ej. MyComponent):")
        if n is None: return # El usuario canceló
        n = n.strip()
        if not n:
            messagebox.showwarning("Entrada inválida", "El nombre del componente no puede estar vacío.")
            return
        if not n[0].isupper():
            messagebox.showwarning("Convención de Nomenclatura", "Los nombres de los componentes React deben comenzar con una letra mayúscula.")
            return
        
        p = os.path.join(CLIENT_DIR, "src/components", n)
        try:
            os.makedirs(p, exist_ok=True) # Usar exist_ok=True para evitar error si la carpeta ya existe
            jsx_path = os.path.join(p, f"{n}.jsx")
            css_path = os.path.join(p, f"{n}.css")

            with open(jsx_path,"w", encoding="utf-8") as f: 
                f.write(f"import React from 'react'\nimport './{n}.css'\n\nconst {n} = () => {{\n  return (\n    <div className=\"{n.lower()}-container\">\n      <h1>{n} Component</h1>\n    </div>\n  )\n}}\n\nexport default {n}\n")
            with open(css_path,"w", encoding="utf-8") as f: 
                f.write(f".{n.lower()}-container {{\n  /* Estilos para {n} */\n}}\n")
            
            self.log(f"Componente {n} creado en {p}.", "success")
        except Exception as e:
            self.log(f"Error creando componente {n}: {e}", "error")

    def npm_install(self):
        pkg = simpledialog.askstring("NPM", "Nombre del paquete a instalar:")
        if pkg is None: return # El usuario canceló
        if not pkg.strip():
            messagebox.showwarning("Entrada inválida", "El nombre del paquete no puede estar vacío.")
            return
        npm_cmd = get_npm_command()
        t = self.npm_target.get()
        cwd = SERVER_DIR if t == "server" else CLIENT_DIR
        self.run_bg(f"{npm_cmd} install {pkg.strip()}", cwd=os.path.abspath(cwd))

    # EDITORES UNIVERSALES (.env y package.json)
    def edit_file_ui(self, target, filename):
        p = os.path.join(SERVER_DIR if target=="server" else CLIENT_DIR, filename)
        if not os.path.exists(p): 
            if filename == ".env": open(p, "w").close() # Crear si no existe solo si es .env
            else: return messagebox.showerror("Error", f"{filename} no encontrado")

        with open(p,"r", encoding="utf-8") as f: c=f.read()
        
        w = tk.Toplevel(self.root); w.title(f"Editando: {target}/{filename}"); w.geometry("600x400"); w.configure(bg=COL_BG)
        txt = scrolledtext.ScrolledText(w, bg="#222", fg="white", insertbackground="white", font=("Consolas", 10))
        txt.pack(fill="both", expand=True)
        txt.insert(tk.END, c)
        
        def save():
            new_content = txt.get("1.0", tk.END).strip()
            # Validación simple de JSON si es package.json
            if filename.endswith(".json"):
                try: json.loads(new_content)
                except json.JSONDecodeError as e: return messagebox.showerror("Error JSON", f"Sintaxis inválida:\n{e}")

            with open(p,"w", encoding="utf-8") as f: f.write(new_content)
            w.destroy(); self.log(f"{filename} en {target} actualizado.", "success")
            
        ttk.Button(w, text="GUARDAR CAMBIOS", command=save).pack(fill="x")

    def run_custom_command(self):
        cmd = self.e_custom_cmd.get().strip()
        if not cmd:
            messagebox.showwarning("Entrada inválida", "El comando no puede estar vacío.")
            return
        self.run_bg(cmd)
        self.e_custom_cmd.delete(0, tk.END) # Limpiar la entrada después de ejecutar

    def backup_project(self):
        import datetime; ts = datetime.datetime.now().strftime("%Y%m%d_%H%M")
        self.run_bg(f'robocopy . "_backups/Backup_{ts}" /MIR /XD node_modules .git dist build _backups /XF *.log *.pyc')

    def hard_reset(self):
        if messagebox.askyesno("⚠️", "Borrar node_modules?"):
            self.stop_services()
            npm_cmd = get_npm_command()  # <-- AGREGAR ESTA LÍNEA
            self.run_bg(
                f'rmdir /s /q "{SERVER_DIR}\\node_modules" 2>nul & del "{SERVER_DIR}\\package-lock.json" 2>nul & '
                f'rmdir /s /q "{CLIENT_DIR}\\node_modules" 2>nul & del "{CLIENT_DIR}\\package-lock.json" 2>nul & '
                f'cd "{SERVER_DIR}" & {npm_cmd} install & cd ..\\"{CLIENT_DIR}" & {npm_cmd} install'
            )

    # ================= PROTOCOLOS DE SEGURIDAD (AUTO-PROTECT) =================
 # ================= PROTOCOLOS DE SEGURIDAD (NO DESTRUCTIVO) =================
    def auto_protect_secrets(self):
        """
        1. Crea copias .example.json (censuradas) para subir a Git.
        2. Agrega los archivos REALES al .gitignore.
        3. Saca los archivos REALES del radar de Git (sin borrarlos del disco).
        """
        self.set_busy(True)
        self.log("🛡️ Iniciando Protección Inteligente (Modo Seguro)...", "cmd")
        
        # Archivos que contienen secretos y queremos proteger
        targets = [
            {"path": "client/src/components/tools/nexus_config.json", "type": "json"},
            {"path": "client/src/components/tools/nexus_settings.json", "type": "json"},
            {"path": "server/.env", "type": "env"},
            {"path": "client/.env", "type": "env"}
        ]

        protected_count = 0

        for t in targets:
            full_path = os.path.abspath(t["path"])
            
            if os.path.exists(full_path):
                self.log(f"🔒 Asegurando: {t['path']}")
                
                # PASO 1: Generar el archivo .example (Copia segura)
                # OJO: Esto NO modifica tu archivo original, solo crea uno nuevo al lado.
                if t["type"] == "json":
                    self.create_safe_json_example(full_path)
                elif t["type"] == "env":
                    self.create_safe_env_example(full_path)
                
                # PASO 2: Decirle a Git que ignore el archivo REAL
                self.append_to_gitignore(t["path"])

                # PASO 3: Sacar el archivo real del index de Git (¡CRUCIAL!)
                # "git rm --cached" borra el archivo de Git pero LO DEJA en tu disco.
                # El "|| ver>nul" evita errores si el archivo no estaba trackeado antes.
                self.run_bg(f"git rm --cached {t['path']} || ver>nul")
                
                protected_count += 1
            
        # Mensaje final
        self.root.after(1500, lambda: self.log(f"✅ {protected_count} archivos protegidos. Tu entorno local sigue funcionando.", "success"))
        self.root.after(1500, lambda: messagebox.showinfo("Auto-Protect", "🛡️ ¡Protección Lista!\n\n1. Tus claves REALES siguen en tu carpeta (tu app funciona).\n2. Git ahora ignorará esos archivos.\n3. Se crearon archivos '.example' seguros.\n\nAHORA: Haz un nuevo Commit y Push."))
        self.set_busy(False)

    def create_safe_json_example(self, filepath):
        """Lee el original, censura datos en memoria y guarda COPIA .example"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Limpieza recursiva (solo en memoria)
            def clean_dict(d):
                for k, v in d.items():
                    if isinstance(v, dict):
                        clean_dict(v)
                    elif isinstance(v, str) and len(v) > 0:
                        # Si detecta palabras clave de seguridad, reemplaza el valor
                        if any(x in k.lower() for x in ['key', 'secret', 'token', 'pass', 'id']):
                            d[k] = "YOUR_SECRET_HERE"
            
            clean_dict(data)
            
            # Guardar SOLO en el archivo .example (NO en el original)
            example_path = filepath.replace('.json', '.example.json')
            with open(example_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            self.log(f"   -> Creado/Actualizado: {os.path.basename(example_path)}")
        except Exception as e:
            self.log(f"Error JSON {filepath}: {e}", "error")

    def create_safe_env_example(self, filepath):
        """Lee el .env original y crea un .env.example censurado"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            safe_lines = []
            for line in lines:
                if '=' in line and not line.strip().startswith('#'):
                    key, val = line.split('=', 1)
                    safe_lines.append(f"{key}=YOUR_VALUE_HERE\n")
                else:
                    safe_lines.append(line)
            
            example_path = filepath + ".example"
            with open(example_path, 'w', encoding='utf-8') as f:
                f.writelines(safe_lines)
            self.log(f"   -> Creado/Actualizado: {os.path.basename(example_path)}")
        except Exception as e:
            self.log(f"Error ENV {filepath}: {e}", "error")

    def append_to_gitignore(self, relative_path):
        """Agrega el archivo real al .gitignore para que Git no lo vuelva a ver"""
        git_ignore_path = ".gitignore"
        entry = relative_path.replace("\\", "/") # Formato unix para git
        
        # Crear si no existe
        if not os.path.exists(git_ignore_path):
            with open(git_ignore_path, "w") as f: f.write("")
            
        with open(git_ignore_path, "r") as f:
            content = f.read()
            
        # Solo agregar si no está ya
        if entry not in content:
            with open(git_ignore_path, "a") as f:
                f.write(f"\n{entry}")
            self.log(f"   -> Ocultado en .gitignore: {entry}")
            
if __name__ == "__main__":
    root = tk.Tk()
    app = MqerkCommander(root)
    root.mainloop()
