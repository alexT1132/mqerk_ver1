#!/usr/bin/env python3
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, font as tkfont
import threading
import requests
import json
import os
import socket
import webbrowser
import base64
from cryptography.fernet import Fernet

# ==================== CONFIGURACIÓN DE ESTILO ====================
CONFIG_FILE = os.path.join(os.path.dirname(__file__), "nexus_settings.json")
# Clave para encriptar la API key (generada una vez y guardada en archivo separado)
KEY_FILE = os.path.join(os.path.dirname(__file__), "nexus_key.key")

THEME = {
    "bg_dark": "#16161e",
    "bg_main": "#1a1b26",
    "bg_highlight": "#24283b",
    "fg_main": "#c0caf5",
    "accent": "#7aa2f7",
    "success": "#9ece6a",
    "warning": "#e0af68",
    "danger": "#f7768e",
    "purple": "#bb9af7",
    "comment": "#565f89",
}

def _load_key():
    """Carga o genera la clave de Fernet para encriptar la API key."""
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "rb") as f:
            return f.read()
    key = Fernet.generate_key()
    with open(KEY_FILE, "wb") as f:
        f.write(key)
    return key

FERNET = Fernet(_load_key())

def load_settings():
    """Carga la configuración desde el archivo de configuración.
    Prioriza la variable de entorno GROQ_API_KEY; si está presente, la cifra y la guarda.
    """
    defaults = {"api_key": "", "model": "llama-3.3-70b-versatile"}
    # Prioridad a variable de entorno
    env_key = os.getenv("GROQ_API_KEY")
    if env_key:
        # Encripta y guarda en config para persistencia
        encrypted = FERNET.encrypt(env_key.encode()).decode()
        defaults["api_key"] = encrypted
        save_settings(defaults)
        return defaults
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                data = json.load(f)
            # Desencripta si es necesario
            if data.get("api_key") and not data["api_key"].startswith("sk_"):
                try:
                    decrypted = FERNET.decrypt(data["api_key"].encode()).decode()
                    data["api_key"] = decrypted
                except Exception:
                    pass  # Si falla, deja como está
            return {**defaults, **data}
        except Exception as e:
            print(f"Error al cargar la configuración: {e}")
            return defaults
    return defaults

def save_settings(settings):
    """Guarda la configuración en el archivo de configuración.
    La API key se almacena cifrada.
    """
    to_save = settings.copy()
    if to_save.get("api_key"):
        # Cifrar antes de guardar
        to_save["api_key"] = FERNET.encrypt(to_save["api_key"].encode()).decode()
    with open(CONFIG_FILE, "w") as f:
        json.dump(to_save, f, indent=4)

# ==================== CLASE PRINCIPAL ====================
class NexusJuniorAgent:
    def __init__(self, root):
        self.root = root
        self.settings = load_settings()
        self.root.title("NEXUS AGENT • JUNIOR FULL STACK")
        self.root.geometry("1200x850")
        self.root.configure(bg=THEME["bg_main"])
        self.setup_fonts()
        self.setup_ui()
        self.check_initial_state()

    def setup_fonts(self):
        """Configuración robusta de fuentes para evitar TclError."""
        available = tkfont.families()
        mono_family = next((f for f in ["Fira Code", "Consolas", "Courier New"] if f in available), "monospace")
        self.font_mono = (mono_family, 11)
        ui_family = next((f for f in ["Segoe UI", "Arial", "Ubuntu"] if f in available), "sans-serif")
        self.font_ui = (ui_family, 10)

    def setup_ui(self):
        # --- HEADER ---
        self.nav = tk.Frame(self.root, bg=THEME["bg_dark"], height=60)
        self.nav.pack(fill="x", side="top")
        self.nav.pack_propagate(False)
        tk.Label(self.nav, text="NEXUS JUNIOR", font=("Orbitron", 14, "bold"), bg=THEME["bg_dark"], fg=THEME["success"]).pack(side="left", padx=20)
        self.status_lab = tk.Label(self.nav, text="● LISTO PARA APRENDER", font=(self.font_ui[0], 9), bg=THEME["bg_dark"], fg=THEME["comment"])
        self.status_lab.pack(side="left", padx=10)
        tk.Button(self.nav, text="⚙ CONFIG", bg=THEME["bg_dark"], fg=THEME["comment"], bd=0, command=self.open_settings, cursor="hand2").pack(side="right", padx=20)
        # --- BODY ---
        self.body = tk.Frame(self.root, bg=THEME["bg_main"])
        self.body.pack(fill="both", expand=True, padx=20, pady=20)
        # Sidebar (Selección de enfoque)
        self.sidebar = tk.Frame(self.body, bg=THEME["bg_dark"], width=200)
        self.sidebar.pack(side="left", fill="y", padx=(0, 20))
        self.sidebar.pack_propagate(False)
        tk.Label(self.sidebar, text="MODO JUNIOR", font=(self.font_ui[0], 8, "bold"), bg=THEME["bg_dark"], fg=THEME["comment"]).pack(pady=(20, 10))
        self.mode_var = tk.StringVar(value="JuniorDev")
        modes = [
            ("🐣 Junior FullStack", "JuniorDev"),
            ("🧘 Filtro Anti-Crítica", "ZenMode"),
            ("📝 Documentar", "Docs"),
        ]
        for txt, val in modes:
            tk.Radiobutton(
                self.sidebar,
                text=txt,
                variable=self.mode_var,
                value=val,
                bg=THEME["bg_dark"],
                fg=THEME["fg_main"],
                selectcolor=THEME["bg_highlight"],
                activebackground=THEME["bg_dark"],
                font=self.font_ui,
                indicatoron=0,
                bd=0,
                pady=10,
                anchor="w",
                padx=15,
            ).pack(fill="x")
        # --- ÁREA CENTRAL ---
        self.main_area = tk.Frame(self.body, bg=THEME["bg_main"])
        self.main_area.pack(side="right", fill="both", expand=True)
        # Input
        tk.Label(
            self.main_area,
            text="¿QUÉ VAMOS A PROGRAMAR HOY?",
            font=self.font_ui,
            bg=THEME["bg_main"],
            fg=THEME["accent"],
        ).pack(anchor="w")
        self.input_box = scrolledtext.ScrolledText(
            self.main_area,
            bg=THEME["bg_highlight"],
            fg=THEME["fg_main"],
            font=self.font_mono,
            insertbackground=THEME["accent"],
            bd=0,
            padx=10,
            pady=10,
            height=10,
        )
        self.input_box.pack(fill="both", expand=True, pady=(5, 15))
        # Botón de acción
        self.btn_run = tk.Button(
            self.main_area,
            text="PEDIR AYUDA AL JUNIOR",
            bg=THEME["success"],
            fg=THEME["bg_dark"],
            font=(self.font_ui[0], 10, "bold"),
            bd=0,
            pady=12,
            command=self.start_task,
            cursor="hand2",
        )
        self.btn_run.pack(fill="x", pady=(0, 15))
        # Output
        self.output_box = scrolledtext.ScrolledText(
            self.main_area,
            bg=THEME["bg_dark"],
            fg=THEME["success"],
            font=self.font_mono,
            bd=0,
            padx=10,
            pady=10,
            height=15,
        )
        self.output_box.pack(fill="both", expand=True)
        self.output_box.config(state="disabled")

    # ==================== LÓGICA DE PROCESAMIENTO ====================
    def start_task(self):
        if not self.settings["api_key"]:
            messagebox.showwarning("Configuración", "Por favor, añade tu Groq API Key.")
            return
        user_text = self.input_box.get("1.0", tk.END).strip()
        if not user_text:
            messagebox.showwarning("Entrada", "Escribe algo antes de solicitar ayuda.")
            return
        self.btn_run.config(state="disabled", text="TRABAJANDO EN ELLO...")
        self.status_lab.config(text="● EL JUNIOR ESTÁ ESCRIBIENDO...", fg=THEME["purple"])
        self.output_box.config(state="normal")
        self.output_box.delete("1.0", tk.END)
        self.output_box.config(state="disabled")
        threading.Thread(target=self.run_ai_logic, args=(user_text,), daemon=True).start()

    def run_ai_logic(self, text):
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.settings['api_key']}", "Content-Type": "application/json"}
        # Definición del personaje según modo
        if self.mode_var.get() == "JuniorDev":
            system_msg = (
                "Eres un Programador Junior Full Stack entusiasta y humilde. "
                "Tu código debe ser limpio, seguir estándares (como PEP8) y estar MUY BIEN COMENTADO. "
                "Explica cada parte del código como si estuvieras aprendiendo junto al usuario. "
                "Si el usuario parece frustrado o menciona a alguien (como Judith), responde con empatía, "
                "enfócate en el código y no critiques a nadie. Mantén un tono profesional y optimista."
            )
        elif self.mode_var.get() == "ZenMode":
            system_msg = (
                "Eres un mediador de paz y experto en estoicismo aplicado al desarrollo. "
                "Si el usuario escribe algo negativo o críticas personales, tu tarea es transformar ese "
                "sentimiento en un requerimiento técnico profesional y neutro. Ayúdalo a no perder la calma."
            )
        else:
            system_msg = "Eres un redactor de documentación técnica claro y conciso."
        payload = {
            "model": self.settings["model"],
            "messages": [{"role": "system", "content": system_msg}, {"role": "user", "content": text}],
            "stream": True,
            "temperature": 0.6,
        }
        try:
            response = requests.post(url, headers=headers, json=payload, stream=True, timeout=30)
            if not response.ok:
                err_msg = f"Error HTTP {response.status_code}: {response.text}"
                self.root.after(0, self.update_output, f"\n❌ {err_msg}\n")
                return
            for line in response.iter_lines():
                if line:
                    decoded = line.decode("utf-8").removeprefix("data: ")
                    if decoded == "[DONE]":
                        break
                    try:
                        data = json.loads(decoded)
                        content = data["choices"][0]["delta"].get("content", "")
                        self.root.after(0, self.update_output, content)
                    except Exception as e:
                        self.root.after(0, self.update_output, f"\n❌ Error al procesar la respuesta: {str(e)}\n")
        except Exception as e:
            self.root.after(0, self.update_output, f"\n❌ Error de conexión: {str(e)}\n")
        finally:
            self.root.after(0, self.reset_ui)

    def update_output(self, text):
        self.output_box.config(state="normal")
        self.output_box.insert(tk.END, text)
        self.output_box.see(tk.END)
        self.output_box.config(state="disabled")

    def reset_ui(self):
        self.btn_run.config(state="normal", text="PEDIR AYUDA AL JUNIOR")
        self.status_lab.config(text="● LISTO PARA APRENDER", fg=THEME["comment"])

    def open_settings(self):
        win = tk.Toplevel(self.root)
        win.title("Ajustes")
        win.geometry("400x250")
        win.configure(bg=THEME["bg_dark"])
        tk.Label(win, text="API KEY DE GROQ", bg=THEME["bg_dark"], fg=THEME["accent"]).pack(pady=10)
        e = ttk.Entry(win, width=40)
        # Mostrar la clave desencriptada si está guardada
        current_key = self.settings.get("api_key", "")
        e.insert(0, current_key)
        e.pack(pady=5)
        def save():
            self.settings["api_key"] = e.get().strip()
            save_settings(self.settings)
            win.destroy()
        tk.Button(win, text="GUARDAR", command=save, bg=THEME["success"], bd=0, pady=8, padx=20).pack(pady=20)

    def check_initial_state(self):
        if not self.settings["api_key"]:
            self.status_lab.config(text="● CONFIGURA LA API KEY", fg=THEME["warning"])

if __name__ == "__main__":
    root = tk.Tk()
    style = ttk.Style()
    style.theme_use('clam')
    app = NexusJuniorAgent(root)
    root.mainloop()
