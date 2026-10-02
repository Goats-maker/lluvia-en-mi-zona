# 🌧️ LLUVIA EN MI ZONA — Sistema Comunitario de Alerta Temprana

> **Problema que resuelve:** La quebrada se desborda y el aviso al vecindario suele llegar tarde.  
> **Solución:** Monitoreo comunitario del acumulado de lluvia en las últimas 72 horas con umbral crítico en 80 mm, persistencia local (Room / LocalStorage), validaciones robustas y redacción de avisos para WhatsApp con Inteligencia Artificial (Gemini 3.8 Flash con `responseSchema`).

---

## 📱 Cómo Instalar en tu Dispositivo Android

Tienes dos métodos disponibles:

### Método 1: Instalación Directa (PWA / WebAPK) — Sin compilar nada
1. Abre el enlace de la aplicación en **Google Chrome** en tu teléfono Android.
2. Toca el botón **«Instalar Ahora»** que aparece en el banner superior, o ve a los **tres puntos (⋮)** de Chrome y selecciona **«Instalar aplicación»** (o *«Agregar a la pantalla principal»*).
3. Android creará el ícono **LluviaZona** en tu pantalla de inicio y en tu lista de aplicaciones.
4. Se ejecuta a pantalla completa, con soporte **offline total** y sin barra de navegación.

### Método 2: Compilar APK Nativo con Android Studio (Kotlin + Jetpack Compose)
1. Descarga el archivo `lluvia-en-mi-zona.zip` desde la app o clona este repositorio.
2. Abre la carpeta `android/` en **Android Studio**.
3. En `android/local.properties`, agrega tu clave: `GEMINI_API_KEY=tu_clave_aqui`.
4. Ve al menú **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
5. El instalador generado estará en: `android/app/build/outputs/apk/debug/app-debug.apk`. Puedes pasarlo a tu celular e instalarlo directamente.

---

## 🚀 Subir este Repositorio a tu GitHub

El repositorio Git ya está inicializado con su historial de commits. Para subirlo a tu cuenta:

```bash
# 1. Crea un repositorio vacío en https://github.com/new llamado "lluvia-en-mi-zona"
# 2. En tu terminal ejecuta:
git remote add origin https://github.com/TU_USUARIO/lluvia-en-mi-zona.git
git branch -M main
git push -u origin main
```

---

## 🛡️ Tabla de Pruebas de Resistencia QA (Peldaño M4)

| Caso de Prueba | Intento / Input | Qué pasaba antes | Qué pasa ahora (Protegido) |
|---|---|---|---|
| **1. Campo de mm vacío** | `""` | Guardaba `0` o `NaN` en silencio | Bloquea y muestra en rojo: *«Por favor ingresá la cantidad de milímetros de lluvia»* |
| **2. Texto en vez de número** | `"mucho"` | Provocaba `NaN` y rompía el acumulador | Valida `isNaN()` y rechaza con mensaje visible |
| **3. Milímetros negativos** | `"-15"` | Restaba lluvia del total de 72h | Valida `num < 0` y rechaza: *«mínimo 0 mm»* |
| **4. Valor absurdo** | `"99999"` | Rompía la escala visual y causaba pánico | Límite físico: advierte si supera 500 mm en un solo día |
| **5. Fechas futuras** | `2030-01-01` | Desfasaba el cálculo cronológico | Input con `max="hoy"` y validador de fecha futura |
| **6. Fecha duplicada** | Mismo día x2 | Duplicaba registros y sumaba doble | Clave primaria Room/LocalStorage: sobrescribe y notifica |

---

## 🧠 Inteligencia Artificial con Salida Estructurada (Peldaño M5)

- **Modelo:** `gemini-3.8-flash` mediante `@google/genai`.
- **Esquema JSON (`responseSchema`):**
  ```json
  {
    "nivel_riesgo": "bajo | medio | alto",
    "explicacion": "máx. 3 frases en lenguaje claro",
    "mensaje_aviso": "máx. 6 líneas para el grupo de WhatsApp",
    "acciones": ["lista de 3 acciones concretas"]
  }
  ```
- **Botones de acción:** «Copiar texto» y «Enviar a WhatsApp».
- **Manejo de fallo (Honestidad):** Si no hay conexión o se superan los 15 segundos de timeout, se activa la plantilla de seguridad local con el mensaje:
  > *«No pude consultar a la IA; este aviso es una plantilla local de seguridad.»*
