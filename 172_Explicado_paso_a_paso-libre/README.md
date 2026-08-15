# Explicado paso a paso 🧑‍🏫✨

Una aplicación web interactiva que utiliza Inteligencia Artificial para explicar cualquier concepto complejo de forma estructurada y visual. La aplicación genera explicaciones personalizadas a través de un experto seleccionado, complementadas con diagramas e ilustraciones, permitiendo adaptar los colores, las tipografías y el diseño visual según el contexto y el público objetivo.

## 🚀 Características principales

- **Explicación Estructurada**: Toda explicación generada sigue una estructura didáctica rigurosa:
  1. **Introducción** al tema.
  2. **Explicación paso a paso** detallada.
  3. Una **Analogía** cotidiana para facilitar la comprensión.
  4. Tres **Ideas erróneas comunes** (mitos desmentidos).
- **Generación de Imágenes Asíncronas**: Ilustraciones automáticas para cada sección del tutorial adaptadas al tema y estilo del experto utilizando múltiples modelos de generación de imágenes de Pollinations AI.
- **Soporte de Fórmulas Matemáticas (MathJax)**: Detección inteligente de palabras clave de matemáticas/física o activación manual para renderizar expresiones complejas en notación LaTeX de manera impecable.
- **Paletas de Colores y Modo Oscuro**: Más de 10 combinaciones de colores seleccionadas con soporte completo y coherente para el modo claro y oscuro.
- **20 Estilos Visuales Exclusivos**: Estilización completa de la interfaz de usuario con un solo clic. Destacan los tres nuevos estilos integrados:
  - 🎓 **Educativo**: Limpio, académico, con tipografía altamente legible ('Lexend') y acentos que simulan cuadernos escolares.
  - 🧸 **Infantil**: Bordes súper redondeados, colores pastel vivos, fuentes amigables ('Fredoka') y sombras divertidas tipo burbuja.
  - 🔬 **Científico**: Estructura minimalista técnica de laboratorio, tipografía geométrica y monoespaciada ('Space Grotesk'), rejillas y bordes cibernéticos con acentos verde/azul eléctricos.
- **Exportación Versátil**: Descarga instantánea de la explicación en:
  - **HTML Autocontenido**: Descarga el tutorial con las imágenes convertidas a formato Base64 para poder visualizarlo sin conexión a internet y conservando la interactividad del modo oscuro.
  - **Microsoft Word**: Exportación directa compatible con procesadores de texto en formato `.doc`.
- **Integración BYOP (Bring Your Own Password/API Key)**: Flujo de autorización seguro integrado con la plataforma Pollinations AI para usar claves personalizadas directamente desde el navegador.

## 📂 Estructura del proyecto

El código fuente está organizado de manera modular y limpia en tres archivos principales:

- 🌐 `index.html`: Define la estructura semántica de la página, los controles de configuración y los contenedores de los tutoriales.
- 🎨 `style.css`: Contiene todo el sistema de diseño visual, variables del sistema CSS para los modos de luz/oscuridad y la configuración visual de los 20 temas de diseño.
- ⚡ `script.js`: Gestiona la lógica de la aplicación, interacción con las APIs de Pollinations AI, generación asíncrona, conversión a Base64, detección matemática y gestión de descargas.

## 🛠️ Instalación y Uso

La aplicación es completamente del lado del cliente y no requiere de un servidor o compilación previa.

1. Descarga o clona este repositorio en tu máquina local.
2. Abre el archivo `index.html` directamente en cualquier navegador moderno (Chrome, Firefox, Edge, Safari).
3. Introduce tu clave de Pollinations API (opcional, puedes hacer clic en "Obtener API Key" para loguearte con tu cuenta de Pollinations).
4. Elige un tema a explicar (ej: *Fotosíntesis*), el tipo de experto (ej: *Biólogo marino*), selecciona una paleta de colores y un estilo visual, ¡y haz clic en **Generar explicación**!

---

*Diseñado originalmente por **Juan Guillermo Rivera Berrío** con tecnología DeepSeek V4 y asistencia de Open Code. Reestructurado y optimizado con estilos premium.*
