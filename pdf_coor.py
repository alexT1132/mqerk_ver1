import fitz  # PyMuPDF
import os
import tkinter as tk
from tkinter import filedialog, simpledialog, messagebox
from tkinter import colorchooser
from tkinter import font as tkfont
from PIL import Image, ImageTk
from typing import Any, Optional

# --- Variables globales ---
doc = None
page = None
scale = 2.0  # Factor de escala para más calidad al mostrar
MIN_SCALE = 0.5
MAX_SCALE = 5.0
start_x, start_y = 0, 0
rect_coords = None
rect_id = None
selection_dragging = False
pdf_path = None
img = None
tk_img = None
current_page_index = 0
page_label_var = None
overlay_id = None
overlay_text_var = None
overlay_font_var = None  # PDF fontsize in pt
overlay_pdf_pos = None  # (x_pt, y_pt)
overlay_dragging = False
overlay_drag_offset = (0, 0)
overlay_color_var = None  # hex color string
overlay_bg_enabled_var = None
overlay_bg_color_var = None
overlay_bg_id = None
overlay_font_family_var = None
align_h_var = None  # 'left'|'center'|'right'
align_v_var = None  # 'top'|'middle'|'bottom'
mode_var = None  # 'move' | 'coords'
auto_copy_coords_var = None
last_coords_var = None
click_marker_tag = 'click_marker'
auto_copy_rect_var = None
show_rect_dialog_var = None
rect_label_var = None


def _get_pixmap(page_obj, scale_val) -> Any:
    """Compatibilidad entre PyMuPDF 1.19+ (get_pixmap) y versiones antiguas (getPixmap)."""
    mat = fitz.Matrix(scale_val, scale_val)
    get_pm = getattr(page_obj, "get_pixmap", None)
    if callable(get_pm):
        return get_pm(matrix=mat)  # type: ignore[attr-defined]
    # Fallback antiguo
    get_pm_old = getattr(page_obj, "getPixmap", None)
    if callable(get_pm_old):
        return get_pm_old(matrix=mat)  # type: ignore[attr-defined]
    raise AttributeError("La página no soporta get_pixmap/getPixmap")


def _insert_text(page_obj, point_xy, text, fontsize=12, color=(1, 0, 0)):
    """Compatibilidad entre insert_text e insertText."""
    ins = getattr(page_obj, "insert_text", None)
    if callable(ins):
        return ins(point_xy, text, fontsize=fontsize, color=color)  # type: ignore[attr-defined]
    ins_old = getattr(page_obj, "insertText", None)
    if callable(ins_old):
        return ins_old(point_xy, text, fontsize=fontsize, color=color)  # type: ignore[attr-defined]
    raise AttributeError("La página no soporta insert_text/insertText")

def open_pdf():
    global doc, page, pdf_path
    file = filedialog.askopenfilename(title="Seleccionar PDF", filetypes=[("PDF files", "*.pdf")])
    if not file:
        return
    try:
        pdf_path = file
        doc = fitz.open(file)
        load_page(0)  # Cargar primera página
    except Exception as e:
        messagebox.showerror("Error", f"No se pudo abrir el PDF:\n{e}")

def load_page(page_number):
    global page, img, tk_img, canvas, scale, current_page_index, rect_coords, rect_id, page_label_var
    if doc is None:
        messagebox.showwarning("Aviso", "Primero abre un archivo PDF.")
        return
    try:
        # Asegurar rango válido
        total = doc.page_count
        if page_number < 0:
            page_number = 0
        if page_number > total - 1:
            page_number = total - 1
        current_page_index = page_number
        page = doc[page_number]
        # Renderizar página como imagen
        pix: Any = _get_pixmap(page, scale)
        mode = "RGBA" if pix.alpha else "RGB"
        img = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
        tk_img = ImageTk.PhotoImage(img)
        # Limpiar canvas antes de dibujar
        canvas.delete("all")
        canvas.config(scrollregion=(0, 0, pix.width, pix.height))
        canvas_image = canvas.create_image(0, 0, anchor=tk.NW, image=tk_img)
        # Reset selección
        rect_coords = None
        rect_id = None
        # Actualizar etiqueta de página si existe
        if page_label_var is not None:
            page_label_var.set(f"Página {current_page_index + 1} / {doc.page_count}")
        # Redibujar overlay si existe
        _draw_overlay()
    except Exception as e:
        messagebox.showerror("Error", f"No se pudo cargar la página {page_number}:\n{e}")

def on_mouse_down(event):
    global start_x, start_y, overlay_dragging, overlay_drag_offset, selection_dragging, rect_id
    cx = canvas.canvasx(event.x)
    cy = canvas.canvasy(event.y)
    # Modo coordenadas: registrar y terminar
    if _get_mode() == 'coords':
        _handle_click_coords(cx, cy)
        return
    # Si clic sobre el overlay, iniciar drag
    if overlay_id is not None:
        items = canvas.find_withtag("current")
        if items and overlay_id in items:
            overlay_dragging = True
            ox, oy = canvas.coords(overlay_id)
            overlay_drag_offset = (cx - ox, cy - oy)
            return
    # Si no, iniciar selección
    start_x, start_y = cx, cy
    selection_dragging = True
    # iniciar rectángulo visual
    if rect_id is not None:
        canvas.delete(rect_id)
    rect_id = canvas.create_rectangle(start_x, start_y, start_x, start_y, outline='red', width=2, dash=(3, 3))

def on_mouse_up(event):
    global rect_coords, rect_id, overlay_dragging, overlay_pdf_pos, selection_dragging
    cx = canvas.canvasx(event.x)
    cy = canvas.canvasy(event.y)
    if _get_mode() == 'coords':
        return
    if overlay_dragging:
        # Finalizar drag y actualizar posición PDF
        overlay_dragging = False
        if overlay_id is not None:
            ox, oy = canvas.coords(overlay_id)
            overlay_pdf_pos = (ox / scale, oy / scale)
        return
    # Finalizar selección
    selection_dragging = False
    end_x = cx
    end_y = cy
    # Normalizar coordenadas (x1,y1) = esquina superior-izquierda, (x2,y2) = inferior-derecha
    x1, y1 = min(start_x, end_x), min(start_y, end_y)
    x2, y2 = max(start_x, end_x), max(start_y, end_y)
    rect_coords = (x1, y1, x2, y2)
    # Actualizar rectángulo visual existente
    if rect_id is not None:
        canvas.coords(rect_id, x1, y1, x2, y2)
    # Calcular coordenadas PDF (dividir por escala)
    pdf_x1, pdf_y1 = x1 / scale, y1 / scale
    pdf_x2, pdf_y2 = x2 / scale, y2 / scale
    # Actualizar etiqueta y copiar si procede
    if isinstance(rect_label_var, tk.StringVar):
        rect_label_var.set(f"x1={pdf_x1:.2f}, y1={pdf_y1:.2f}, x2={pdf_x2:.2f}, y2={pdf_y2:.2f}")
    if _get_boolvar(auto_copy_rect_var, True):
        try:
            root.clipboard_clear()
            root.clipboard_append(f"x1={pdf_x1:.2f}, y1={pdf_y1:.2f}, x2={pdf_x2:.2f}, y2={pdf_y2:.2f}")
        except Exception:
            pass
    if _get_boolvar(show_rect_dialog_var, False):
        messagebox.showinfo("Coordenadas PDF", f"x1={pdf_x1:.2f}, y1={pdf_y1:.2f}, x2={pdf_x2:.2f}, y2={pdf_y2:.2f}")

def on_mouse_wheel(event):
    # Scroll vertical con rueda del mouse
    if event.delta:
        canvas.yview_scroll(-1 if event.delta > 0 else 1, "units")

def on_shift_mouse_wheel(event):
    # Scroll horizontal con Shift + rueda
    if event.delta:
        canvas.xview_scroll(-1 if event.delta > 0 else 1, "units")

def zoom_in():
    global scale
    if doc is None:
        return
    x_frac, y_frac = canvas.xview()[0], canvas.yview()[0]
    scale = min(scale + 0.5, MAX_SCALE)
    load_page(current_page_index)
    canvas.xview_moveto(x_frac)
    canvas.yview_moveto(y_frac)

def zoom_out():
    global scale
    if doc is None:
        return
    x_frac, y_frac = canvas.xview()[0], canvas.yview()[0]
    scale = max(scale - 0.5, MIN_SCALE)
    load_page(current_page_index)
    canvas.xview_moveto(x_frac)
    canvas.yview_moveto(y_frac)

def on_mouse_move(event):
    # Drag del overlay
    global overlay_dragging, overlay_drag_offset, overlay_pdf_pos, selection_dragging, rect_id
    if _get_mode() == 'coords':
        return
    if overlay_dragging and overlay_id is not None:
        cx = canvas.canvasx(event.x)
        cy = canvas.canvasy(event.y)
        dx, dy = overlay_drag_offset
        new_x = cx - dx
        new_y = cy - dy
        canvas.coords(overlay_id, new_x, new_y)
        _update_overlay_bg()
        # Actualizar posición PDF en vivo
        overlay_pdf_pos = (new_x / scale, new_y / scale)
    elif selection_dragging and rect_id is not None:
        cx = canvas.canvasx(event.x)
        cy = canvas.canvasy(event.y)
        x1, y1 = min(start_x, cx), min(start_y, cy)
        x2, y2 = max(start_x, cx), max(start_y, cy)
        canvas.coords(rect_id, x1, y1, x2, y2)


def _get_mode() -> str:
    return mode_var.get() if isinstance(mode_var, tk.StringVar) else 'move'


def _handle_click_coords(cx: float, cy: float):
    # Dibuja un marcador y actualiza label / portapapeles
    # Borrar marcador anterior
    canvas.delete(click_marker_tag)
    size = 6
    color = '#00ccff'
    canvas.create_line(cx - size, cy, cx + size, cy, fill=color, width=2, tags=click_marker_tag)
    canvas.create_line(cx, cy - size, cx, cy + size, fill=color, width=2, tags=click_marker_tag)
    x_pdf, y_pdf = cx / scale, cy / scale
    if isinstance(last_coords_var, tk.StringVar):
        last_coords_var.set(f"x={x_pdf:.2f}, y={y_pdf:.2f}")
    if _get_boolvar(auto_copy_coords_var, True):
        try:
            root.clipboard_clear()
            root.clipboard_append(f"x={x_pdf:.2f}, y={y_pdf:.2f}")
        except Exception:
            pass


def on_clear_markers():
    canvas.delete(click_marker_tag)

def next_page():
    if doc is None:
        return
    if current_page_index < doc.page_count - 1:
        load_page(current_page_index + 1)

def prev_page():
    if doc is None:
        return
    if current_page_index > 0:
        load_page(current_page_index - 1)

def insert_text():
    global rect_coords, page, doc, pdf_path
    if rect_coords is None:
        messagebox.showwarning("Aviso", "Primero selecciona un área con el mouse.")
        return
    if doc is None or page is None:
        messagebox.showwarning("Aviso", "No hay documento o página cargada.")
        return
    # Tomar punto superior izquierdo del rectángulo
    x_pdf = rect_coords[0] / scale
    y_pdf = rect_coords[1] / scale
    texto = simpledialog.askstring("Texto", "Introduce el texto a insertar:")
    if texto:
        try:
            _insert_text(page, (x_pdf, y_pdf), texto, fontsize=12, color=(1, 0, 0))
            # Guardar PDF nuevo
            if not pdf_path:
                raise ValueError("Ruta del PDF original no disponible")
            base, ext = os.path.splitext(pdf_path)
            new_file = f"{base}_modificado{ext or '.pdf'}"
            doc.save(new_file)
            messagebox.showinfo("Éxito", f"Texto insertado y guardado en:\n{new_file}")
            # Refrescar la vista para ver el cambio
            load_page(current_page_index)
        except Exception as e:
            messagebox.showerror("Error", f"No se pudo insertar texto o guardar el archivo:\n{e}")

# Utilidades de color
def _hex_to_rgb01(hex_color: str):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join(c*2 for c in hex_color)
    if len(hex_color) != 6:
        return (1.0, 0.0, 0.0)
    r = int(hex_color[0:2], 16)/255.0
    g = int(hex_color[2:4], 16)/255.0
    b = int(hex_color[4:6], 16)/255.0
    return (r, g, b)

# Utilidades para variables Tkinter seguras
def _get_strvar(v: Optional[tk.StringVar], default: str) -> str:
    return v.get() if isinstance(v, tk.StringVar) else default

def _get_intvar(v: Optional[tk.IntVar], default: int) -> int:
    return v.get() if isinstance(v, tk.IntVar) else default

def _get_boolvar(v: Optional[tk.BooleanVar], default: bool) -> bool:
    return v.get() if isinstance(v, tk.BooleanVar) else default

# --- Overlay de texto interactivo ---
def _draw_overlay():
    """Dibuja o actualiza el overlay de texto según overlay_pdf_pos y overlay_font_var."""
    global overlay_id
    if overlay_pdf_pos is None or overlay_text_var is None or overlay_font_var is None:
        return
    text = overlay_text_var.get().strip()
    if not text:
        return
    # Tamaño de fuente en canvas proporcional a escala
    pdf_fontsize = max(6, int(overlay_font_var.get()))
    canvas_fontsize = max(6, int(round(pdf_fontsize * scale)))
    family = _get_strvar(overlay_font_family_var, "Arial")
    fnt = tkfont.Font(family=family, size=canvas_fontsize)
    x = overlay_pdf_pos[0] * scale
    y = overlay_pdf_pos[1] * scale
    if overlay_id is None:
        overlay_id = canvas.create_text(x, y, text=text, anchor='nw', fill=_get_strvar(overlay_color_var, "#ff0000"), font=fnt)
    else:
        canvas.coords(overlay_id, x, y)
        canvas.itemconfig(overlay_id, text=text, font=fnt, fill=_get_strvar(overlay_color_var, "#ff0000"), anchor='nw')
    _update_overlay_bg()


def _update_overlay_bg():
    """Crea/actualiza el rectángulo de fondo del overlay si está habilitado."""
    global overlay_bg_id
    if overlay_id is None or not _get_boolvar(overlay_bg_enabled_var, False):
        if overlay_bg_id is not None:
            canvas.delete(overlay_bg_id)
            overlay_bg_id = None
        return
    bbox = canvas.bbox(overlay_id)
    if not bbox:
        return
    x1, y1, x2, y2 = bbox
    pad = 4
    bx1, by1, bx2, by2 = x1 - pad, y1 - pad, x2 + pad, y2 + pad
    if overlay_bg_id is None:
        overlay_bg_id = canvas.create_rectangle(bx1, by1, bx2, by2, fill=_get_strvar(overlay_bg_color_var, "#ffffcc"), outline='')
        canvas.tag_lower(overlay_bg_id, overlay_id)
    else:
        canvas.coords(overlay_bg_id, bx1, by1, bx2, by2)
        canvas.itemconfig(overlay_bg_id, fill=_get_strvar(overlay_bg_color_var, "#ffffcc"))


def on_overlay_add_update():
    """Crea o actualiza el overlay en la posición actual o en la selección."""
    global overlay_pdf_pos, overlay_id
    if doc is None:
        messagebox.showwarning("Aviso", "Primero abre un archivo PDF.")
        return
    # Posición inicial: esquina superior-izquierda de la selección o (20,20)
    if rect_coords is not None:
        x_canvas, y_canvas = rect_coords[0], rect_coords[1]
    else:
        x_canvas, y_canvas = 20, 20
    overlay_pdf_pos = (x_canvas / scale, y_canvas / scale)
    _draw_overlay()


def on_overlay_remove():
    global overlay_id, overlay_pdf_pos
    if overlay_id is not None:
        canvas.delete(overlay_id)
        overlay_id = None
        overlay_pdf_pos = None


def on_overlay_commit():
    """Inserta el overlay actual en el PDF y guarda."""
    global overlay_pdf_pos
    if doc is None or page is None:
        messagebox.showwarning("Aviso", "No hay documento cargado.")
        return
    if overlay_pdf_pos is None or overlay_text_var is None or overlay_font_var is None:
        messagebox.showwarning("Aviso", "No hay overlay para insertar.")
        return
    texto = overlay_text_var.get().strip()
    if not texto:
        messagebox.showwarning("Aviso", "El texto está vacío.")
        return
    try:
        pdf_fontsize = max(6, int(_get_intvar(overlay_font_var, 12)))
        rgb01 = _hex_to_rgb01(_get_strvar(overlay_color_var, "#ff0000"))
        _insert_text(page, (overlay_pdf_pos[0], overlay_pdf_pos[1]), texto, fontsize=pdf_fontsize, color=rgb01)
        if not pdf_path:
            raise ValueError("Ruta del PDF original no disponible")
        base, ext = os.path.splitext(pdf_path)
        new_file = f"{base}_modificado{ext or '.pdf'}"
        doc.save(new_file)
        messagebox.showinfo("Éxito", f"Texto insertado y guardado en:\n{new_file}")
        load_page(current_page_index)
    except Exception as e:
        messagebox.showerror("Error", f"No se pudo insertar texto o guardar el archivo:\n{e}")


def on_copy_coords():
    if overlay_pdf_pos is None:
        messagebox.showwarning("Aviso", "No hay overlay para copiar coordenadas.")
        return
    x, y = overlay_pdf_pos
    try:
        root.clipboard_clear()
        root.clipboard_append(f"x={x:.2f}, y={y:.2f}")
        messagebox.showinfo("Copiado", f"Coordenadas copiadas al portapapeles:\n(x={x:.2f}, y={y:.2f})")
    except Exception:
        messagebox.showwarning("Aviso", f"x={x:.2f}, y={y:.2f}")


def pick_text_color():
    if overlay_color_var is None:
        return
    color = colorchooser.askcolor(color=overlay_color_var.get(), title="Seleccionar color de texto")
    if color and color[1]:
        overlay_color_var.set(color[1])
        _draw_overlay()


def pick_bg_color():
    if overlay_bg_color_var is None:
        return
    color = colorchooser.askcolor(color=overlay_bg_color_var.get(), title="Seleccionar color de fondo")
    if color and color[1]:
        overlay_bg_color_var.set(color[1])
        _update_overlay_bg()


def on_toggle_bg():
    _update_overlay_bg()


def on_align_to_selection():
    """Alinear el overlay a la selección actual con las opciones de alineación."""
    global overlay_pdf_pos
    if overlay_id is None or rect_coords is None:
        messagebox.showwarning("Aviso", "Crea el overlay y selecciona un área primero.")
        return
    x1, y1, x2, y2 = rect_coords
    # Obtener tamaño del texto actual
    bbox = canvas.bbox(overlay_id)
    if not bbox:
        return
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    # Horizontal
    h = align_h_var.get() if align_h_var is not None else 'left'
    if h == 'left':
        tx = x1
    elif h == 'center':
        tx = (x1 + x2) / 2 - tw / 2
    else:  # right
        tx = x2 - tw
    # Vertical
    v = align_v_var.get() if align_v_var is not None else 'top'
    if v == 'top':
        ty = y1
    elif v == 'middle':
        ty = (y1 + y2) / 2 - th / 2
    else:  # bottom
        ty = y2 - th
    canvas.coords(overlay_id, tx, ty)
    overlay_pdf_pos = (tx / scale, ty / scale)
    _update_overlay_bg()


# --- Utilidades selección (copiar/limpiar) ---
def copy_rect_to_clipboard():
    text = _get_strvar(rect_label_var, "")
    try:
        root.clipboard_clear()
        root.clipboard_append(text)
    except Exception:
        pass


def clear_selection():
    global rect_id, rect_coords
    if rect_id:
        canvas.delete(rect_id)
        rect_id = None
    rect_coords = None
    if isinstance(rect_label_var, tk.StringVar):
        rect_label_var.set("x1=-, y1=-, x2=-, y2=-")

# --- Ventana principal ---
root = tk.Tk()
root.title("Herramienta PDF — Seleccionar coordenadas e insertar texto")

# Barra de botones superior
top_bar = tk.Frame(root)
top_bar.pack(fill=tk.X)

btn_open = tk.Button(top_bar, text="Abrir PDF", command=open_pdf)
btn_open.pack(side=tk.LEFT, padx=5, pady=5)

btn_prev = tk.Button(top_bar, text="◀ Página", command=prev_page)
btn_prev.pack(side=tk.LEFT, padx=5, pady=5)

btn_next = tk.Button(top_bar, text="Página ▶", command=next_page)
btn_next.pack(side=tk.LEFT, padx=5, pady=5)

btn_zoom_out = tk.Button(top_bar, text="- Zoom", command=zoom_out)
btn_zoom_out.pack(side=tk.LEFT, padx=5, pady=5)

btn_zoom_in = tk.Button(top_bar, text="+ Zoom", command=zoom_in)
btn_zoom_in.pack(side=tk.LEFT, padx=5, pady=5)

btn_insert = tk.Button(top_bar, text="Insertar texto en selección", command=insert_text)
btn_insert.pack(side=tk.RIGHT, padx=5, pady=5)

# Etiqueta de página
page_label_frame = tk.Frame(root)
page_label_frame.pack(fill=tk.X)
page_label_var = tk.StringVar(value="Página -/-")
page_label = tk.Label(page_label_frame, textvariable=page_label_var)
page_label.pack(side=tk.LEFT, padx=8)

# Controles de modo
mode_controls = tk.Frame(root)
mode_controls.pack(fill=tk.X, padx=6, pady=2)
mode_var = tk.StringVar(value='move')
tk.Label(mode_controls, text="Modo:").pack(side=tk.LEFT)
tk.Radiobutton(mode_controls, text="Mover texto", variable=mode_var, value='move').pack(side=tk.LEFT, padx=4)
tk.Radiobutton(mode_controls, text="Obtener coords", variable=mode_var, value='coords').pack(side=tk.LEFT, padx=4)
auto_copy_coords_var = tk.BooleanVar(value=True)
tk.Checkbutton(mode_controls, text="Copiar coords auto", variable=auto_copy_coords_var).pack(side=tk.LEFT, padx=8)
last_coords_var = tk.StringVar(value="x=-, y=-")
tk.Label(mode_controls, text="Click:").pack(side=tk.LEFT, padx=(8, 2))
tk.Label(mode_controls, textvariable=last_coords_var).pack(side=tk.LEFT)
tk.Button(mode_controls, text="Limpiar marcas", command=on_clear_markers).pack(side=tk.RIGHT)

# Controles de overlay
overlay_controls = tk.Frame(root)
overlay_controls.pack(fill=tk.X, padx=6, pady=4)

tk.Label(overlay_controls, text="Texto:").pack(side=tk.LEFT)
overlay_text_var = tk.StringVar(value="Texto de ejemplo")
overlay_entry = tk.Entry(overlay_controls, textvariable=overlay_text_var, width=28)
overlay_entry.pack(side=tk.LEFT, padx=6)
overlay_entry.bind('<KeyRelease>', lambda e: _draw_overlay())

tk.Label(overlay_controls, text="Tamaño (pt):").pack(side=tk.LEFT)
overlay_font_var = tk.IntVar(value=12)
overlay_font_scale = tk.Scale(overlay_controls, from_=6, to=72, orient=tk.HORIZONTAL, variable=overlay_font_var, command=lambda _: _draw_overlay())
overlay_font_scale.pack(side=tk.LEFT, padx=6)

btn_overlay_add = tk.Button(overlay_controls, text="Añadir/Actualizar", command=on_overlay_add_update)
btn_overlay_add.pack(side=tk.LEFT, padx=4)

btn_overlay_remove = tk.Button(overlay_controls, text="Eliminar", command=on_overlay_remove)
btn_overlay_remove.pack(side=tk.LEFT, padx=4)

btn_overlay_commit = tk.Button(overlay_controls, text="Insertar en PDF", command=on_overlay_commit)
btn_overlay_commit.pack(side=tk.LEFT, padx=4)

btn_copy_coords = tk.Button(overlay_controls, text="Copiar coords", command=on_copy_coords)
btn_copy_coords.pack(side=tk.LEFT, padx=4)

# Fila 2 de controles: color, fondo, fuente y alineación
overlay_controls2 = tk.Frame(root)
overlay_controls2.pack(fill=tk.X, padx=6, pady=2)

overlay_color_var = tk.StringVar(value="#ff0000")
tk.Button(overlay_controls2, text="Color texto", command=pick_text_color).pack(side=tk.LEFT)

overlay_bg_enabled_var = tk.BooleanVar(value=False)
tk.Checkbutton(overlay_controls2, text="Fondo", variable=overlay_bg_enabled_var, command=on_toggle_bg).pack(side=tk.LEFT, padx=6)

overlay_bg_color_var = tk.StringVar(value="#ffffcc")
tk.Button(overlay_controls2, text="Color fondo", command=pick_bg_color).pack(side=tk.LEFT)

tk.Label(overlay_controls2, text="Fuente:").pack(side=tk.LEFT, padx=(10, 0))
overlay_font_family_var = tk.StringVar(value="Arial")
tk.Entry(overlay_controls2, textvariable=overlay_font_family_var, width=12).pack(side=tk.LEFT)
tk.Button(overlay_controls2, text="Aplicar fuente", command=_draw_overlay).pack(side=tk.LEFT, padx=4)

tk.Label(overlay_controls2, text="Alineación:").pack(side=tk.LEFT, padx=(10, 0))
align_h_var = tk.StringVar(value='left')
align_v_var = tk.StringVar(value='top')
tk.OptionMenu(overlay_controls2, align_h_var, 'left', 'center', 'right').pack(side=tk.LEFT)
tk.OptionMenu(overlay_controls2, align_v_var, 'top', 'middle', 'bottom').pack(side=tk.LEFT)
tk.Button(overlay_controls2, text="Alinear a selección", command=on_align_to_selection).pack(side=tk.LEFT, padx=6)

# Controles de selección
selection_controls = tk.Frame(root)
selection_controls.pack(fill=tk.X, padx=6, pady=2)
rect_label_var = tk.StringVar(value="x1=-, y1=-, x2=-, y2=-")
tk.Label(selection_controls, text="Rect:").pack(side=tk.LEFT)
tk.Label(selection_controls, textvariable=rect_label_var).pack(side=tk.LEFT, padx=(2, 10))

auto_copy_rect_var = tk.BooleanVar(value=True)
tk.Checkbutton(selection_controls, text="Copiar rect auto", variable=auto_copy_rect_var).pack(side=tk.LEFT)

show_rect_dialog_var = tk.BooleanVar(value=False)
tk.Checkbutton(selection_controls, text="Mostrar diálogo rect", variable=show_rect_dialog_var).pack(side=tk.LEFT, padx=6)

tk.Button(selection_controls, text="Copiar rect", command=copy_rect_to_clipboard).pack(side=tk.LEFT, padx=6)
tk.Button(selection_controls, text="Limpiar selección", command=clear_selection).pack(side=tk.LEFT)

# Contenedor con scrollbars
canvas_frame = tk.Frame(root)
canvas_frame.pack(fill=tk.BOTH, expand=True)

v_scroll = tk.Scrollbar(canvas_frame, orient=tk.VERTICAL)
h_scroll = tk.Scrollbar(canvas_frame, orient=tk.HORIZONTAL)

canvas = tk.Canvas(canvas_frame, bg="gray", xscrollcommand=h_scroll.set, yscrollcommand=v_scroll.set)

v_scroll.config(command=canvas.yview)
h_scroll.config(command=canvas.xview)

v_scroll.pack(side=tk.RIGHT, fill=tk.Y)
h_scroll.pack(side=tk.BOTTOM, fill=tk.X)
canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

# Bindings de interacción
canvas.bind("<ButtonPress-1>", on_mouse_down)
canvas.bind("<ButtonRelease-1>", on_mouse_up)
canvas.bind("<MouseWheel>", on_mouse_wheel)
canvas.bind("<Shift-MouseWheel>", on_shift_mouse_wheel)
canvas.bind("<B1-Motion>", on_mouse_move)

# Atajos de teclado
root.bind('+', lambda e: zoom_in())
root.bind('-', lambda e: zoom_out())
root.bind('<Right>', lambda e: next_page())
root.bind('<Left>', lambda e: prev_page())

root.mainloop()
