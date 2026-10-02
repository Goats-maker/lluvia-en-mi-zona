# Escalera de Prompts: LLUVIA EN MI ZONA

## P0: Que exista
**ROL:** Sos un desarrollador senior de aplicaciones Android con Kotlin y Jetpack Compose.

**CONTEXTO:** Estoy construyendo una app llamada LLUVIA EN MI ZONA para vecinos de una
zona inundable. El problema que resuelve es: la quebrada se desborda y el aviso al
vecindario llega tarde.

**TAREA:** Generá la primera versión funcional, con estas tres funciones y nada más:
1. Registrar la lluvia del día en milímetros (campo numérico, fecha por defecto hoy, botón «Guardar lluvia del día»).
2. Mostrar el acumulado de las últimas 72 horas (hoy y los 2 días anteriores) en un contador grande.
3. Mostrar una alerta visible (banner rojo) cuando el acumulado alcance o supere el umbral, definido como constante de 80 mm; verde si está por debajo.

**RESTRICCIONES:** en español, sin librerías de pago, sin login, sin base de datos en servidor. Por ahora los datos pueden vivir solo en memoria (la persistencia se agrega en un paso posterior). Una sola pantalla en modo oscuro, tipografía grande, que se vea bien en un celular desde 320 dp de ancho. Código comentado en los puntos donde alguien vaya a equivocarse (por ejemplo, el cálculo de las 72 horas).

**FORMATO DE SALIDA:** los archivos completos, cada uno con su nombre, y al final una lista de lo que NO hiciste y por qué.

**CRITERIO DE ACEPTACIÓN:** abro la app, registro 30 mm hoy, 30 mm ayer y 25 mm anteayer, y veo el acumulado en 85 mm con la alerta roja visible, sin ningún error en Logcat.

*Evidencia:* E0-inicial.png
*Commit:* `git commit -m "P0: primera version generada con IA"`

---

## M1: Que sirva

Probá las tres funciones a mano, anotá cuál falla y completá los corchetes:

> La app ya hace [LO QUE YA FUNCIONA, ej.: registrar lluvia y mostrar el acumulado].
> Necesito agregar [FUNCIÓN QUE FALTA, ej.: la alerta al pasar el umbral].

No reescribas lo que ya funciona. Dame únicamente:
1. Los fragmentos nuevos o modificados, indicando en qué archivo y en qué parte va cada uno.
2. Una prueba manual de tres pasos para comprobar que quedó bien.
3. Qué podría romperse en el resto de la app por este cambio.

*Evidencia:* E1-antes.png y E1-despues.png.
*Commit:* `git commit -m "M1: alerta al pasar el umbral"`

---

## M2: Que recuerde
Quiero que los datos de la app no se pierdan al cerrarla.

Usá Room (SQLite local) con una tabla lluvia (fecha como clave primaria, mm como Double). Si ya existe un registro de esa fecha, se sobrescribe. Explicame:
1. Dónde queda guardada la información exactamente.
2. Qué pasa si el usuario borra los datos de la app o cambia de teléfono.
3. Cómo hago para exportar el histórico a un archivo JSON, por si quiero respaldarlo.

Dame el código de guardar, leer y borrar, y tres registros de ejemplo ya cargados para probar. Agregá también el histórico por fecha en pantalla, del más reciente al más antiguo.

Probalo: metés tres registros, cerrás la app por completo (deslizar desde recientes) y la abrís de nuevo.
*Evidencia:* E2-antes.png y E2-despues.png.
*Commit:* `git commit -m "M2: persistencia de datos"`

---

## M3: Que se entienda

Antes de pedirlo, abrí la app en tu teléfono y anotá los tres estorbos más grandes.

Ajustá la interfaz de la app con estos requisitos, sin cambiar la lógica:

1. Se usa bien desde 320 dp de ancho, con una sola mano y sin hacer zoom.
2. Contraste suficiente para leerse al sol; texto nunca menor a 16 sp.
3. Todos los campos con etiqueta visible, no solo con texto de ejemplo dentro.
4. Un solo botón principal por pantalla («Guardar lluvia del día»); los demás, secundarios.
5. Estado vacío: cuando todavía no hay ningún registro, mostrar una frase que invite a la primera acción, por ejemplo «Todavía no registraste lluvia. Anotá los milímetros de hoy para empezar a vigilar la quebrada».
6. Mensajes de éxito y de error visibles, en español, sin palabras técnicas.

Dame los cambios y decime cuál de los seis puntos NO pudiste cumplir y por qué.

*Evidencia:* E3-celular.png (desde el teléfono real) y E3-vacio.png.
*Commit:* `git commit -m "M3: experiencia de uso en celular"`

---

## M4: Que no se rompa

Primero el tester, después el código:

Actuá como tester de software, no como programador.

Dame diez formas concretas de romper esta app desde la interfaz: campo de mm vacío, texto donde va número, milímetros negativos, valores absurdos (por ejemplo 99999 mm), fechas futuras o imposibles, un texto de 500 caracteres, doble toque en «Guardar lluvia del día», registrar dos veces la misma fecha, rotar la pantalla a mitad de la carga.

Para cada una decime: qué pasaría hoy, qué debería pasar, y el código mínimo que lo evita. No cambies el diseño ni agregues funciones nuevas.

Intentá romperla con la lista en la mano y llená la tabla de cinco intentos (antes y después) para el README.
*Evidencia:* la tabla y E4-error.png.
*Commit:* `git commit -m "M4: validaciones y manejo de errores"`

---

## M5: Que piense
Integrá una llamada a la API de Gemini dentro de la app para esta tarea concreta: la IA explica el riesgo del acumulado de lluvia en lenguaje claro y redacta el mensaje de aviso para el grupo del vecindario.

Entrada que recibe la IA: el acumulado de 72 h, el umbral y los últimos 7 registros.

Requisitos:
1. La respuesta debe venir como JSON con un esquema fijo (responseSchema), no como texto libre. Esquema:
   ```json
   {
     "nivel_riesgo": "bajo | medio | alto",
     "explicacion": "máx. 3 frases en lenguaje claro",
     "mensaje_aviso": "máx. 6 líneas para el grupo de WhatsApp",
     "acciones": ["lista de 3 acciones concretas"]
   }
   ```
2. La app consume ese JSON y lo muestra en pantalla como dato: el nivel_riesgo como etiqueta de color, la explicación en una tarjeta, las acciones como lista, y el mensaje_aviso en un cuadro con botones «Copiar» y «Compartir».
3. La llave de API se lee de local.properties (expuesta con BuildConfig); mostrame cómo configurarla y cómo evitar que llegue a GitHub (.gitignore).
4. Manejo de fallo: qué se muestra si no hay conexión, si la IA responde lento (timeout de 15 s) o devuelve algo que no cumple el esquema. En esos casos usar un mensaje local según el nivel de alerta y avisar con honestidad: «No pude consultar a la IA; este aviso es una plantilla».
5. Un ejemplo de respuesta de prueba (JSON falso) para desarrollar sin gastar llamadas.

*Evidencia:* E5-json.png, E5-app.png y E5-falla.png (probá con el modo avión).
*Commit:* `git commit -m "M5: inteligencia con salida estructurada"`
