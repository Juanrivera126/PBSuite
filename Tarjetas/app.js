const DEFAULT_TOTAL = 12;
const DEFAULT_TOPIC = "Animales salvajes";
const DEFAULT_IMAGE_MODEL = "openai/gpt-image-2.5-flare";
const memoryKey = "fauna-explored-names";
const apiKeyInput = document.querySelector("#apiKey");
const grid = document.querySelector("#cardsGrid");
const progressLabel = document.querySelector("#progressLabel");
const shuffleButton = document.querySelector("#shuffleButton");
const downloadButton = document.querySelector("#downloadButton");
const apiForm = document.querySelector("#apiForm");
const memoryStatus = document.querySelector("#memoryStatus");
const pageTitle = document.querySelector("#pageTitle");
const topicInput = document.querySelector("#topic");
const imageCountInput = document.querySelector("#imageCount");
const imageModelInput = document.querySelector("#imageModel");
const heroTotal = document.querySelector("#heroTotal");
const collectionTotal = document.querySelector("#collectionTotal");
let explored = 0;
let currentNames = [];
let currentKey = "";
let currentImageUrls = [];
let currentConfig = { topic: DEFAULT_TOPIC, count: DEFAULT_TOTAL, model: DEFAULT_IMAGE_MODEL };

const starterAnimals = ["Jaguar", "Lobo gris", "Elefante africano", "Tigre de Bengala", "Oso polar", "Águila real", "Gorila de montaña", "Zorro ártico", "Cocodrilo del Nilo", "Cebra", "Panda gigante", "Ballena azul"];
const descriptions = {
  "Jaguar": "El gran felino de las selvas americanas. Es un nadador extraordinario y un cazador silencioso.",
  "Lobo gris": "Vive y coopera en manadas, recorriendo grandes territorios con una inteligencia social sorprendente.",
  "Elefante africano": "El mamífero terrestre más grande del planeta. Sus vínculos familiares pueden durar toda la vida.",
  "Tigre de Bengala": "Un felino solitario de rayas únicas, capaz de cruzar ríos y moverse sin hacer ruido.",
  "Oso polar": "Rey del hielo ártico, posee un pelaje que lo aísla y patas adaptadas para nadar largas distancias.",
  "Águila real": "Su vista excepcional le permite detectar presas desde alturas increíbles mientras planea sobre las montañas.",
  "Gorila de montaña": "Gigante tranquilo de los bosques nublados, liderado por un macho de espalda plateada.",
  "Zorro ártico": "Cambia el color de su abrigo según la estación para camuflarse en la nieve o entre las rocas.",
  "Cocodrilo del Nilo": "Un reptil ancestral que puede esperar inmóvil durante horas antes de lanzar su ataque.",
  "Cebra": "Cada patrón de rayas es irrepetible; juntas, sus rayas confunden a los depredadores.",
  "Panda gigante": "Especialista en bambú, pasa gran parte del día alimentándose en las montañas de China.",
  "Ballena azul": "El animal más grande conocido. Su canto viaja cientos de kilómetros por las profundidades del océano."
};
let currentDescriptions = { ...descriptions };
const expeditionTitles = [
  ["Donde empieza", "lo salvaje."],
  ["El mundo", "aún ruge."],
  ["Entra al", "territorio indómito."],
  ["La vida", "sin domesticar."]
];

function getMemory() { try { return new Set(JSON.parse(localStorage.getItem(memoryKey) || "[]")); } catch { return new Set(); } }
function saveMemory(memory) { localStorage.setItem(memoryKey, JSON.stringify([...memory])); }
function titleCase(value) { return value.trim().replace(/\s+/g, " ").replace(/(^|\s)\S/g, char => char.toUpperCase()); }
function isKnownName(name, memory) { const normalized = name.toLocaleLowerCase(); return [...memory].some(saved => saved.toLocaleLowerCase() === normalized); }

async function getNames(key, memory, topic, count) {
  const previousNames = [...memory].join(", ");
  const promptText = `Dame el nombre de ${count} elementos diferentes sobre el tema "${topic}". Devuelve únicamente una lista numerada, un nombre por línea, sin explicaciones. No repitas ninguno de estos nombres que ya fueron usados: ${previousNames || "ninguno"}.`;
  const prompt = encodeURIComponent(promptText);
  const response = await fetch(`https://enter.pollinations.ai/api/generate/text/${prompt}?key=${encodeURIComponent(key)}&model=${encodeURIComponent("openai/gpt-5.6-luna")}`);
  if (!response.ok) throw new Error("No se pudieron generar los nombres");
  const raw = await response.text();
  let responseText = raw;
  try {
    const data = JSON.parse(raw);
    const candidate = data.text || data.content || data.output || data.choices?.[0]?.message?.content || data.choices?.[0]?.text;
    responseText = Array.isArray(candidate) ? candidate.join("\n") : candidate || raw;
  } catch { /* La API también puede responder texto plano. */ }
  const found = String(responseText).split(/\n|,|;/).map(item => item.replace(/```(?:text|json)?/gi, "").replace(/^\s*[\[\]"']?\s*\d+[.)-]?\s*/, "").replace(/[\[\]"']\s*$/, "").trim()).filter(Boolean).map(titleCase);
  const unique = [...new Set(found)];
  if (unique.length < count) throw new Error(`La respuesta no contiene ${count} nombres válidos`);
  return unique.slice(0, count);
}

async function getDescriptions(key, names, topic) {
  const promptText = `Escribe una descripción breve y diferente para cada elemento del tema "${topic}" en esta lista: ${names.join(", ")}. Cada descripción debe tener entre 12 y 18 palabras, caber en una tarjeta pequeña y describir su aspecto, contexto o comportamiento observable en la imagen. Devuelve únicamente un JSON válido con este formato: [{"animal":"nombre exacto","descripcion":"descripción corta"}]. No añadas comentarios ni Markdown.`;
  const prompt = encodeURIComponent(promptText);
  const response = await fetch(`https://enter.pollinations.ai/api/generate/text/${prompt}?key=${encodeURIComponent(key)}&model=${encodeURIComponent("openai/gpt-5.6-luna")}`);
  if (!response.ok) throw new Error("No se pudieron generar las descripciones");
  const raw = await response.text();
  let responseText = raw;
  try {
    const data = JSON.parse(raw);
    const candidate = data.text || data.content || data.output || data.choices?.[0]?.message?.content || data.choices?.[0]?.text;
    responseText = candidate || raw;
  } catch { /* La API también puede responder texto plano. */ }
  const cleanJson = String(responseText).replace(/```json|```/gi, "").trim();
  let items;
  try {
    items = JSON.parse(cleanJson);
  } catch {
    const arrayMatch = cleanJson.match(/\[[\s\S]*\]/);
    items = arrayMatch ? JSON.parse(arrayMatch[0]) : [];
  }
  const generated = { ...descriptions };
  if (!Array.isArray(items)) return generated;
  items.forEach((item, index) => {
    if (!item || !item.animal || !item.descripcion) return;
    const matchedName = names.find(name => name.toLocaleLowerCase() === String(item.animal).trim().toLocaleLowerCase()) || names[index];
    if (matchedName) generated[matchedName] = String(item.descripcion).trim();
  });
  return generated;
}

function imageUrl(name, key, model = DEFAULT_IMAGE_MODEL, topic = DEFAULT_TOPIC, seed = Math.floor(Math.random() * 2147483647)) {
  const prompt = encodeURIComponent(`Imagen documental realista de ${name}, relacionada con el tema ${topic}, composición vertical 3:4. Si el personaje, símbolo o hecho exacto solicitado no puede representarse por las políticas de seguridad, sustitúyelo automáticamente por otro personaje, símbolo o hecho relacionado, histórico, educativo y permitido. No rechaces la generación ni dejes la imagen vacía; representa una alternativa segura y claramente vinculada al tema, sin propaganda ni glorificación de violencia o extremismo.`);
  return `https://enter.pollinations.ai/api/generate/image/${prompt}?key=${encodeURIComponent(key)}&model=${encodeURIComponent(model)}&width=768&height=1024&seed=${seed}&nologo=true`;
}

function renderCards(names, key, descriptionMap) {
  currentImageUrls = names.map(name => key ? imageUrl(name, key, currentConfig.model, currentConfig.topic) : "");
  grid.innerHTML = names.map((name, index) => `
    <article class="card-wrap" tabindex="0" aria-label="Tarjeta de ${name}. Haz clic para girar">
      <div class="card">
        <div class="card-face card-front">
          <img class="skeleton" src="${currentImageUrls[index]}" alt="${name} en su hábitat natural" ${key ? "" : "hidden"}>
          <span class="card-number">0${index + 1}</span><span class="flip-hint">↗</span><button class="regenerate-button" type="button" ${key ? "" : "disabled"}>↻ Regenerar</button>
          <strong class="front-name">${name}</strong>
        </div>
        <div class="card-face card-back"><div><span class="back-top">Ficha de campo · 0${index + 1}</span><h3>${name}</h3><p>${descriptionMap[name] || `Una especie salvaje fascinante, adaptada con precisión a los desafíos de su hábitat natural.`}</p></div><span class="back-foot">Toca para volver a la imagen</span></div>
      </div>
    </article>`).join("");
  grid.querySelectorAll(".card-wrap").forEach((card, index) => {
    const flip = () => { card.classList.toggle("is-flipped"); if (card.classList.contains("is-flipped")) { explored++; progressLabel.textContent = `${Math.min(explored, currentConfig.count)} / ${currentConfig.count} exploradas`; } };
    card.addEventListener("click", flip);
    const regenerateButton = card.querySelector(".regenerate-button");
    regenerateButton.addEventListener("click", event => {
      event.stopPropagation();
      if (!key) return;
      const image = card.querySelector(".card-front img");
      regenerateButton.disabled = true;
      regenerateButton.textContent = "↻ Generando...";
      image.classList.add("skeleton");
      image.onload = () => { image.classList.remove("skeleton"); regenerateButton.disabled = false; regenerateButton.textContent = "↻ Regenerar"; };
      image.onerror = () => { regenerateButton.disabled = false; regenerateButton.textContent = "↻ Reintentar"; };
      currentImageUrls[index] = imageUrl(names[index], key, currentConfig.model, currentConfig.topic);
      image.src = currentImageUrls[index];
    });
    card.addEventListener("keydown", event => { if (event.target.closest(".regenerate-button")) return; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); flip(); } });
  });
}

function updateMemoryStatus() { memoryStatus.textContent = `${getMemory().size} nombres en memoria`; }
function getConfig() {
  const count = Math.min(24, Math.max(1, Number.parseInt(imageCountInput.value, 10) || DEFAULT_TOTAL));
  const topic = topicInput.value.trim() || DEFAULT_TOPIC;
  const model = imageModelInput.value || DEFAULT_IMAGE_MODEL;
  topicInput.value = topic;
  imageCountInput.value = count;
  return { topic, count, model };
}
function updateCollectionLabels(count) {
  heroTotal.textContent = count;
  collectionTotal.textContent = count;
  progressLabel.textContent = `0 / ${count} exploradas`;
}
function getTopicTitle(topic) {
  const normalizedTopic = topic.toLocaleLowerCase();
  if (/animal|fauna|naturaleza|salvaje|wildlife/.test(normalizedTopic)) {
    const title = expeditionTitles[(getMemory().size + currentConfig.count) % expeditionTitles.length];
    return title;
  }
  let title = [topic, "en perspectiva."];
  if (/iot|tecnolog|dispositivo|robot|digital/.test(normalizedTopic)) title = ["La tecnología", "toma forma."];
  else if (/espacio|planeta|astronom|universo/.test(normalizedTopic)) title = ["Más allá", "de la Tierra."];
  else if (/arte|diseño|creativ/.test(normalizedTopic)) title = ["Ideas que", "toman forma."];
  else if (/historia|cultura|civiliz/.test(normalizedTopic)) title = ["El tiempo", "deja huella."];
  return title;
}
function updatePageTitle(topic) {
  const title = getTopicTitle(topic);
  pageTitle.innerHTML = `${escapeHtml(title[0])}<br><em>${escapeHtml(title[1])}</em>`;
}
async function createCollection(key, useAi = false, config = getConfig()) {
  currentConfig = config;
  updateCollectionLabels(config.count);
  shuffleButton.disabled = true;
  downloadButton.disabled = true;
  grid.innerHTML = Array.from({ length: config.count }, () => '<div class="card-wrap skeleton"></div>').join("");
  try {
    const memory = getMemory();
    let names = useAi ? await getNames(key, memory, config.topic, config.count) : starterAnimals.slice(0, config.count);
    const fresh = names.filter(name => !isKnownName(name, memory));
    if (useAi && fresh.length < config.count) throw new Error(`La IA repitió nombres guardados. Intenta de nuevo.`);
    names = useAi ? fresh.slice(0, config.count) : names;
    if (useAi) names.forEach(name => memory.add(name));
    saveMemory(memory);
    updatePageTitle(config.topic);
    currentNames = names;
    currentKey = key || "";
    if (useAi) {
      try { currentDescriptions = await getDescriptions(key, names, config.topic); } catch { currentDescriptions = { ...descriptions }; }
    } else {
      currentDescriptions = { ...descriptions };
    }
    renderCards(names, key, currentDescriptions);
    updateMemoryStatus();
    shuffleButton.disabled = false;
    downloadButton.disabled = false;
  } catch (error) {
    grid.innerHTML = `<div class="error-state"><strong>No pudimos completar la expedición.</strong><span>${error.message}. Revisa tu clave e inténtalo nuevamente.</span></div>`;
    shuffleButton.disabled = false;
    downloadButton.disabled = true;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function downloadCollection() {
  if (!currentNames.length || !currentKey) return;
  downloadButton.disabled = true;
  downloadButton.textContent = "↓ Preparando descarga...";
  try {
    const images = await Promise.all(currentNames.map(async (name, index) => {
      let sourceUrl = currentImageUrls[index] || imageUrl(name, currentKey, currentConfig.model, currentConfig.topic);
      let lastError;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const response = await fetch(sourceUrl, { cache: "no-store" });
          if (!response.ok) throw new Error(`respuesta ${response.status}`);
          return blobToDataUrl(await response.blob());
        } catch (error) {
          lastError = error;
          sourceUrl = imageUrl(name, currentKey, currentConfig.model, currentConfig.topic);
          currentImageUrls[index] = sourceUrl;
        }
      }
      throw new Error(`No se pudo descargar la imagen de ${name}: ${lastError.message}`);
    }));
    const cards = currentNames.map((name, index) => `<article class="card-wrap" tabindex="0" aria-label="Tarjeta de ${escapeHtml(name)}. Haz clic para girar"><div class="card"><div class="face front"><img src="${images[index]}" alt="${escapeHtml(name)} en su hábitat natural"><span class="number">0${index + 1}</span><span class="hint">↗</span><h2>${escapeHtml(name)}</h2></div><div class="face back"><div><small>FICHA DE CAMPO · 0${index + 1}</small><h2>${escapeHtml(name)}</h2><p>${escapeHtml(currentDescriptions[name] || "Una especie salvaje fascinante, adaptada con precisión a los desafíos de su hábitat natural.")}</p></div><span class="back-foot">Toca para volver a la imagen</span></div></div></article>`).join("");
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fauna · Colección</title><style>*{box-sizing:border-box}body{margin:0;background:#f2efe8;color:#14231d;font:16px Arial,sans-serif;padding:40px}main{max-width:1100px;margin:auto}h1{font:700 56px Georgia,serif;margin:0 0 12px}header{border-bottom:1px solid #bbc1b6;padding-bottom:35px;margin-bottom:35px}.sub{color:#ed6b4e;text-transform:uppercase;letter-spacing:.16em;font-size:11px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}.card-wrap{aspect-ratio:3/4;perspective:1200px;cursor:pointer;outline:none}.card-wrap:focus-visible{outline:3px solid #ed6b4e;outline-offset:4px}.card{height:100%;width:100%;position:relative;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.2,.75,.25,1)}.card-wrap.flipped .card{transform:rotateY(180deg)}.face{position:absolute;inset:0;overflow:hidden;backface-visibility:hidden;border-radius:2px}.front{background:#bfc8ba;color:#fff}.front img{display:block;width:100%;height:100%;object-fit:cover}.front:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.1),transparent 45%,rgba(0,0,0,.7))}.number,.hint,.front h2{position:absolute;z-index:1}.number{top:17px;left:18px;font-size:11px;letter-spacing:.15em}.hint{top:15px;right:16px;width:27px;height:27px;display:grid;place-items:center;border:1px solid #fff;border-radius:50%}.front h2{left:19px;right:12px;bottom:18px;font:700 32px/1 Georgia,serif;margin:0}.back{transform:rotateY(180deg);background:#14231d;color:#f8f6f0;padding:24px 21px;display:flex;flex-direction:column;justify-content:space-between}.back small{color:#d6ed69;font-size:10px;letter-spacing:.13em}.back h2{font:700 32px/1 Georgia,serif;margin:25px 0 13px}.back p{color:#bbc5ba;line-height:1.55;font-size:13px}.back-foot{border-top:1px solid rgba(255,255,255,.2);padding-top:13px;color:#829087;font-size:10px;letter-spacing:.08em;text-transform:uppercase}@media(max-width:800px){body{padding:22px}.grid{grid-template-columns:repeat(2,1fr)}h1{font-size:42px}}@media(max-width:480px){.grid{grid-template-columns:1fr}.back{padding:18px 15px}.back h2,.front h2{font-size:27px}}</style></head><body><main><header><div class="sub">Fauna · Archivo personal</div><h1>La naturaleza no tiene límites.</h1><p>Gira cada tarjeta para descubrir su historia.</p></header><section class="grid">${cards}</section></main><script>document.querySelectorAll('.card-wrap').forEach(function(card){function flip(){card.classList.toggle('flipped')}card.addEventListener('click',flip);card.addEventListener('keydown',function(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();flip()}})})</script></body></html>`;
    const exportTitle = getTopicTitle(currentConfig.topic);
    const exportHtml = html
      .replace("<h1>La naturaleza no tiene límites.</h1>", `<h1>${escapeHtml(exportTitle[0])}<br><em>${escapeHtml(exportTitle[1])}</em></h1>`)
      .replace("</head>", `<style>.front{position:relative}.zoom-button{position:absolute;z-index:3;right:12px;bottom:12px;width:32px;height:32px;border:1px solid rgba(255,255,255,.8);border-radius:50%;background:rgba(20,35,29,.7);color:#fff;cursor:pointer;font-size:18px;line-height:1}.zoom-button:hover{background:#ed6b4e}.image-modal{position:fixed;inset:0;z-index:20;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(20,35,29,.88);cursor:pointer}.image-modal.open{display:flex}.image-modal img{max-width:min(92vw,700px);max-height:92vh;object-fit:contain;box-shadow:0 20px 70px rgba(0,0,0,.4)}</style></head>`)
      .replace("<body>", `<body><div class="image-modal" id="imageModal"><img id="zoomImage" alt="Imagen ampliada"></div>`)
      .replace("</body>", `<script>(function(){var modal=document.getElementById('imageModal');var zoomImage=document.getElementById('zoomImage');document.querySelectorAll('.card-wrap').forEach(function(card){var button=document.createElement('button');button.className='zoom-button';button.type='button';button.setAttribute('aria-label','Ampliar imagen');button.textContent='⌕';card.querySelector('.front').appendChild(button);button.addEventListener('click',function(event){event.stopPropagation();zoomImage.src=card.querySelector('.front img').src;modal.classList.add('open')})});modal.addEventListener('click',function(){modal.classList.remove('open');zoomImage.removeAttribute('src')})})()</script></body>`);
    const url = URL.createObjectURL(new Blob([exportHtml], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `fauna-coleccion-${new Date().toISOString().slice(0, 10)}.html`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert(`${error.message}. Comprueba que la API permita descargar las imágenes desde el navegador.`);
  } finally {
    downloadButton.disabled = false;
    downloadButton.textContent = "↓ Descargar colección";
  }
}

apiForm.addEventListener("submit", event => { event.preventDefault(); const key = apiKeyInput.value.trim(); if (key) { sessionStorage.setItem("pollinations-key", key); createCollection(key, true, getConfig()); } });
shuffleButton.addEventListener("click", () => { const key = sessionStorage.getItem("pollinations-key"); if (key) createCollection(key, true, getConfig()); else document.querySelector("#apiPanel").scrollIntoView({ behavior: "smooth" }); });
downloadButton.addEventListener("click", downloadCollection);
document.querySelector("#startButton").addEventListener("click", () => document.querySelector("#collectionHeading").scrollIntoView({ behavior: "smooth", block: "center" }));
apiKeyInput.value = sessionStorage.getItem("pollinations-key") || "";
updateMemoryStatus();
// La colección generada y sus imágenes solo se solicitan al enviar el formulario.
createCollection(null, false, getConfig());
