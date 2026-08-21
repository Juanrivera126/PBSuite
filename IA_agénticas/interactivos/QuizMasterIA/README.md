# QuizMaster IA 🧠

Aplicación web de **repaso escolar con inteligencia artificial**: genera un cuestionario
dinámico de opción múltiple (A, B, C, D) sobre cualquier tema de estudio, con
**ilustraciones generadas por IA** (Pollinations) y **explicaciones pedagógicas** colapsables.

## ✨ Funcionalidades

1. **Pantalla inicial** — pide el *Tema de estudio* (ej.: Revolución Francesa, Fotosíntesis)
   y el *Número de preguntas* (máximo 15).
2. **Generación con IA (BYOK)** — usa tu propia **API Key de Groq** (modelo de texto) para
   estructurar preguntas, opciones, respuesta correcta, explicación y prompt de ilustración.
3. **Selector de imágenes (Pollinations)** — modelo de imagen (cargado desde
   `gen.pollinations.ai/image/models`) + estilo de ilustración; cada pregunta se ilustra
   con una imagen vertical **3:4** en el **panel lateral izquierdo**.
4. **Cuestionario interactivo** — al hacer clic en una opción se colorea al instante
   (**verde = correcta, rojo = incorrecta**) y se muestra abajo un **cuadro colapsable**
   con la explicación sencilla de la respuesta correcta.
5. **Puntaje final** — al terminar muestra el puntaje, el porcentaje y un **mensaje de
   motivación** dinámico según el desempeño.
6. **Descargar cuestionario ⬇️** — genera un **clon HTML 100% funcional** con las
   ilustraciones incrustadas en **Base64**: no requiere claves de API ni internet.
   Perfecto para distribuir a estudiantes.

## 🔑 Claves (BYOK — Bring Your Own Key)

Las claves se ingresan en la app y se guardan **solo en el navegador** (localStorage).
Nunca se envían a otro sitio que no sea la API correspondiente.

| Servicio | Dónde obtenerla |
|---|---|
| **Groq** (preguntas) | <https://console.groq.com/keys> |
| **Pollinations** (imágenes) | <https://pollinations.ai> o el flujo "Obtener" dentro de la app |

## 🚀 Cómo usar

1. Abre `index.html` en el navegador (o sirve la carpeta con un servidor local).
2. Escribe el tema y el número de preguntas (1–15).
3. Pega tus claves de API (Groq y Pollinations) y elige el modelo de imagen / estilo.
4. Pulsa **✨ Generar cuestionario**.
5. Responde, lee las explicaciones y, al final, **descarga el clon** para compartirlo.

> 💡 El clon descargado es un único archivo `.html` autocontenido (estilos + lógica +
> imágenes Base64). Se puede abrir en cualquier navegador, incluso sin conexión.

## 📁 Estructura

```
QuizMasterIA/
├── index.html   → interfaz (configuración, cuestionario, resultados)
├── styles.css   → diseño y paleta de colores
├── script.js    → lógica: Groq, Pollinations, quiz y clon Base64
└── README.md    → este archivo
```

La generación de imágenes sigue el patrón de la app de referencia `../Modelo`
(petición GET a `https://gen.pollinations.ai/image/...` con `key`, `model`,
`width`, `height` y `seed`, más selector de modelos e inicio de sesión
`enter.pollinations.ai` para obtener la clave).
