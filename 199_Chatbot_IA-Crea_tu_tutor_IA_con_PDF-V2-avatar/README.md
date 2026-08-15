# Chatbot PDF Interactivo Avanzado — Tutor Educativo Inteligente

Proyecto diseñado por Juan Guillermo Rivera Berrío, con la asistencia de la IA agéntica Antigravity y la tecnología Gemini 3.1 Pro. Ofrece una interfaz en el navegador para cargar uno o dos PDFs y chatear sobre su contenido con modelos de lenguaje, pero con una vocación pedagógica clara: **no solo da respuestas, guía al estudiante a descubrirlas**. Además exporta la sesión o genera un **chatbot HTML autónomo** listo para compartir.

> 🌱 **Filosofía central**: actuar como un tutor socrático de matemáticas y ciencias. La herramienta evita entregar la solución de inmediato; razona con el estudiante paso a paso, plantea preguntas y pistas progresivas, ajusta la cantidad de ayuda y solo revela la solución completa cuando el estudiante ya lo ha intentado, lo solicita explícitamente o viene a verificar. Así se fortalecen el razonamiento y la autonomía, en lugar de depender de la respuesta suelta y fácil.

## Características principales

### Aplicación principal (`index.html`)

- **Visor de PDF**: Carga un PDF local y ábrelo en un panel junto al chat.
- **Segundo PDF opcional**: Tras cargar el primero, puedes añadir otro documento para combinar contexto en las preguntas.
- **Selector de modelos**: Lista dinámica desde Pollinations (`context_length` ≥ 400000 tokens), con indicación de modelos de pago.
- **Matemáticas y formato**: MathJax para fórmulas y Marked para Markdown en las respuestas del bot.
- **Exportación de sesión**: Descarga la conversación actual como **HTML** o **PDF** (html2pdf).
- **Chatbot descargable**: Genera un archivo HTML único embebido con el texto del PDF (y el segundo PDF si lo hubo), para usarlo sin volver a subir archivos.
- **Tema claro / oscuro** y flujo **BYOP** para API Key con `enter.pollinations.ai`.

### Pedagogía y experiencia de uso (novedades de esta versión)

- **Tutor socrático (`SYS_TUTOR`)**: Se inyecta como *system prompt* un manual pedagógico completo: encadenamiento de preguntas, método socrático (*¿Qué datos conoces? ¿Qué te pide? ¿Qué concepto del PDF aplica? ¿Qué fórmula usarías?*), cuatro **niveles de ayuda** (de la pista mínima hasta la solución final) y la regla de cumplir únicamente cuando el estudiante ya intentó, pide explicación completa o viene a verificar. Prioriza el contenido de los PDFs y avisa cuando la respuesta no aparece en ellos.
- **Memoria de conversación**: la app conserva todo el hilo (pares usuario–asistente) y lo reenvía en cada turno, de modo que el modelo recuerda el contexto previo y no marca como "fuera de alcance" las preguntas de seguimiento como *"¿me muestras el procedimiento?"*.
- **Efecto máquina de escribir**: las respuestas se revelan carácter a carácter para que puedas leer desde el principio, sin saltos bruscos.
- **Scroll inteligente**: la vista solo se mantiene anclada al fondo mientras estás cerca del final; si subes a leer un mensaje anterior, no te arrastra.
- **Contexto separado del diálogo**: el/los PDF incrustados se pasan como contexto estable (no como mensajes repetidos), evitando inflar cada turno y degradar la calidad de la conversación.

### Chatbot generado (archivo descargado)

El HTML exportado con **Descargar Chatbot** incluye, entre otras cosas:

- **Alcance del contenido**: Instrucciones para responder solo sobre el documento incrustado y el tema que indiques al generar el clon; preguntas fuera de alcance se marcan con el prefijo `[FUERA_DE_ALCANCE]` y se muestran como aviso, sin inventar respuestas del PDF.
- **Tutor + memoria**: replica el *system prompt* educador (`SYS_TUTOR_EMBEDDED`) y conserva el historial de la conversación, igual que la app principal.
- **Avatares**: Imágenes generadas vía Pollinations (bot y usuario), con sustitutos locales si no hay clave, siguiendo el mismo criterio que en el proyecto de referencia *Chatea con PDF (investigación)*.
- **Preguntas sugeridas**: Selector con al menos 12 preguntas; si hay API Key al descargar, se generan con la API a partir de **extractos repartidos** por el documento (inicio, zonas intermedias y final) para cubrir capítulos o secciones distintas, no solo las primeras páginas. Si falla la generación, se usan preguntas de respaldo alineadas al nombre del PDF y al subtítulo.
- **Segundo PDF opcional** en el mismo clon (carga manual o texto ya embebido).
- **Exportar sesión**: Botones **Descargar HTML** y **Descargar Word** para guardar todo el hilo (preguntas y respuestas) con formato legible; el Word usa la librería `docx` como en la app de investigación PDF.
- **Robustez del código incrustado**: las cadenas (texto del PDF, nombres, subtítulo y prompt del tutor) se escapan de forma segura (secuencias como `</script>` o saltos de línea reales) para que el HTML generado no se rompa ni se trunque al abrirlo.

## Infraestructura Pollinations AI

1. **API Key**: Autorización en `enter.pollinations.ai` y almacenamiento local cómodo para el usuario.
2. **Modelos**: `https://enter.pollinations.ai/api/generate/text/models` para poblar el selector según ventana de contexto.
3. **Chat**: `https://gen.pollinations.ai/v1/chat/completions` para todas las consultas y, al descargar el chatbot, para la generación opcional de preguntas sugeridas.

## Instalación y uso

1. Coloca en una carpeta `index.html`, `script.js` y `style.css`.
2. Abre `index.html` en el navegador (aplicación estática; no exige Node ni servidor).
3. Obtén o pega tu API Key con **Obtener API Key**.
4. Carga el PDF principal (y, si quieres, el segundo PDF).
5. Elige modelo y chatea sobre el documento. Recuerda que el tutor **guiará tus pasos**: respóndele, intenta los ejercicios que te proponga y verás cómo va aumentando la ayuda según tu progreso.
6. Opcional: **Descargar Chatbot** para obtener el clon HTML autónomo; dentro del clon podrás **Descargar HTML** / **Descargar Word** de la sesión cuando lo necesites.

> 💡 **Sugerencia educativa**: usa preguntas abiertas y deja que el tutor te lleve al razonamiento. Es la mejor manera de sacar partido del método socrático incluido.

---

*Diseñado por Juan Guillermo Rivera Berrío con tecnología Gemini 3.1 Pro y la IA agéntica Antigravity.*
