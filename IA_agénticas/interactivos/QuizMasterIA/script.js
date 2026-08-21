// ============================================================
// QuizMaster IA — script.js
// Cuestionario de repaso escolar con IA
//   · Texto:  API de Groq (BYOK) — modelo de texto predeterminado
//   · Imagen: API de Pollinations (BYOK) — selector de modelos + estilo
//   · Clon:   HTML autónomo con ilustraciones en Base64 (sin APIs)
// ============================================================

// ---------- Constantes ----------
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const IMG_MODELS_URL = 'https://gen.pollinations.ai/image/models';
const POLLINATIONS_AUTH = 'https://enter.pollinations.ai/authorize';

const FALLBACK_IMG_MODELS = [
    { name: 'flux', description: 'Flux.1 Schnell', output_modalities: ['image'], input_modalities: ['text'] },
    { name: 'turbo', description: 'Turbo', output_modalities: ['image'], input_modalities: ['text'] },
    { name: 'flux-realism', description: 'Flux Realism', output_modalities: ['image'], input_modalities: ['image', 'text'] }
];

const GROQ_MODELS = [
    { id: 'openai/gpt-oss-120b', label: 'GPT-OSS-120B (recomendado)' },
    { id: 'qwen/qwen3.6-27b', label: 'QWEN 3.6 27B (rápido)' },
    { id: 'mixtral-8x7b-32768',      label: 'Mixtral 8x7B' },
    { id: 'gemma2-9b-it',            label: 'Gemma 2 9B' }
];

const IMG_STYLES = [
    { value: 'cartoon',   label: '🎨 Cartoon educativo', suffix: 'colorful cartoon illustration for kids, flat colors, friendly educational style' },
    { value: 'watercolor',label: '🖌️ Acuarela suave',    suffix: 'soft watercolor illustration, gentle pastel colors' },
    { value: '3d',        label: '🧸 3D tipo Pixar',     suffix: 'cute 3D render, Pixar style, soft lighting' },
    { value: 'flat',      label: '🌈 Plano moderno',     suffix: 'modern flat vector illustration, vibrant gradients' },
    { value: 'realistic', label: '📷 Realista',          suffix: 'photorealistic, high detail' }
];

const LETTERS = ['A', 'B', 'C', 'D'];
const IMG_W = 768, IMG_H = 1024;   // 3:4 para el panel
const THUMB_W = 512, THUMB_H = 683; // 3:4 para el clon (Base64 ligero)

// ---------- Estado ----------
const state = {
    questions: [],
    images: {},        // índice -> dataURL
    imageStatus: [],   // 'pending' | 'loading' | 'done' | 'error'
    current: 0,
    answers: [],       // true / false por pregunta
    locked: false,
    tema: '',
    total: 0
};

// ---------- Utilidades ----------
const $ = id => document.getElementById(id);

function showToast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.display = 'none'; }, 3200);
}

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function showScreen(name) {
    ['config', 'quiz', 'results'].forEach(s => {
        $(`screen-${s}`).hidden = s !== name;
    });
}

// ---------- Claves (BYOK, solo localStorage) ----------
function saveKeys() {
    localStorage.setItem('qm_groq_key', $('groqKey').value.trim());
    localStorage.setItem('qm_poll_key', $('pollKey').value.trim());
    localStorage.setItem('qm_groq_model', $('groqModel').value);
    localStorage.setItem('qm_poll_model', $('imgModel').value);
    localStorage.setItem('qm_img_style', $('imgStyle').value);
}

function loadKeys() {
    const g = localStorage.getItem('qm_groq_key');
    const p = localStorage.getItem('qm_poll_key');
    if (g) $('groqKey').value = g;
    if (p) $('pollKey').value = p;
    const gm = localStorage.getItem('qm_groq_model');
    if (gm) $('groqModel').value = gm;
    const pm = localStorage.getItem('qm_poll_model');
    if (pm) $('imgModel').value = pm;
    const is = localStorage.getItem('qm_img_style');
    if (is) $('imgStyle').value = is;
}

function handleAuthHash() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const key = params.get('api_key');
    if (key) {
        $('pollKey').value = key;
        localStorage.setItem('qm_poll_key', key);
        window.history.replaceState(null, '', window.location.pathname);
        setTimeout(() => showToast('🔑 API Key de Pollinations obtenida'), 500);
    }
}

// ---------- Selectores ----------
function populateGroqModels() {
    const sel = $('groqModel');
    sel.innerHTML = '';
    GROQ_MODELS.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.label;
        sel.appendChild(opt);
    });
}

function populateImgStyles() {
    const sel = $('imgStyle');
    sel.innerHTML = '';
    IMG_STYLES.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.value;
        opt.textContent = s.label;
        sel.appendChild(opt);
    });
}

async function fetchImageModels() {
    populateModelSelect(FALLBACK_IMG_MODELS);
    try {
        const res = await fetch(IMG_MODELS_URL);
        if (!res.ok) throw new Error('bad status');
        const models = await res.json();
        populateModelSelect(models);
    } catch (e) {
        console.warn('Usando modelos de imagen de respaldo');
    }
}

function populateModelSelect(models) {
    const sel = $('imgModel');
    const prev = sel.value;
    sel.innerHTML = '';
    const toShow = (Array.isArray(models) ? models : []).filter(m =>
        m && m.name && (!m.output_modalities || m.output_modalities.includes('image'))
    );
    toShow.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        sel.appendChild(opt);
    });
    if (prev && sel.querySelector(`option[value="${prev}"]`)) {
        sel.value = prev;
    }
    const statusEl = $('model-status');
    if (toShow.length > 0) {
        statusEl.style.display = 'block';
        statusEl.textContent = `✅ ${toShow.length} modelo(s) de imagen disponibles`;
    }
}

// ---------- Generación del cuestionario ----------
function clampNum(v) {
    let n = parseInt(v, 10);
    if (isNaN(n)) n = 5;
    return Math.max(1, Math.min(15, n));
}

function setGenerating(on, msg) {
    const btn = $('btnGenerate');
    const st = $('genStatus');
    btn.disabled = on;
    st.style.display = on ? 'block' : 'none';
    if (msg) st.textContent = msg;
}

async function generateQuiz() {
    const tema = $('temaInput').value.trim() || 'Cultura general';
    const n = clampNum($('numQuestions').value);
    const gkey = $('groqKey').value.trim();
    const pkey = $('pollKey').value.trim();

    if (!gkey) { showToast('⚠️ Ingresa tu API Key de Groq (BYOK)'); $('groqKey').focus(); return; }
    if (!pkey) { showToast('⚠️ Ingresa tu API Key de Pollinations (BYOK)'); $('pollKey').focus(); return; }

    saveKeys();
    setGenerating(true, '🧠 Generando preguntas con IA…');

    try {
        state.tema = tema; // disponible para sanitizeQuestion()
        const questions = await fetchQuestions(tema, n, gkey);
        if (!questions.length) throw new Error('Groq no devolvió preguntas válidas.');

        state.questions = questions;
        state.total = questions.length;
        state.current = 0;
        state.answers = new Array(questions.length).fill(null);
        state.images = {};
        state.imageStatus = questions.map(() => 'pending');

        setGenerating(false);
        showScreen('quiz');
        renderQuestion();

        // Generar ilustraciones en segundo plano (3 en paralelo)
        generateAllImages(pkey);
    } catch (err) {
        console.error(err);
        setGenerating(false);
        showToast('❌ No se pudo generar el cuestionario: ' + err.message);
    }
}

// ---------- Llamada a Groq (modelo de texto) ----------
async function fetchQuestions(tema, n, key) {
    const system = `Eres un profesor experto que crea cuestionarios de repaso escolar para estudiantes de secundaria y bachillerato.
Responde SIEMPRE con un JSON válido, sin texto adicional, con esta estructura exacta:
{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"...","imagePrompt":"..."}]}

Reglas:
1. Genera exactamente ${n} preguntas de opción múltiple con 4 opciones (A, B, C, D) sobre el tema: "${tema}".
2. Lenguaje claro, sencillo y apropiado para el nivel escolar.
3. "correctIndex" es el índice (0 a 3) de la opción correcta. Varía la posición de la respuesta correcta entre preguntas.
4. "explanation": explicación pedagógica breve (2 o 3 frases) de por qué la respuesta correcta lo es.
5. "imagePrompt": descripción corta EN INGLÉS de una ilustración educativa vertical para la pregunta, SIN texto ni letras en la imagen.`;

    const user = `Tema: ${tema}\nNúmero de preguntas: ${n}\nGenera el JSON.`;

    const body = {
        model: $('groqModel').value || GROQ_MODELS[0].id,
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: user }
        ],
        temperature: 0.7,
        max_tokens: 5000
    };

    // 1) Intentar con modo JSON; 2) reintentar sin él si el modelo no lo soporta
    const makeRequest = withJsonMode => {
        const payload = { ...body };
        if (withJsonMode) payload.response_format = { type: 'json_object' };
        return fetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + key
            },
            body: JSON.stringify(payload)
        });
    };

    let res = await makeRequest(true);
    if (!res.ok && (res.status === 400 || res.status === 422)) {
        console.warn('Modo JSON no soportado, reintentando sin él');
        res = await makeRequest(false);
    }

    if (!res.ok) {
        const detail = (await res.text()).slice(0, 300);
        throw new Error(`Groq respondió ${res.status}: ${detail}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const json = extractJson(content);
    const arr = Array.isArray(json?.questions) ? json.questions.slice(0, n) : [];
    return arr.map(q => sanitizeQuestion(q)).filter(Boolean);
}

function extractJson(text) {
    const t = (text || '').trim();
    try { return JSON.parse(t); } catch (e) { /* sigue */ }
    const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
        try { return JSON.parse(fenced[1].trim()); } catch (e) { /* sigue */ }
    }
    const start = t.indexOf('{');
    const end = t.lastIndexOf('}');
    if (start !== -1 && end > start) {
        try { return JSON.parse(t.slice(start, end + 1)); } catch (e) { /* sigue */ }
    }
    throw new Error('No se pudo interpretar la respuesta de Groq como JSON.');
}

function sanitizeQuestion(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const question = String(raw.question || '').trim();
    if (!question) return null;
    let options = Array.isArray(raw.options)
        ? raw.options.map(o => String(o).trim()).filter(Boolean)
        : [];
    if (options.length < 4) return null;
    options = options.slice(0, 4);
    let ci = parseInt(raw.correctIndex, 10);
    if (isNaN(ci) || ci < 0 || ci > 3) ci = 0;
    const explanation = String(raw.explanation || '').trim() ||
        `La respuesta correcta es la opción ${LETTERS[ci]}: ${options[ci]}.`;
    const imagePrompt = String(raw.imagePrompt || '').trim() ||
        `${state.tema}: ${question}`;
    return { question, options, correctIndex: ci, explanation, imagePrompt };
}

// ---------- Render de pregunta ----------
function renderQuestion() {
    const q = state.questions[state.current];
    const total = state.total;

    $('progressText').textContent = `Pregunta ${state.current + 1} de ${total}`;
    $('progressFill').style.width = `${(state.current / total) * 100}%`;
    $('qTopic').textContent = `📚 ${state.tema}`;
    $('qText').textContent = q.question;

    const box = $('optionsBox');
    box.innerHTML = '';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.type = 'button';

        const letter = document.createElement('span');
        letter.className = 'opt-letter';
        letter.textContent = LETTERS[i];

        const text = document.createElement('span');
        text.textContent = opt;

        btn.appendChild(letter);
        btn.appendChild(text);
        btn.addEventListener('click', () => selectOption(i, btn));
        box.appendChild(btn);
    });

    $('explanationBox').classList.remove('open');
    $('expText').textContent = q.explanation;
    $('nextBtn').style.display = 'none';
    state.locked = false;

    updateImagePanel();
}

function selectOption(idx, btn) {
    if (state.locked) return;
    state.locked = true;

    const q = state.questions[state.current];
    const correct = q.correctIndex;
    const isCorrect = idx === correct;
    state.answers[state.current] = isCorrect;

    document.querySelectorAll('.option-btn').forEach((b, i) => {
        b.disabled = true;
        b.classList.add(i === correct ? 'correct' : 'wrong');
        if (i === correct) b.querySelector('.opt-letter').textContent = '✓';
        else if (i === idx) b.querySelector('.opt-letter').textContent = '✗';
        else b.querySelector('.opt-letter').textContent = LETTERS[i];
    });

    if (isCorrect) btn.classList.add('picked-correct');
    else btn.classList.add('picked-wrong');

    $('expText').textContent = q.explanation;
    $('explanationBox').classList.add('open');

    const last = state.current === state.total - 1;
    $('nextBtn').textContent = last ? '🏁 Ver resultados' : 'Siguiente ➜';
    $('nextBtn').style.display = 'block';
}

function nextQuestion() {
    if (state.current < state.total - 1) {
        state.current++;
        renderQuestion();
    } else {
        showResults();
    }
}

// ---------- Ilustraciones Pollinations (3:4) ----------
function buildImagePrompt(q, style) {
    return `Educational illustration, vertical composition, ${style.suffix}. Scene about: ${q.imagePrompt}. Topic: ${state.tema}. No text, no words, no letters, no watermark, no captions.`;
}

function buildImageUrl(prompt, key, model) {
    const seed = Math.floor(Math.random() * 100000);
    return `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?key=${encodeURIComponent(key)}&model=${encodeURIComponent(model)}&width=${IMG_W}&height=${IMG_H}&seed=${seed}&nologo=true`;
}

async function generateAllImages(pkey) {
    const model = $('imgModel').value;
    const style = IMG_STYLES.find(s => s.value === $('imgStyle').value) || IMG_STYLES[0];
    const total = state.questions.length;

    const tasks = state.questions.map((q, i) => async () => {
        state.imageStatus[i] = 'loading';
        updateImagePanel();
        const prompt = buildImagePrompt(q, style);
        const url = buildImageUrl(prompt, pkey, model);
        const dataUrl = await urlToDataUrl(url);
        state.images[i] = dataUrl || placeholderDataUrl(q);
        state.imageStatus[i] = dataUrl ? 'done' : 'error';
        refreshImgCount();
        updateImagePanel();
    });

    await runPool(tasks, 3);
    refreshImgCount();
}

async function runPool(tasks, concurrency) {
    let i = 0;
    const runners = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
        while (i < tasks.length) {
            const j = i++;
            await tasks[j]();
        }
    });
    await Promise.all(runners);
}

async function urlToDataUrl(url) {
    let dataUrl = null;
    try {
        const res = await fetch(url);
        if (res.ok) {
            const blob = await res.blob();
            dataUrl = await blobToDataUrl(blob);
        }
    } catch (e) { /* reintenta con canvas */ }

    if (!dataUrl) {
        try {
            const img = await loadImageEl(url);
            dataUrl = drawToDataUrl(img, IMG_W, IMG_H);
        } catch (e) { dataUrl = null; }
    }

    if (!dataUrl) return null;

    // Estandarizar: JPEG 512x683 (3:4) para que el clon sea ligero
    try {
        const img = await loadImageEl(dataUrl);
        return drawToDataUrl(img, THUMB_W, THUMB_H);
    } catch (e) {
        return dataUrl;
    }
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = () => reject(new Error('FileReader error'));
        fr.readAsDataURL(blob);
    });
}

function loadImageEl(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = src;
    });
}

function drawToDataUrl(img, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return canvas.toDataURL('image/jpeg', 0.82);
}

function placeholderDataUrl(q) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="683">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#ec4899"/>
</linearGradient></defs>
<rect width="512" height="683" fill="url(#g)"/>
<text x="256" y="330" font-size="80" text-anchor="middle">🎨</text>
<text x="256" y="420" font-size="26" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="bold">Ilustración no disponible</text>
</svg>`;
    const bytes = new TextEncoder().encode(svg);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return 'data:image/svg+xml;base64,' + btoa(bin);
}

function refreshImgCount() {
    const done = state.imageStatus.filter(s => s === 'done' || s === 'error').length;
    $('imgCount').textContent = `🖼️ Imágenes: ${done}/${state.total}`;
}

function updateImagePanel() {
    const panel = $('imagePanel');
    const img = $('qImage');
    const i = state.current;
    if (state.imageStatus[i] === 'done' || state.imageStatus[i] === 'error') {
        img.src = state.images[i];
        panel.classList.remove('loading');
    } else {
        panel.classList.add('loading');
    }
}

// ---------- Resultados ----------
function motivationFor(pct) {
    if (pct === 100) return '¡PERFECTO! 🏆 Dominas el tema por completo.';
    if (pct >= 80) return '¡Excelente trabajo! 🌟 Estás muy cerca de la maestría.';
    if (pct >= 60) return '¡Muy bien! 💪 Buen dominio. Sigue repasando para llegar al 100%.';
    if (pct >= 40) return '¡Buen intento! 📚 Repasa las preguntas falladas y vuelve a intentarlo.';
    return '¡No te rindas! 🌱 Cada error es una oportunidad para aprender. ¡Tú puedes!';
}

function emojiFor(pct) {
    if (pct === 100) return '🏆';
    if (pct >= 80) return '🌟';
    if (pct >= 60) return '💪';
    if (pct >= 40) return '📚';
    return '🌱';
}

function showResults() {
    showScreen('results');
    const correct = state.answers.filter(a => a === true).length;
    const pct = Math.round((correct / state.total) * 100);
    const deg = Math.round(pct * 3.6);

    $('scoreNum').textContent = correct;
    $('scoreTotal').textContent = `/ ${state.total}`;
    $('scorePct').textContent = `Acertaste ${correct} de ${state.total} preguntas · ${pct}%`;
    $('scoreRing').style.background = `conic-gradient(#22c55e ${deg}deg, #eef2ff 0deg)`;
    $('scoreEmoji').textContent = emojiFor(pct);
    $('motivationText').textContent = motivationFor(pct);

    refreshImgCount();
}

// ---------- Clon descargable (Base64, sin APIs) ----------
function buildCloneHTML() {
    const data = {
        app: 'QuizMaster IA',
        tema: state.tema,
        questions: state.questions.map((q, i) => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            image: state.images[i] || placeholderDataUrl(q)
        }))
    };
    // Evitar que "</script>" dentro de los textos rompa el clon
    const dataJson = JSON.stringify(data).replace(/</g, '\\u003c');

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>QuizMaster IA — ${esc(state.tema)}</title>
<style>
${CLONE_CSS}
</style>
</head>
<body>
<header class="head"><div class="logo">🧠</div><h1>QuizMaster <span class="grad">IA</span></h1></header>
<div id="quizView">
  <div class="qhead">
    <span id="pText"></span>
    <div class="bar"><div id="pFill"></div></div>
  </div>
  <div class="qbody">
    <div class="qimg-wrap"><img id="qImg" alt="Ilustración de la pregunta"></div>
    <div class="qside">
      <span id="qTopic" class="topic"></span>
      <h2 id="qText"></h2>
      <div id="options"></div>
      <div class="exp" id="expBox">
        <button class="exp-toggle" id="expToggle" type="button">💡 Ver explicación</button>
        <div class="exp-content"><p id="expText"></p></div>
      </div>
      <button id="nextBtn" class="next-btn" type="button" hidden>Siguiente ➜</button>
    </div>
  </div>
</div>
<div id="resultView" style="display:none">
  <div class="result-card">
    <div class="ring" id="ring"><div class="ring-in"><span id="scoreBig"></span></div></div>
    <div class="emoji" id="emoji"></div>
    <h2 id="motivation"></h2>
    <p class="score-pct" id="scoreLine"></p>
    <button class="next-btn" id="againBtn" type="button" style="width:100%">🔄 Repetir cuestionario</button>
  </div>
</div>
<script>
(function(){
var DATA = ${dataJson};
${CLONE_JS}
})();
<\/script>
</body>
</html>`;
}

function downloadClone() {
    if (!state.questions.length) { showToast('⚠️ Genera primero un cuestionario'); return; }
    const html = buildCloneHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `QuizMaster_${state.tema.replace(/[^a-z0-9áéíóúñü\s-]/gi, '').trim().replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    showToast('✅ Clon del cuestionario descargado (imágenes en Base64)');
}

// CSS del clon (autocontenido, sin fuentes externas)
const CLONE_CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', system-ui, Arial, sans-serif; background: linear-gradient(160deg, #f4f6ff, #fdf4ff, #f0fdf4); min-height: 100vh; color: #1e293b; padding: 16px; }
.head { max-width: 920px; margin: 0 auto 14px; display: flex; align-items: center; gap: 10px; background: #fff; border-radius: 16px; padding: 12px 18px; box-shadow: 0 6px 18px rgba(30,41,59,.08); }
.logo { font-size: 30px; }
.head h1 { font-size: 20px; font-weight: 800; }
.grad { background: linear-gradient(90deg, #6366f1, #ec4899); -webkit-background-clip: text; background-clip: text; color: transparent; }
.qhead { max-width: 920px; margin: 0 auto 12px; display: flex; flex-direction: column; gap: 8px; font-weight: 700; font-size: 14px; color: #4338ca; }
.bar { height: 10px; background: #eef2ff; border-radius: 99px; overflow: hidden; }
#pFill { height: 100%; width: 0; background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 99px; transition: width .4s; }
.qbody { display: flex; gap: 16px; background: #fff; border-radius: 20px; padding: 16px; box-shadow: 0 10px 30px rgba(30,41,59,.10); max-width: 920px; margin: 0 auto; }
.qimg-wrap { width: 300px; flex-shrink: 0; aspect-ratio: 3 / 4; border-radius: 14px; overflow: hidden; background: #f1f5f9; box-shadow: inset 0 0 0 3px #fff, 0 6px 16px rgba(30,41,59,.10); }
.qimg-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
.qside { flex: 1; display: flex; flex-direction: column; gap: 12px; }
.topic { align-self: flex-start; background: linear-gradient(135deg, #eef2ff, #fce7f3); color: #4338ca; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 99px; }
#qText { font-size: 19px; line-height: 1.4; }
#options { display: flex; flex-direction: column; gap: 10px; }
.opt { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; padding: 11px 14px; border: 2px solid #e2e8f0; border-radius: 12px; background: #fff; cursor: pointer; font-size: 15px; font-family: inherit; color: #1e293b; transition: border-color .15s, background .15s; }
.opt:hover:not(:disabled) { border-color: #a5b4fc; background: #f5f7ff; }
.opt .ltr { min-width: 30px; height: 30px; border-radius: 8px; background: #eef2ff; color: #4338ca; display: flex; align-items: center; justify-content: center; font-weight: 800; }
.opt.correct { border-color: #22c55e; background: #f0fdf4; }
.opt.correct .ltr { background: #22c55e; color: #fff; }
.opt.wrong { border-color: #f87171; background: #fef2f2; }
.opt.wrong .ltr { background: #ef4444; color: #fff; }
.opt.picked { border-width: 3px; }
.opt:disabled { cursor: default; opacity: .95; }
.exp { border: 2px dashed #c7d2fe; border-radius: 12px; overflow: hidden; background: #fafaff; }
.exp-toggle { width: 100%; background: linear-gradient(135deg, #eef2ff, #fce7f3); border: none; padding: 10px; font-weight: 800; font-size: 13px; color: #4338ca; cursor: pointer; font-family: inherit; }
.exp-content { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s ease; }
.exp-content p { overflow: hidden; padding: 0 12px; font-size: 14px; line-height: 1.55; color: #334155; }
.exp.open .exp-content { grid-template-rows: 1fr; }
.exp.open .exp-content p { padding: 4px 12px 12px; }
.next-btn { background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); color: #fff; border: none; border-radius: 12px; padding: 13px; font-size: 15px; font-weight: 800; cursor: pointer; font-family: inherit; }
.next-btn:hover { filter: brightness(1.08); }
.result-card { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 24px; padding: 36px; text-align: center; box-shadow: 0 12px 40px rgba(30,41,59,.12); }
.ring { width: 160px; height: 160px; border-radius: 50%; background: conic-gradient(#22c55e 0deg, #eef2ff 0deg); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.ring-in { width: 120px; height: 120px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; }
.ring-in span { font-size: 30px; font-weight: 900; }
.emoji { font-size: 56px; margin-bottom: 6px; }
.result-card h2 { font-size: 20px; margin-bottom: 6px; }
.score-pct { color: #64748b; font-weight: 700; margin-bottom: 18px; }
@media (max-width: 760px) { .qbody { flex-direction: column; } .qimg-wrap { width: 100%; aspect-ratio: 3 / 4; max-height: 320px; } }
`;

// JS del clon (sin plantillas ni APIs: solo DOM)
const CLONE_JS = `
var idx = 0, score = 0, locked = false;
var LETTERS = ['A', 'B', 'C', 'D'];
var $ = function (id) { return document.getElementById(id); };

function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
}

function motivation(pct) {
    if (pct === 100) return { e: '🏆', t: '¡PERFECTO! Dominas el tema por completo.' };
    if (pct >= 80) return { e: '🌟', t: '¡Excelente trabajo! Estás muy cerca de la maestría.' };
    if (pct >= 60) return { e: '💪', t: '¡Muy bien! Buen dominio. Sigue repasando.' };
    if (pct >= 40) return { e: '📚', t: '¡Buen intento! Repasa lo fallado y vuelve a intentarlo.' };
    return { e: '🌱', t: '¡No te rindas! Cada error es una oportunidad de aprender.' };
}

function render() {
    var q = DATA.questions[idx];
    var total = DATA.questions.length;
    $('pText').textContent = 'Pregunta ' + (idx + 1) + ' de ' + total;
    $('pFill').style.width = ((idx / total) * 100) + '%';
    $('qImg').src = q.image;
    $('qTopic').textContent = '📚 ' + DATA.tema;
    $('qText').textContent = q.question;

    var box = $('options');
    box.innerHTML = '';
    q.options.forEach(function (opt, i) {
        var b = el('button', 'opt');
        var l = el('span', 'ltr', LETTERS[i]);
        var t = el('span', '', opt);
        b.appendChild(l);
        b.appendChild(t);
        b.addEventListener('click', function () { pick(i, b); });
        box.appendChild(b);
    });

    $('expBox').classList.remove('open');
    $('expText').textContent = q.explanation;
    $('nextBtn').hidden = true;
    locked = false;
}

function pick(i, btn) {
    if (locked) return;
    locked = true;
    var q = DATA.questions[idx];
    var correct = q.correctIndex;
    var btns = document.querySelectorAll('.opt');
    btns.forEach(function (b, j) {
        b.disabled = true;
        b.classList.add(j === correct ? 'correct' : 'wrong');
        if (j === correct) b.querySelector('.ltr').textContent = '✓';
        else if (j === i) b.querySelector('.ltr').textContent = '✗';
        else b.querySelector('.ltr').textContent = LETTERS[j];
        if (j === i) b.classList.add('picked');
    });
    if (i === correct) score++;
    $('expBox').classList.add('open');
    var last = idx === DATA.questions.length - 1;
    $('nextBtn').textContent = last ? '🏁 Ver resultados' : 'Siguiente ➜';
    $('nextBtn').hidden = false;
}

function finish() {
    $('quizView').style.display = 'none';
    $('resultView').style.display = 'block';
    var total = DATA.questions.length;
    var pct = Math.round((score / total) * 100);
    $('scoreBig').textContent = score + ' / ' + total;
    $('ring').style.background = 'conic-gradient(#22c55e ' + (pct * 3.6) + 'deg, #eef2ff 0deg)';
    var m = motivation(pct);
    $('emoji').textContent = m.e;
    $('motivation').textContent = m.t;
    $('scoreLine').textContent = 'Acertaste ' + score + ' de ' + total + ' preguntas (' + pct + '%).';
}

$('expToggle').addEventListener('click', function () { $('expBox').classList.toggle('open'); });
$('nextBtn').addEventListener('click', function () {
    if (idx < DATA.questions.length - 1) { idx++; render(); } else { finish(); }
});
$('againBtn').addEventListener('click', function () {
    idx = 0; score = 0; locked = false;
    $('resultView').style.display = 'none';
    $('quizView').style.display = 'block';
    render();
});

render();
`;

// ---------- Inicialización ----------
async function init() {
    populateGroqModels();
    populateImgStyles();
    await fetchImageModels(); // primero poblar el selector de imágenes
    loadKeys();
    handleAuthHash();

    // Eventos
    $('btnGenerate').addEventListener('click', generateQuiz);
    $('groqKeyHelp').addEventListener('click', () => window.open('https://console.groq.com/keys', '_blank', 'noopener'));
    $('pollKeyHelp').addEventListener('click', () => {
        const redirectUrl = window.location.href.split('#')[0];
        window.location.href = `${POLLINATIONS_AUTH}?redirect_url=${encodeURIComponent(redirectUrl)}`;
    });
    $('expToggle').addEventListener('click', () => $('explanationBox').classList.toggle('open'));
    $('nextBtn').addEventListener('click', nextQuestion);
    $('btnExit').addEventListener('click', () => { showScreen('config'); });
    $('retryBtn').addEventListener('click', () => { showScreen('config'); });
    $('downloadBtn').addEventListener('click', downloadClone);

    $('numQuestions').addEventListener('blur', e => { e.target.value = clampNum(e.target.value); });
    $('numQuestions').addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.target.blur(); generateQuiz(); }
    });
    $('temaInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') generateQuiz();
    });

    // Guardar claves al escribir (sin pausas innecesarias)
    ['groqKey', 'pollKey'].forEach(id => {
        $(id).addEventListener('change', saveKeys);
    });
    ['groqModel', 'imgModel', 'imgStyle'].forEach(id => {
        $(id).addEventListener('change', saveKeys);
    });
}

document.addEventListener('DOMContentLoaded', init);
