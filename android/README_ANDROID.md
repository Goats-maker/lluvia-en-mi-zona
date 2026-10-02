# Proyecto Nativo Android: LLUVIA EN MI ZONA

Este directorio contiene el código fuente nativo en **Kotlin y Jetpack Compose** con persistencia local en **Room (SQLite)** para compilar el instalador `.apk` en tu dispositivo Android.

## Pasos para compilar e instalar en tu celular Android

1. **Abrir en Android Studio:**
   - Abre Android Studio y selecciona **Open**.
   - Elige la carpeta `android/` de este proyecto.

2. **Configurar la API Key de Gemini:**
   - Crea un archivo llamado `local.properties` en la raíz de `android/` (puedes basarte en `local.properties.example`).
   - Agrega tu clave:
     ```properties
     GEMINI_API_KEY=tu_clave_de_gemini
     ```

3. **Generar el archivo APK instalable:**
   - En Android Studio, ve al menú superior:
     `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`.
   - Cuando termine la compilación, haz clic en **locate** en la notificación inferior derecha.
   - El archivo generado estará en:
     `app/build/outputs/apk/debug/app-debug.apk`

4. **Instalar en tu teléfono Android:**
   - Conecta tu celular por cable USB con *Depuración por USB* activada y presiona el botón verde **Run** (▶) en Android Studio.
   - O copia el archivo `app-debug.apk` a tu celular (por WhatsApp, Drive o cable) y ábrelo para instalarlo.
