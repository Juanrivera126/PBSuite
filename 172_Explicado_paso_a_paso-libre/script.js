// Variables globales para el tutorial
let currentTopic = '';

// Función segura para obtener elementos del DOM
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Elemento con ID '${id}' no encontrado en el DOM`);
    }
    return element;
}

// Función segura para establecer el contenido de texto
function safeSetTextContent(element, text) {
    if (element) {
        element.textContent = text;
        return true;
    }
    return false;
}

// Función segura para establecer el estilo de visualización
function safeSetDisplay(element, displayValue) {
    if (element) {
        element.style.display = displayValue;
        return true;
    }
    return false;
}

// Función segura para establecer el estado de deshabilitado
function safeSetDisabled(element, isDisabled) {
    if (element) {
        element.disabled = isDisabled;
        return true;
    }
    return false;
}

// Inicializar elementos del DOM de forma segura
const topicInput = safeGetElement('topicInput');
const expertInput = safeGetElement('expertInput');
const paletteSelect = safeGetElement('paletteSelect');
const artStyleSelect = safeGetElement('artStyleSelect');
const imageModelSelect = safeGetElement('imageModelSelect');
const textModelSelect = safeGetElement('textModelSelect');
const includeMathjaxCheckbox = safeGetElement('includeMathjaxCheckbox');
const generateTutorialBtn = safeGetElement('generateTutorialBtn');
const tutorialContainer = safeGetElement('tutorialContainer');
const themeToggleBtn = safeGetElement('themeToggleBtn');
const loadingIndicator = safeGetElement('loadingIndicator');
const tutorialHeaderActions = safeGetElement('tutorialHeaderActions');
const postGenerationControls = safeGetElement('postGenerationControls');
const downloadHtmlBtn = safeGetElement('downloadHtmlBtn');
const downloadWordBtn = safeGetElement('downloadWordBtn');
const resetBtn = safeGetElement('resetBtn');
const designPalettes = [
    { name: 'Oceanic', light: { bg: '#e0f7fa', text: '#004d40', primary: '#00796b', secondary: '#004d40', card: '#ffffff', border: '#b2dfdb', accent: '#ff6f00', shadow: 'rgba(0, 77, 64, 0.15)', success: '#2e7d32', error: '#c62828' }, dark: { bg: '#00251a', text: '#b2dfdb', primary: '#4db6ac', secondary: '#80cbc4', card: '#003d33', border: '#004d40', accent: '#ffa000', shadow: 'rgba(77, 182, 172, 0.2)', success: '#81c784', error: '#ef9a9a' } },
    { name: 'Sunset', light: { bg: '#fff3e0', text: '#4e342e', primary: '#ff7043', secondary: '#f4511e', card: '#ffffff', border: '#ffccbc', accent: '#0277bd', shadow: 'rgba(244, 81, 30, 0.15)', success: '#388e3c', error: '#d32f2f' }, dark: { bg: '#261a13', text: '#ffccbc', primary: '#ff8a65', secondary: '#ffab91', card: '#3e2723', border: '#5d4037', accent: '#4fc3f7', shadow: 'rgba(255, 138, 101, 0.2)', success: '#a5d6a7', error: '#ffab91' } },
    { name: 'Forest', light: { bg: '#e8f5e9', text: '#1b5e20', primary: '#4caf50', secondary: '#2e7d32', card: '#ffffff', border: '#c8e6c9', accent: '#ffc107', shadow: 'rgba(46, 125, 50, 0.15)', success: '#2e7d32', error: '#c62828' }, dark: { bg: '#0c1f0d', text: '#c8e6c9', primary: '#81c784', secondary: '#a5d6a7', card: '#1b3e1d', border: '#2e7d32', accent: '#ffd54f', shadow: 'rgba(129, 199, 132, 0.2)', success: '#81c784', error: '#ef9a9a' } },
    { name: 'Royal Purple', light: { bg: '#ede7f6', text: '#311b92', primary: '#673ab7', secondary: '#4527a0', card: '#ffffff', border: '#d1c4e9', accent: '#ffc107', shadow: 'rgba(69, 39, 160, 0.15)', success: '#4caf50', error: '#e53935' }, dark: { bg: '#1a0033', text: '#d1c4e9', primary: '#9575cd', secondary: '#b39ddb', card: '#2c1a4c', border: '#4527a0', accent: '#ffd54f', shadow: 'rgba(149, 117, 205, 0.2)', success: '#81c784', error: '#ef9a9a' } },
    { name: 'Crimson Night', light: { bg: '#ffebee', text: '#b71c1c', primary: '#d32f2f', secondary: '#c62828', card: '#ffffff', border: '#ffcdd2', accent: '#1976d2', shadow: 'rgba(198, 40, 40, 0.15)', success: '#388e3c', error: '#d32f2f' }, dark: { bg: '#3e0000', text: '#ffcdd2', primary: '#ef5350', secondary: '#e57373', card: '#540000', border: '#c62828', accent: '#64b5f6', shadow: 'rgba(239, 83, 80, 0.2)', success: '#a5d6a7', error: '#ef9a9a' } },
    { name: 'Golden Sands', light: { bg: '#fff8e1', text: '#424242', primary: '#ffab00', secondary: '#ff8f00', card: '#ffffff', border: '#ffecb3', accent: '#006064', shadow: 'rgba(255, 143, 0, 0.15)', success: '#4caf50', error: '#f44336' }, dark: { bg: '#212121', text: '#ffecb3', primary: '#ffd180', secondary: '#ffe0b2', card: '#303030', border: '#ff8f00', accent: '#4dd0e1', shadow: 'rgba(255, 209, 128, 0.2)', success: '#81c784', error: '#ff8a80' } },
    { name: 'Minty Fresh', light: { bg: '#e0f2f1', text: '#004d40', primary: '#00897b', secondary: '#00695c', card: '#ffffff', border: '#b2dfdb', accent: '#ef6c00', shadow: 'rgba(0, 105, 92, 0.15)', success: '#43a047', error: '#d81b60' }, dark: { bg: '#00251e', text: '#b2dfdb', primary: '#4db6ac', secondary: '#80cbc4', card: '#003d33', border: '#00695c', accent: '#ffa726', shadow: 'rgba(77, 182, 172, 0.2)', success: '#81c784', error: '#f06292' } },
    { name: 'Graphite Lime', light: { bg: '#f9fbe7', text: '#333333', primary: '#c0ca33', secondary: '#afb42b', card: '#ffffff', border: '#e6ee9c', accent: '#d84315', shadow: 'rgba(175, 180, 43, 0.15)', success: '#558b2f', error: '#c62828' }, dark: { bg: '#1b1b1b', text: '#e6ee9c', primary: '#d4e157', secondary: '#e6ee9c', card: '#2d2d2d', border: '#afb42b', accent: '#ff7043', shadow: 'rgba(212, 225, 87, 0.2)', success: '#aed581', error: '#ef9a9a' } },
    { name: 'Rose Quartz', light: { bg: '#fce4ec', text: '#560027', primary: '#ec407a', secondary: '#ad1457', card: '#ffffff', border: '#f8bbd0', accent: '#00acc1', shadow: 'rgba(173, 20, 87, 0.15)', success: '#4caf50', error: '#d32f2f' }, dark: { bg: '#310011', text: '#f8bbd0', primary: '#f06292', secondary: '#f48fb1', card: '#420019', border: '#ad1457', accent: '#4dd0e1', shadow: 'rgba(240, 98, 146, 0.2)', success: '#a5d6a7', error: '#ff8a80' } },
    { name: 'Steel Blue', light: { bg: '#e3f2fd', text: '#0d47a1', primary: '#1976d2', secondary: '#1565c0', card: '#ffffff', border: '#bbdefb', accent: '#f57c00', shadow: 'rgba(21, 101, 192, 0.15)', success: '#2e7d32', error: '#c62828' }, dark: { bg: '#0a1f33', text: '#bbdefb', primary: '#64b5f6', secondary: '#90caf9', card: '#112e4a', border: '#1565c0', accent: '#ffa726', shadow: 'rgba(100, 181, 246, 0.2)', success: '#81c784', error: '#ef9a9a' } }
];
const fontFamilies = ["'Roboto', 'Helvetica Neue', Arial, sans-serif", "'Open Sans', 'Segoe UI', Tahoma, sans-serif", "'Lato', 'Lucida Grande', Verdana, sans-serif", "'Montserrat', 'Impact', sans-serif", "'Nunito', 'Verdana', Geneva, sans-serif"];

function applyDesign(palette, font) {
    if (!palette) {
        console.warn("Attempted to apply an undefined palette. Using default.");
        palette = designPalettes[0];
    }
    document.documentElement.style.setProperty('--bg-color-light', palette.light.bg);
    document.documentElement.style.setProperty('--text-color-light', palette.light.text);
    document.documentElement.style.setProperty('--primary-color-light', palette.light.primary);
    document.documentElement.style.setProperty('--secondary-color-light', palette.light.secondary);
    document.documentElement.style.setProperty('--card-bg-light', palette.light.card);
    document.documentElement.style.setProperty('--border-color-light', palette.light.border);
    document.documentElement.style.setProperty('--accent-color-light', palette.light.accent);
    document.documentElement.style.setProperty('--shadow-color-light', palette.light.shadow);
    document.documentElement.style.setProperty('--success-color-light', palette.light.success);
    document.documentElement.style.setProperty('--error-color-light', palette.light.error);

    document.documentElement.style.setProperty('--bg-color-dark', palette.dark.bg);
    document.documentElement.style.setProperty('--text-color-dark', palette.dark.text);
    document.documentElement.style.setProperty('--primary-color-dark', palette.dark.primary);
    document.documentElement.style.setProperty('--secondary-color-dark', palette.dark.secondary);
    document.documentElement.style.setProperty('--card-bg-dark', palette.dark.card);
    document.documentElement.style.setProperty('--border-color-dark', palette.dark.border);
    document.documentElement.style.setProperty('--accent-color-dark', palette.dark.accent);
    document.documentElement.style.setProperty('--shadow-color-dark', palette.dark.shadow);
    document.documentElement.style.setProperty('--success-color-dark', palette.dark.success);
    document.documentElement.style.setProperty('--error-color-dark', palette.dark.error);

    document.documentElement.style.setProperty('--primary-color-light_alpha', hexToRgba(palette.light.primary, 0.3));
    document.documentElement.style.setProperty('--primary-color-dark_alpha', hexToRgba(palette.dark.primary, 0.3));
    if (document.body) {
        // En los nuevos temas las fuentes fijas de Google Fonts anulan el valor de fontFamilies aleatorio
        if (!document.body.className.match(/theme-(educativo|infantil|cientifico)/)) {
            document.body.style.fontFamily = font;
        } else {
            document.body.style.fontFamily = ''; // Deja que aplique el font-family del CSS de la clase
        }
    }
}
function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== 'string' || hex.length < 6) {
        console.warn("Invalid hex color for hexToRgba:", hex);
        return `rgba(0,0,0,${alpha})`;
    }
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function populatePaletteSelector() {
    if (paletteSelect && designPalettes) {
        paletteSelect.innerHTML = '';
        designPalettes.forEach(palette => {
            const option = document.createElement('option');
            option.value = palette.name;
            option.textContent = palette.name;
            paletteSelect.appendChild(option);
        });
    }
}
populatePaletteSelector();

const artStyles = [
    { value: 'default', label: 'Predeterminado' },
    { value: 'moderno', label: 'Moderno' },
    { value: 'corporativo', label: 'Corporativo' },
    { value: 'creativo', label: 'Creativo' },
    { value: 'minimalista', label: 'Minimalista' },
    { value: 'glass', label: 'Glassmorphism' },
    { value: 'darkneon', label: 'Dark Neón' },
    { value: 'brutalista', label: 'Brutalista' },
    { value: 'vibrante', label: 'Gradiente Vibrante' },
    { value: 'editorial', label: 'Editorial / Revista' },
    { value: 'terminal', label: 'Terminal / Tech' },
    { value: 'infografico', label: 'Infográfico Colorido' },
    { value: 'retro', label: 'Retro / Vintage' },
    { value: 'neobrutalismo', label: 'Pastel Brutalista' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'organico', label: 'Ecológico / Orgánico' },
    { value: 'noir', label: 'Noir Oscuro' },
    { value: 'educativo', label: 'Educativo / Académico' },
    { value: 'infantil', label: 'Infantil / Divertido' },
    { value: 'cientifico', label: 'Científico / Laboratorio' }
];

if (artStyleSelect) {
    artStyles.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.value;
        opt.textContent = s.label;
        artStyleSelect.appendChild(opt);
    });
    artStyleSelect.value = 'default';
    artStyleSelect.addEventListener('change', () => {
        document.body.className = document.body.className.replace(/theme-\S+/g, '').trim();
        const theme = artStyleSelect.value;
        if (theme !== 'default') {
            document.body.classList.add('theme-' + theme);
        }
        // Re-aplicar diseño para actualizar fuentes según corresponda
        const currentPaletteName = paletteSelect ? paletteSelect.value : (localStorage.getItem('paletteName') || designPalettes[0].name);
        const currentFont = localStorage.getItem('fontFamily') || fontFamilies[0];
        const activePalette = designPalettes.find(p => p.name === currentPaletteName) || designPalettes[0];
        applyDesign(activePalette, currentFont);
    });
}

const imageModels = [
    { value: 'none', label: 'Sin imágenes' },
    { value: 'flux', label: 'flux' },
    { value: 'zimage', label: 'zimage' },
    { value: 'gptimage', label: 'gptimage' },
    { value: 'klein', label: 'klein' }
];

if (imageModelSelect) {
    imageModels.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.value;
        opt.textContent = m.label;
        imageModelSelect.appendChild(opt);
    });
    imageModelSelect.value = 'none';
}

const textModels = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'mistral', label: 'Mistral' },
    { value: 'gemini-fast', label: 'Gemini Fast' },
    { value: 'openai-fast', label: 'OpenAI Fast' },
    { value: 'gemini-search', label: 'Gemini Search' },
    { value: 'nova-fast', label: 'Nova Fast' },
    { value: 'perplexity-fast', label: 'Perplexity Fast' },
    { value: 'deepseek', label: 'DeepSeek' }
];

if (textModelSelect) {
    textModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.value;
        option.textContent = model.label;
        textModelSelect.appendChild(option);
    });
    textModelSelect.value = 'openai';
}

const mathKeywords = ['matematicas', 'fisica', 'algebra', 'calculo', 'geometria', 'trigonometria', 'estadistica', 'probabilidad', 'ecuaciones', 'vectores', 'termodinamica', 'mecanica', 'optica', 'electromagnetismo', 'derivada', 'integral', 'matriz', 'funcion', 'matemáticas', 'física', 'álgebra', 'cálculo', 'geometría', 'trigonometría', 'estadística', 'probabilidad', 'termodinámica', 'mecánica', 'óptica', 'función'];

function ensureMathJax(topic, forceEnable) {
    const topicLower = topic.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const autoDetectMath = mathKeywords.some(keyword => topicLower.includes(keyword));
    const shouldEnable = forceEnable || (includeMathjaxCheckbox && includeMathjaxCheckbox.checked && autoDetectMath);
    let mathjaxScript = document.getElementById('mathjax-script');
    if (shouldEnable) {
        if (!mathjaxScript && document.head) {
            mathjaxScript = document.createElement('script');
            mathjaxScript.id = 'mathjax-script';
            mathjaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
            document.head.appendChild(mathjaxScript);
        }
        if (window.MathJax && window.MathJax.typesetPromise) return Promise.resolve();
        return new Promise((resolve) => {
            const check = setInterval(() => {
                if (window.MathJax && window.MathJax.typesetPromise) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
            setTimeout(() => { clearInterval(check); resolve(); }, 30000);
        });
    } else {
        if (mathjaxScript && mathjaxScript.parentNode) mathjaxScript.parentNode.removeChild(mathjaxScript);
        return Promise.resolve();
    }
}

if (topicInput) {
    topicInput.addEventListener('input', () => {
        const val = topicInput.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (includeMathjaxCheckbox && mathKeywords.some(keyword => val.includes(keyword))) {
            includeMathjaxCheckbox.checked = true;
        }
    });
}

const currentThemeStored = localStorage.getItem('theme');
if (currentThemeStored === 'dark' && document.body) {
    document.body.classList.add('dark-mode');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️ Modo Claro';
} else {
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙 Modo Oscuro';
}

const savedPaletteName = localStorage.getItem('paletteName') || designPalettes[0].name;
const savedFont = localStorage.getItem('fontFamily') || getRandomElement(fontFamilies);
let initialPalette = designPalettes.find(p => p.name === savedPaletteName) || designPalettes[0];
applyDesign(initialPalette, savedFont);

if (paletteSelect) {
    paletteSelect.value = initialPalette.name;
    paletteSelect.addEventListener('change', () => {
        const selectedPaletteName = paletteSelect.value;
        const selectedPalette = designPalettes.find(p => p.name === selectedPaletteName);
        const currentFont = document.body.style.fontFamily || localStorage.getItem('fontFamily') || fontFamilies[0];
        if (selectedPalette) {
            applyDesign(selectedPalette, currentFont);
            localStorage.setItem('paletteName', selectedPalette.name);
        }
    });
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        if (document.body) {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            themeToggleBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Modo Claro' : '🌙 Modo Oscuro';

            const currentPaletteName = paletteSelect ? paletteSelect.value : (localStorage.getItem('paletteName') || designPalettes[0].name);
            const currentFont = document.body.style.fontFamily || localStorage.getItem('fontFamily') || fontFamilies[0];
            const activePalette = designPalettes.find(p => p.name === currentPaletteName) || designPalettes[0];
            applyDesign(activePalette, currentFont);
        }
    });
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function parseSections(text) {
    const sections = { intro: '', steps: '', analogy: '', errors: '' };
    const lines = text.split('\n');
    let currentSection = 'intro';
    let currentContent = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const headingMatch = line.match(/^##\s+(.+)/);
        if (headingMatch) {
            if (currentContent.length > 0) {
                sections[currentSection] = currentContent.join('\n').trim();
                currentContent = [];
            }
            const heading = headingMatch[1].toLowerCase().trim();
            if (heading.includes('introduccion') || heading.includes('introducción')) {
                currentSection = 'intro';
            } else if (heading.includes('explicacion') || heading.includes('explicación') || heading.includes('paso a paso')) {
                currentSection = 'steps';
            } else if (heading.includes('analogia') || heading.includes('analogía')) {
                currentSection = 'analogy';
            } else if (heading.includes('erroneas') || heading.includes('erróneas') || heading.includes('error')) {
                currentSection = 'errors';
            } else {
                currentSection = 'intro';
            }
        } else {
            currentContent.push(line);
        }
    }
    if (currentContent.length > 0) {
        const existing = sections[currentSection];
        sections[currentSection] = (existing ? existing + '\n' : '') + currentContent.join('\n').trim();
    }
    if (!sections.intro && !sections.steps && !sections.analogy && !sections.errors) {
        sections.intro = text;
    }
    return sections;
}

function renderMarkdown(text) {
    if (typeof marked !== 'undefined') {
        const mathBlocks = [];
        let safeText = text;
        safeText = safeText.replace(/\$\$([\s\S]*?)\$\$/g, (_, m) => { mathBlocks.push('$$' + m + '$$'); return '@@MATH' + (mathBlocks.length - 1) + '@@'; });
        safeText = safeText.replace(/(?<!\$)\$([^\n$]*?[^\\$])\$(?!\$)/g, (_, m) => { mathBlocks.push('$' + m + '$'); return '@@MATH' + (mathBlocks.length - 1) + '@@'; });
        safeText = safeText.replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => { mathBlocks.push('\\[' + m + '\\]'); return '@@MATH' + (mathBlocks.length - 1) + '@@'; });
        safeText = safeText.replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => { mathBlocks.push('\\(' + m + '\\)'); return '@@MATH' + (mathBlocks.length - 1) + '@@'; });
        let html = marked.parse(safeText, { breaks: true });
        html = html.replace(/@@MATH(\d+)@@/g, (_, i) => mathBlocks[parseInt(i)] || '');
        return html || 'No se pudo generar la explicación.';
    }
    return text.replace(/\n/g, '<br>') || 'No se pudo generar la explicación.';
}

function createImgElement(url, topic) {
    const imgWrapper = document.createElement('div');
    imgWrapper.style.cssText = 'flex:0 0 auto; width:280px; max-width:100%;';
    const imgEl = document.createElement('img');
    imgEl.alt = 'Ilustración sobre ' + topic;
    imgEl.style.cssText = 'width:100%; height:auto; border-radius:var(--radius-md); box-shadow:0 4px 12px rgba(0,0,0,0.1);';
    imgEl.src = url;
    imgEl.onerror = () => { imgEl.alt = 'Imagen no disponible'; imgEl.style.opacity = '0.3'; };
    imgWrapper.appendChild(imgEl);
    return imgWrapper;
}

function countSteps(text) {
    if (!text) return 0;
    const lines = text.split('\n');
    let count = 0;
    for (const line of lines) {
        const trimmed = line.trim();
        if (/^\d+[\.\)]/.test(trimmed) || /^[-*]\s/.test(trimmed)) count++;
    }
    return count;
}

if (tutorialContainer) {
    tutorialContainer.addEventListener('click', (e) => {
        const img = e.target.closest('img');
        if (!img) return;
        const existing = document.querySelector('.image-modal-overlay');
        if (existing) existing.remove();
        const overlay = document.createElement('div');
        overlay.className = 'image-modal-overlay';
        const clone = document.createElement('img');
        clone.src = img.src;
        clone.alt = img.alt;
        overlay.appendChild(clone);
        overlay.addEventListener('click', () => overlay.remove());
        document.body.appendChild(overlay);
    });
}

if (generateTutorialBtn) {
    generateTutorialBtn.addEventListener('click', async () => {
        if (!topicInput || !expertInput) return;

        currentTopic = topicInput.value.trim();
        const expert = expertInput.value.trim();
        if (!currentTopic) { alert('Por favor, ingresa un tema.'); return; }
        if (!expert) { alert('Por favor, ingresa el experto solicitado.'); return; }

        const selectedPaletteName = paletteSelect.value;
        const newPalette = designPalettes.find(p => p.name === selectedPaletteName) || designPalettes[0];
        const newFont = getRandomElement(fontFamilies);
        applyDesign(newPalette, newFont);
        localStorage.setItem('paletteName', newPalette.name);
        localStorage.setItem('fontFamily', newFont);

        const loaderText = loadingIndicator ? loadingIndicator.querySelector('p') : null;
        if (loaderText) loaderText.textContent = '✨ Generando explicación de texto... Esto puede tardar un momento. ✨';

        if (tutorialContainer) tutorialContainer.innerHTML = '';
        safeSetDisplay(loadingIndicator, 'block');
        safeSetDisplay(tutorialHeaderActions, 'none');
        safeSetDisplay(postGenerationControls, 'none');

        const elementsToDisable = [generateTutorialBtn, topicInput, expertInput, paletteSelect, artStyleSelect, imageModelSelect, textModelSelect];
        elementsToDisable.forEach(el => { if (el) el.disabled = true; });

        const model = textModelSelect ? textModelSelect.value : 'openai';
        const imageModel = imageModelSelect ? imageModelSelect.value : 'none';
        const shouldGenerateImage = imageModel !== 'none';
        const prompt = `Explícame cómo funcionan ${currentTopic} como si fueras un experto en ${expert}. Explícalo paso a paso, usa una analogía y termina con tres ideas erróneas comunes sobre ellos. Usa estos encabezados: ## Introducción, ## Explicación paso a paso, ## Analogía, ## Tres ideas erróneas comunes`;

        const mathJaxReady = ensureMathJax(currentTopic, includeMathjaxCheckbox && includeMathjaxCheckbox.checked);

        if (!tutorialContainer) { console.error("No se encontró el contenedor del tutorial"); return; }

        try {
            const [textResponse] = await Promise.all([
                fetch('https://node.proyectodescartes.org/api/ia/text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, model })
                }),
                mathJaxReady
            ]);
            if (!textResponse.ok) throw new Error(`Error API: ${textResponse.status}`);
            let generatedText = await textResponse.text();

            const sections = parseSections(generatedText);

            let imageUrls = [];
            if (shouldGenerateImage) {
                if (loaderText) loaderText.textContent = '✨ Generando e integrando imágenes... Esto puede tardar un momento. ✨';
                const imagePrompts = [
                    `Portada educativa profesional sobre ${currentTopic} con gráficos claros, explicado por ${expert}`,
                    `Diagrama de flujo secuencial del proceso de ${currentTopic} con números y flechas, estilo infografía técnica, explicado por ${expert}`,
                    `Mapa conceptual visual de la continuación del proceso de ${currentTopic} con iconos y colores distintivos, explicado por ${expert}`,
                    `Pintura surrealista abstracta al estilo Dalí que representa ${currentTopic} como una metáfora visual creativa, explicado por ${expert}`,
                    `Afiche informativo dividido en tres recuadros sobre mitos comunes y conceptos erróneos de ${currentTopic}, explicado por ${expert}`
                ];
                const stepsCount = countSteps(sections.steps);
                if (stepsCount > 5) {
                    imagePrompts.push(`Ilustración de mapa mental expandido del proceso completo de ${currentTopic}, explicado por ${expert}`);
                }
                const imageResults = await Promise.all(imagePrompts.map(p =>
                    fetch('https://node.proyectodescartes.org/api/ia/image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: p, model: imageModel, width: 512, height: 512 })
                    }).then(async (resp) => {
                        if (!resp.ok) throw new Error(`Error imagen: ${resp.status}`);
                        const ct = resp.headers.get("content-type");
                        if (ct && ct.includes("application/json")) {
                            const data = await resp.json();
                            return data.url || data.output;
                        }
                        const blob = await resp.blob();
                        return URL.createObjectURL(blob);
                    })
                ));
                imageUrls = imageResults;
            }

            tutorialContainer.innerHTML = '';

            const titleEl = document.createElement('h3');
            titleEl.textContent = `${currentTopic} (explicado por un experto en ${expert})`;
            tutorialContainer.appendChild(titleEl);

            if (sections.intro) {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap; margin-bottom:25px;';
                const textDiv = document.createElement('div');
                textDiv.style.cssText = 'flex:1; min-width:280px; font-size:1.1em; line-height:1.8;';
                textDiv.innerHTML = renderMarkdown(sections.intro);
                row.appendChild(textDiv);
                if (imageUrls.length > 0) row.appendChild(createImgElement(imageUrls[0], currentTopic));
                tutorialContainer.appendChild(row);
            }

            if (sections.steps) {
                const stepHeading = document.createElement('h4');
                stepHeading.textContent = 'Explicación paso a paso';
                stepHeading.style.cssText = 'color:var(--accent-color-light); margin-top:30px; margin-bottom:15px; font-size:1.2em;';
                tutorialContainer.appendChild(stepHeading);

                const stepLines = sections.steps.split('\n');
                let parts;
                if (imageUrls.length > 5) {
                    const third = Math.floor(stepLines.length / 3);
                    parts = [stepLines.slice(0, third), stepLines.slice(third, 2*third), stepLines.slice(2*third)].map(a => a.join('\n').trim());
                } else {
                    const mid = Math.floor(stepLines.length / 2);
                    parts = [stepLines.slice(0, mid).join('\n').trim(), stepLines.slice(mid).join('\n').trim()];
                }
                parts.forEach((text, idx) => {
                    if (!text) return;
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap; margin-bottom:20px;';
                    const textDiv = document.createElement('div');
                    textDiv.style.cssText = 'flex:1; min-width:280px; font-size:1.1em; line-height:1.8;';
                    textDiv.innerHTML = renderMarkdown(text);
                    row.appendChild(textDiv);
                    const imgIdx = (imageUrls.length > 5 && idx === parts.length - 1) ? imageUrls.length - 1 : idx + 1;
                    if (imageUrls.length > imgIdx) row.appendChild(createImgElement(imageUrls[imgIdx], currentTopic));
                    tutorialContainer.appendChild(row);
                });
            }

            if (sections.analogy) {
                const heading = document.createElement('h4');
                heading.textContent = 'Analogía';
                heading.style.cssText = 'color:var(--accent-color-light); margin-top:30px; margin-bottom:15px; font-size:1.2em;';
                tutorialContainer.appendChild(heading);
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap; margin-bottom:25px;';
                const textDiv = document.createElement('div');
                textDiv.style.cssText = 'flex:1; min-width:280px; font-size:1.1em; line-height:1.8;';
                textDiv.innerHTML = renderMarkdown(sections.analogy);
                row.appendChild(textDiv);
                if (imageUrls.length > 3) row.appendChild(createImgElement(imageUrls[3], currentTopic));
                tutorialContainer.appendChild(row);
            }

            if (sections.errors) {
                const heading = document.createElement('h4');
                heading.textContent = 'Tres ideas erróneas comunes';
                heading.style.cssText = 'color:var(--accent-color-light); margin-top:30px; margin-bottom:15px; font-size:1.2em;';
                tutorialContainer.appendChild(heading);
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap; margin-bottom:25px;';
                const textDiv = document.createElement('div');
                textDiv.style.cssText = 'flex:1; min-width:280px; font-size:1.1em; line-height:1.8;';
                textDiv.innerHTML = renderMarkdown(sections.errors);
                row.appendChild(textDiv);
                if (imageUrls.length > 4) row.appendChild(createImgElement(imageUrls[4], currentTopic));
                tutorialContainer.appendChild(row);
            }

            if (window.MathJax && window.MathJax.typesetPromise) {
                try { await window.MathJax.typesetPromise(); } catch (err) { console.error("Error MathJax:", err); }
            }

            // Esperar activamente a que todas las imágenes terminen de cargar o fallen, con un timeout de 15 segundos
            if (shouldGenerateImage && imageUrls.length > 0) {
                const images = tutorialContainer.querySelectorAll('img');
                const imagePromises = Array.from(images).map(img => {
                    return new Promise((resolve) => {
                        if (img.complete) {
                            resolve();
                        } else {
                            img.addEventListener('load', resolve);
                            img.addEventListener('error', resolve);
                        }
                    });
                });
                const timeoutPromise = new Promise(resolve => setTimeout(resolve, 15000));
                await Promise.race([Promise.all(imagePromises), timeoutPromise]);
            }
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('tutorial-step');
            errorDiv.innerHTML = `<h3>Error</h3><p style="color:red;">Error al generar la explicación: ${error.message}.</p>`;
            tutorialContainer.appendChild(errorDiv);
        }

        safeSetDisplay(loadingIndicator, 'none');
        safeSetDisplay(tutorialHeaderActions, 'flex');
        safeSetDisplay(postGenerationControls, 'flex');
        elementsToDisable.forEach(el => { if (el) el.disabled = false; });
    });
}

async function getPageHtmlForDownload() {
    const clonedHtmlElement = document.documentElement.cloneNode(true);
    let themeToggleButtonCloneForDownload = null;

    const originalLiveThemeToggleBtn = document.getElementById('themeToggleBtn');
    if (originalLiveThemeToggleBtn) {
        themeToggleButtonCloneForDownload = originalLiveThemeToggleBtn.cloneNode(true);
    }

    const elementsToRemoveIds = ['generationControls', 'postGenerationControls', 'tutorialHeaderActions'];
    elementsToRemoveIds.forEach(id => {
        const elToRemove = clonedHtmlElement.querySelector('#' + id);
        if (elToRemove && elToRemove.parentNode) elToRemove.parentNode.removeChild(elToRemove);
    });

    if (themeToggleButtonCloneForDownload) {
        const headerClone = clonedHtmlElement.querySelector('header');
        if (headerClone) {
            const themeToggleWrapper = document.createElement('div');
            themeToggleWrapper.style.textAlign = 'center';
            themeToggleWrapper.style.padding = '10px 0 20px 0';
            themeToggleButtonCloneForDownload.id = 'themeToggleBtn';
            themeToggleWrapper.appendChild(themeToggleButtonCloneForDownload);
            const h1Clone = headerClone.querySelector('h1');
            if (h1Clone && h1Clone.nextSibling) {
                headerClone.insertBefore(themeToggleWrapper, h1Clone.nextSibling);
            } else {
                headerClone.appendChild(themeToggleWrapper);
            }
        }
    }

    const pageTitle = clonedHtmlElement.querySelector('title');
    if (pageTitle) {
        pageTitle.textContent = `Explicación: ${currentTopic || 'Tema Generado'}`;
    }

    // Incrustar el archivo CSS externo directamente en el HTML descargado
    let cssContent = '';
    try {
        const response = await fetch('style.css');
        if (response.ok) {
            cssContent = await response.text();
        }
    } catch (e) {
        console.warn('No se pudo obtener style.css mediante fetch, usando fallback embebido.');
    }
    if (!cssContent) {
        cssContent = CSS_CONTENT_FALLBACK;
    }

    const styleLink = clonedHtmlElement.querySelector('link[href="style.css"]');
    if (styleLink) {
        const styleEl = document.createElement('style');
        styleEl.textContent = cssContent;
        styleLink.parentNode.replaceChild(styleEl, styleLink);
    }

    // Remover la referencia al script.js externo
    const scriptJs = clonedHtmlElement.querySelector('script[src="script.js"]');
    if (scriptJs) {
        scriptJs.parentNode.removeChild(scriptJs);
    }

    // Insertar un script mínimo para que funcione el cambio de modo claro/oscuro en el archivo descargado
    const bodyClone = clonedHtmlElement.querySelector('body');
    if (bodyClone) {
        const inlineScript = document.createElement('script');
        inlineScript.textContent = `
            document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const btn = document.getElementById('themeToggleBtn');
                if (btn) {
                    btn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
                }
            });
        `;
        bodyClone.appendChild(inlineScript);
    }

    const tutorialImages = clonedHtmlElement.querySelectorAll('#tutorialContainer img');
    for (const img of tutorialImages) {
        if (img.src && !img.src.startsWith('data:')) {
            try {
                let blob;
                if (img.src.startsWith('blob:')) {
                    const liveImg = Array.from(document.querySelectorAll('#tutorialContainer img')).find(l => l.src === img.src);
                    if (liveImg && liveImg.complete && liveImg.naturalWidth > 0) {
                        const canvas = document.createElement('canvas');
                        canvas.width = liveImg.naturalWidth;
                        canvas.height = liveImg.naturalHeight;
                        canvas.getContext('2d').drawImage(liveImg, 0, 0);
                        img.src = canvas.toDataURL('image/png');
                        continue;
                    }
                }
                const response = await fetch(img.src);
                blob = await response.blob();
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
                img.src = base64;
            } catch (e) {
                console.warn('No se pudo convertir imagen a Base64', e);
            }
        }
    }

    return `<!DOCTYPE html>\n${clonedHtmlElement.outerHTML}`;
}

if (downloadHtmlBtn) {
    downloadHtmlBtn.addEventListener('click', async () => {
        const originalBtnText = downloadHtmlBtn.textContent;
        downloadHtmlBtn.textContent = "⚙️ Generando...";
        downloadHtmlBtn.disabled = true;

        try {
            const htmlContent = await getPageHtmlForDownload();
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `explicacion_${(currentTopic || 'tema').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error al generar descarga HTML:", error);
            alert("Hubo un error al generar el archivo HTML.");
        } finally {
            downloadHtmlBtn.textContent = originalBtnText;
            downloadHtmlBtn.disabled = false;
        }
    });
}

if (downloadWordBtn) {
    downloadWordBtn.addEventListener('click', async () => {
        const originalBtnText = downloadWordBtn.textContent;
        downloadWordBtn.textContent = "⚙️ Generando...";
        downloadWordBtn.disabled = true;

        try {
            const wordContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office'
                      xmlns:w='urn:schemas-microsoft-com:office:word'
                      xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <meta charset="UTF-8">
                    <title>${currentTopic || 'Explicación'}</title>
                    <!--[if gte mso 9]>
                    <xml>
                        <w:WordDocument>
                            <w:View>Print</w:View>
                        </w:WordDocument>
                    </xml>
                    <![endif]-->
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12pt; line-height: 1.6; margin: 40px; }
                        h1 { color: #00796b; font-size: 22pt; }
                        h3 { color: #ff6f00; font-size: 16pt; }
                        p { margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    ${document.querySelector('#tutorialContainer') ? document.querySelector('#tutorialContainer').innerHTML : ''}
                </body>
                </html>
            `;
            const blob = new Blob([wordContent], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `explicacion_${(currentTopic || 'tema').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error al generar descarga Word:", error);
            alert("Hubo un error al generar el archivo Word.");
        } finally {
            downloadWordBtn.textContent = originalBtnText;
            downloadWordBtn.disabled = false;
        }
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (tutorialContainer) tutorialContainer.innerHTML = '';
        if (topicInput) {
            topicInput.value = '';
            currentTopic = '';
            topicInput.focus();
        }
        if (expertInput) expertInput.value = '';
        if (artStyleSelect) {
            artStyleSelect.value = 'default';
            document.body.className = document.body.className.replace(/theme-\S+/g, '').trim();
        }
        if (imageModelSelect) imageModelSelect.value = 'none';
        if (textModelSelect) textModelSelect.value = 'openai';
        if (includeMathjaxCheckbox) includeMathjaxCheckbox.checked = false;
        const oldMathjaxScript = document.getElementById('mathjax-script');
        if (oldMathjaxScript && oldMathjaxScript.parentNode) oldMathjaxScript.parentNode.removeChild(oldMathjaxScript);
        safeSetDisplay(tutorialHeaderActions, 'none');
        safeSetDisplay(postGenerationControls, 'none');
        if (paletteSelect) {
            paletteSelect.value = designPalettes[0].name;
            const defaultPalette = designPalettes[0];
            const currentFont = document.body.style.fontFamily || localStorage.getItem('fontFamily') || fontFamilies[0];
            applyDesign(defaultPalette, currentFont);
            localStorage.setItem('paletteName', defaultPalette.name);
        }
    });
}

// Fallback del contenido CSS para descargas locales (protocolo file://)
const CSS_CONTENT_FALLBACK = `/* Estilos Generales y Variables CSS (Default Palette - "Oceanic") */
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Lexend:wght@300..900&family=Space+Grotesk:wght@300..700&family=Poppins:wght@300..900&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap');

:root {
    --bg-color-light: #e0f7fa;
    --text-color-light: #004d40;
    --primary-color-light: #00796b;
    --secondary-color-light: #004d40;
    --card-bg-light: #ffffff;
    --border-color-light: #b2dfdb;
    --accent-color-light: #ff6f00;
    --shadow-color-light: rgba(0, 77, 64, 0.15);

    --bg-color-dark: #00251a;
    --text-color-dark: #b2dfdb;
    --primary-color-dark: #4db6ac;
    --secondary-color-dark: #80cbc4;
    --card-bg-dark: #003d33;
    --border-color-dark: #004d40;
    --accent-color-dark: #ffa000;
    --shadow-color-dark: rgba(77, 182, 172, 0.2);

    --font-family-main: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    --success-color-light: #2e7d32;
    --success-color-dark: #81c784;
    --error-color-light: #c62828;
    --error-color-dark: #ef9a9a;
    --radius-lg: 15px;
    --radius-md: 10px;
    --radius-sm: 8px;
    --card-shadow: 0 8px 25px var(--shadow-color-light);
}

/* --- Visual Themes --- */
.theme-default {
    --radius-lg: 15px; --radius-md: 10px; --radius-sm: 8px;
    --font-family-main: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.theme-moderno {
    --radius-lg: 16px; --radius-md: 12px; --radius-sm: 10px;
    --font-family-main: 'Poppins', 'Segoe UI', sans-serif;
}
.theme-corporativo {
    --radius-lg: 6px; --radius-md: 4px; --radius-sm: 4px;
    --font-family-main: 'Georgia', 'Times New Roman', serif;
}
.theme-creativo {
    --radius-lg: 28px; --radius-md: 22px; --radius-sm: 18px;
    --font-family-main: 'Poppins', 'Segoe UI', sans-serif;
}
.theme-minimalista {
    --radius-lg: 4px; --radius-md: 2px; --radius-sm: 2px;
    --font-family-main: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    --card-shadow: none;
}
.theme-glass {
    --radius-lg: 20px; --radius-md: 16px; --radius-sm: 14px;
    --font-family-main: 'Poppins', 'Segoe UI', sans-serif;
}
body.theme-glass {
    background: linear-gradient(135deg, var(--primary-color-light), var(--secondary-color-light));
    background-attachment: fixed;
}
body.dark-mode.theme-glass {
    background: linear-gradient(135deg, var(--primary-color-dark), var(--secondary-color-dark));
}
body.theme-glass .container, body.theme-glass .tutorial-step {
    backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    background-color: rgba(255,255,255,0.55) !important;
}
body.dark-mode.theme-glass .container, body.dark-mode.theme-glass .tutorial-step {
    background-color: rgba(0,0,0,0.55) !important;
}
.theme-darkneon {
    --radius-lg: 14px; --radius-md: 10px; --radius-sm: 8px;
    --font-family-main: 'Poppins', 'Segoe UI', sans-serif;
}
body.theme-darkneon {
    background-color: #0a0e1a !important; color: #e8ecff !important;
}
body.theme-darkneon .container { background-color: #11172a !important; border-color: #232c4d; }
body.theme-darkneon .tutorial-step { background-color: #161d35 !important; border-color: #232c4d; }
body.theme-darkneon header { border-bottom-color: #232c4d; }
body.theme-darkneon footer { border-top-color: #232c4d; color: #8b93b8; }
body.theme-darkneon h1, body.theme-darkneon h3 { color: #818cf8 !important; }
body.theme-darkneon .control-group label { color: #8b93b8; }
body.theme-darkneon #topicInput, body.theme-darkneon #expertInput, body.theme-darkneon #paletteSelect, body.theme-darkneon #textModelSelect, body.theme-darkneon #imageModelSelect, body.theme-darkneon #artStyleSelect {
    background-color: #161d35; color: #e8ecff; border-color: #232c4d;
}
.theme-brutalista {
    --radius-lg: 0px; --radius-md: 0px; --radius-sm: 0px;
    --font-family-main: 'Poppins', 'Segoe UI', sans-serif;
}
body.theme-brutalista .container { border: 3px solid #111; box-shadow: 8px 8px 0 #111; }
body.theme-brutalista .tutorial-step { border: 2.5px solid #111; box-shadow: 5px 5px 0 #111; }
body.theme-brutalista button { border: 2px solid #111; box-shadow: 3px 3px 0 #111; }
.theme-vibrante {
    --radius-lg: 18px; --radius-md: 14px; --radius-sm: 12px;
    --font-family-main: 'Poppins', 'Segoe UI', sans-serif;
}
body.theme-vibrante {
    background: linear-gradient(120deg, #f093fb 0%, #f5576c 100%) !important;
}
body.dark-mode.theme-vibrante {
    background: linear-gradient(120deg, #301b3f 0%, #1a0033 100%) !important;
}
body.theme-vibrante header h1 { color: #ffffff !important; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
.theme-editorial {
    --radius-lg: 0px; --radius-md: 0px; --radius-sm: 6px;
    --font-family-main: 'Georgia', 'Times New Roman', serif;
    --card-shadow: none;
}
body.theme-editorial header { border-bottom: 3px double var(--primary-color-light); }
body.theme-editorial .tutorial-step { border: none; border-top: 1px solid var(--primary-color-light); box-shadow: none; }
body.dark-mode.theme-editorial header { border-bottom-color: var(--primary-color-dark); }
body.dark-mode.theme-editorial .tutorial-step { border-top-color: var(--primary-color-dark); }
.theme-terminal {
    --radius-lg: 0px; --radius-md: 0px; --radius-sm: 0px;
    --font-family-main: 'Courier New', 'Consolas', monospace;
}
body.theme-terminal {
    background-color: #050505 !important;
    color: #33ff33 !important;
}
body.theme-terminal .container {
    background-color: #0a0a0a !important;
    border: 1px solid #33ff33;
    box-shadow: 0 0 15px rgba(51, 255, 51, 0.2);
}
body.theme-terminal .tutorial-step {
    background-color: #0e0e0e !important;
    border: 1px dashed #33ff33;
}
body.theme-terminal button {
    background-color: #151515 !important;
    color: #33ff33 !important;
    border: 1px solid #33ff33 !important;
}
body.theme-terminal input, body.theme-terminal select {
    background-color: #0f0f0f !important;
    color: #33ff33 !important;
    border: 1px solid #33ff33 !important;
}
.theme-infografico {
    --radius-lg: 24px; --radius-md: 18px; --radius-sm: 14px;
    --font-family-main: 'Poppins', 'Segoe UI', sans-serif;
}
body.theme-infografico .tutorial-step { border: 2.5px dashed var(--border-color-light); }
body.dark-mode.theme-infografico .tutorial-step { border-style: dashed; }
.theme-retro {
    --radius-lg: 12px; --radius-md: 8px; --radius-sm: 6px;
    --font-family-main: 'Georgia', serif;
}
body.theme-retro {
    background-color: #f4edd8 !important;
    color: #5b4636 !important;
}
body.theme-retro .container {
    background-color: #fdfaf2 !important;
    border: 2px solid #d3c2a0;
}
body.theme-retro .tutorial-step { border: 2px solid var(--border-color-light); }
body.dark-mode.theme-retro .tutorial-step { border-color: var(--border-color-dark); }
.theme-neobrutalismo {
    --radius-lg: 12px; --radius-md: 8px; --radius-sm: 6px;
    --font-family-main: 'Poppins', 'Segoe UI', sans-serif;
}
body.theme-neobrutalismo .container { border: 3px solid #000807; box-shadow: 6px 6px 0 #000807; }
body.theme-neobrutalismo .tutorial-step { border: 3px solid #000807; box-shadow: 6px 6px 0 #000807; }
body.theme-neobrutalismo button { border: 2px solid #000807; box-shadow: 4px 4px 0 #000807; }
.theme-cyberpunk {
    --radius-lg: 4px; --radius-md: 2px; --radius-sm: 2px;
    --font-family-main: 'Courier New', monospace;
}
body.theme-cyberpunk {
    background-color: #0d0c1d !important; color: #00f0ff !important;
}
body.theme-cyberpunk .container { background-color: #14132b !important; border-color: #ff0055; border-left: 5px solid #ff0055; }
body.theme-cyberpunk .tutorial-step { background-color: #1d1b3d !important; border-color: #00f0ff; }
body.theme-cyberpunk header { border-bottom-color: #ff0055; }
body.theme-cyberpunk footer { border-top-color: #ff0055; color: #757299; }
body.theme-cyberpunk h1, body.theme-cyberpunk h3 { color: #ff0055 !important; text-shadow: 0 0 8px #ff0055; }
body.theme-cyberpunk .control-group label { color: #757299; }
body.theme-cyberpunk #topicInput, body.theme-cyberpunk #expertInput, body.theme-cyberpunk #paletteSelect, body.theme-cyberpunk #textModelSelect, body.theme-cyberpunk #imageModelSelect, body.theme-cyberpunk #artStyleSelect {
    background-color: #1d1b3d; color: #00f0ff; border-color: #ff0055;
}
.theme-organico {
    --radius-lg: 24px; --radius-md: 16px; --radius-sm: 12px;
    --font-family-main: 'Poppins', 'Segoe UI', sans-serif;
}
body.theme-organico .tutorial-step { border-radius: var(--radius-md) 4px var(--radius-md) 4px; }
.theme-noir {
    --radius-lg: 14px; --radius-md: 10px; --radius-sm: 8px;
    --font-family-main: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
body.theme-noir {
    background-color: #1a1a2e !important; color: #e0e0e0 !important;
}
body.theme-noir .container {
    background-color: #16213e !important; border: 1px solid #0f3460;
}
body.theme-noir .tutorial-step {
    background-color: #1a1a2e !important; border-color: #0f3460;
}
body.theme-noir header { border-bottom-color: #0f3460; }
body.theme-noir footer { border-top-color: #0f3460; color: #8899aa; }
body.theme-noir #topicInput, body.theme-noir #expertInput, body.theme-noir #paletteSelect, body.theme-noir #textModelSelect, body.theme-noir #imageModelSelect, body.theme-noir #artStyleSelect {
    background-color: #0f3460; color: #e0e0e0; border-color: #1a1a2e;
}
body.theme-noir h1, body.theme-noir h3 { color: #e94560 !important; }
body.theme-noir .control-group label { color: #8899aa; }
body.theme-noir header h1 { color: #e94560; }

/* --- Nuevos Estilos Visuales --- */

/* 1. Educativo */
.theme-educativo {
    --radius-lg: 12px; --radius-md: 8px; --radius-sm: 6px;
    --font-family-main: 'Lexend', sans-serif;
}
body.theme-educativo {
    background-color: #f7f9fc !important;
    color: #2c3e50 !important;
}
body.theme-educativo .container {
    background-color: #ffffff !important;
    border: 1px solid #d1d8e0;
    border-top: 6px solid #3498db;
    box-shadow: 0 10px 30px rgba(52, 152, 219, 0.08);
}
body.theme-educativo .tutorial-step {
    background-color: #fcfdfe !important;
    border-left: 4px solid #2ecc71;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}
body.theme-educativo header h1 {
    color: #2980b9 !important;
}

/* 2. Infantil */
.theme-infantil {
    --radius-lg: 32px; --radius-md: 20px; --radius-sm: 14px;
    --font-family-main: 'Fredoka', sans-serif;
}
body.theme-infantil {
    background-color: #fff9db !important;
    color: #6d4c41 !important;
}
body.theme-infantil .container {
    background-color: #ffffff !important;
    border: 4px solid #ffb74d;
    box-shadow: 0 12px 0 #ffe082;
}
body.theme-infantil .tutorial-step {
    background-color: #f1f8e9 !important;
    border: 3px solid #aed581;
    box-shadow: 0 6px 0 #c5e1a5;
}
body.theme-infantil button {
    background-color: #ff8a65 !important;
    color: white !important;
    border: 3px solid #ff7043 !important;
    box-shadow: 0 4px 0 #e64a19 !important;
    transform: none !important;
}
body.theme-infantil button:hover {
    background-color: #ff7043 !important;
    transform: translateY(2px) !important;
    box-shadow: 0 2px 0 #e64a19 !important;
}
body.theme-infantil header h1 {
    color: #ec407a !important;
    font-size: 3.2em;
    text-shadow: 2px 2px 0px #f8bbd0;
}

/* 3. Científico */
.theme-cientifico {
    --radius-lg: 4px; --radius-md: 4px; --radius-sm: 2px;
    --font-family-main: 'Space Grotesk', 'Courier Prime', monospace;
}
body.theme-cientifico {
    background-color: #0b0f19 !important;
    color: #8da2fb !important;
}
body.theme-cientifico .container {
    background-color: #121829 !important;
    border: 1px solid #3b82f6;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
}
body.theme-cientifico .tutorial-step {
    background-color: #18223f !important;
    border: 1px solid #10b981;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.1);
}
body.theme-cientifico header h1 {
    color: #60a5fa !important;
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: 2px;
    text-transform: uppercase;
}
body.theme-cientifico button {
    background-color: #3b82f6 !important;
    color: #ffffff !important;
    border: 1px solid #1d4ed8 !important;
}
body.theme-cientifico #topicInput, body.theme-cientifico #expertInput, body.theme-cientifico #paletteSelect, body.theme-cientifico #textModelSelect, body.theme-cientifico #imageModelSelect, body.theme-cientifico #artStyleSelect {
    background-color: #1e293b; color: #f8fafc; border-color: #475569;
}


/* --- Estilos base del DOM --- */
.container {
    border-radius: var(--radius-lg);
    box-shadow: var(--card-shadow);
}
.tutorial-step {
    border-radius: var(--radius-md);
    box-shadow: var(--card-shadow);
}
#topicInput, #expertInput, #paletteSelect, #textModelSelect, #imageModelSelect, #artStyleSelect {
    border-radius: var(--radius-sm);
}
button {
    border-radius: var(--radius-sm);
}

body {
    font-family: var(--font-family-main);
    margin: 0;
    padding: 0;
    background-color: var(--bg-color-light);
    color: var(--text-color-light);
    transition: background-color 0.5s, color 0.5s, font-family 0.5s;
    line-height: 1.7;
}

body.dark-mode {
    background-color: var(--bg-color-dark);
    color: var(--text-color-dark);
}

.container {
    max-width: 900px;
    margin: 20px auto;
    padding: 25px;
    background-color: var(--card-bg-light);
    border-radius: var(--radius-lg);
    box-shadow: var(--card-shadow);
    transition: background-color 0.5s, box-shadow 0.5s;
}

body.dark-mode .container {
    background-color: var(--card-bg-dark);
    box-shadow: 0 8px 25px var(--shadow-color-dark);
}

header {
    text-align: center;
    margin-bottom: 35px;
    padding-bottom: 25px;
    border-bottom: 2px solid var(--primary-color-light);
}

body.dark-mode header {
    border-bottom-color: var(--primary-color-dark);
}

header h1 {
    color: var(--primary-color-light);
    font-size: 2.8em;
    margin-bottom: 15px;
    font-weight: 700;
    letter-spacing: -1px;
}

body.dark-mode header h1 {
    color: var(--primary-color-dark);
}

#generationControls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    align-items: center;
    margin-bottom: 20px;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.control-group label {
    font-size: 0.9em;
    font-weight: 500;
    color: var(--secondary-color-light);
}

body.dark-mode .control-group label {
    color: var(--secondary-color-dark);
}

#topicInput,
#expertInput,
#paletteSelect,
#textModelSelect,
#imageModelSelect,
#artStyleSelect {
    padding: 10px 14px;
    border: 2px solid var(--border-color-light);
    font-size: 1em;
    background-color: var(--bg-color-light);
    color: var(--text-color-light);
    width: 100%;
    box-sizing: border-box;
}

body.dark-mode #topicInput,
body.dark-mode #expertInput,
body.dark-mode #paletteSelect,
body.dark-mode #textModelSelect,
body.dark-mode #imageModelSelect,
body.dark-mode #artStyleSelect {
    background-color: var(--card-bg-dark);
    color: var(--text-color-dark);
    border-color: var(--border-color-dark);
}

#topicInput:focus,
#expertInput:focus,
#paletteSelect:focus,
#textModelSelect:focus,
#imageModelSelect:focus,
#artStyleSelect:focus {
    outline: none;
    border-color: var(--primary-color-light);
    box-shadow: 0 0 0 3px var(--primary-color-light_alpha, rgba(0, 121, 107, 0.3));
}

body.dark-mode #topicInput:focus,
body.dark-mode #expertInput:focus,
body.dark-mode #paletteSelect:focus,
body.dark-mode #textModelSelect:focus,
body.dark-mode #imageModelSelect:focus,
body.dark-mode #artStyleSelect:focus {
    border-color: var(--primary-color-dark);
    box-shadow: 0 0 0 3px var(--primary-color-dark_alpha, rgba(77, 182, 172, 0.3));
}

.checkbox-control {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95em;
    padding: 8px 0;
}

.checkbox-control input[type="checkbox"] {
    transform: scale(1.2);
    accent-color: var(--primary-color-light);
}

body.dark-mode .checkbox-control input[type="checkbox"] {
    accent-color: var(--primary-color-dark);
}

.main-actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 10px;
}

button {
    padding: 10px 18px;
    border: none;
    font-size: 0.95em;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.15s, box-shadow 0.2s;
    font-weight: 600;
    letter-spacing: 0.5px;
}

#generateTutorialBtn,
#themeToggleBtn {
    padding: 12px 22px;
    font-size: 1em;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

button:active {
    transform: translateY(0px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:disabled {
    background-color: #ccc !important;
    color: #666 !important;
    cursor: not-allowed;
    transform: translateY(0px);
    box-shadow: none;
}

body.dark-mode button:disabled {
    background-color: #555 !important;
    color: #888 !important;
}


#generateTutorialBtn {
    background-color: var(--primary-color-light);
    color: white;
}

body.dark-mode #generateTutorialBtn {
    background-color: var(--primary-color-dark);
    color: var(--bg-color-dark);
}

#themeToggleBtn,
#resetBtn,
#downloadHtmlBtn,
#downloadWordBtn {
    background-color: var(--secondary-color-light);
    color: white;
}

body.dark-mode #themeToggleBtn,
body.dark-mode #resetBtn,
body.dark-mode #downloadHtmlBtn,
body.dark-mode #downloadWordBtn {
    background-color: var(--secondary-color-dark);
    color: var(--bg-color-dark);
}

#resetBtn {
    background-color: var(--accent-color-light);
}

body.dark-mode #resetBtn {
    background-color: var(--accent-color-dark);
}


#tutorialContainer {
    margin-top: 30px;
}

.tutorial-step {
    background-color: var(--card-bg-light);
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-md);
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: var(--card-shadow);
    opacity: 0;
    transform: translateY(25px);
    animation: fadeInStep 0.6s ease-out forwards;
    overflow: auto;
}

body.dark-mode .tutorial-step {
    background-color: var(--card-bg-dark);
    border-color: var(--border-color-dark);
    box-shadow: 0 5px 15px var(--shadow-color-dark);
}

@keyframes fadeInStep {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.tutorial-step h3 {
    color: var(--accent-color-light);
    margin-top: 0;
    font-size: 1.7em;
    border-bottom: 2px solid var(--accent-color-light);
    padding-bottom: 10px;
    margin-bottom: 18px;
    font-weight: 600;
}

body.dark-mode .tutorial-step h3 {
    color: var(--accent-color-dark);
    border-bottom-color: var(--accent-color-dark);
}

.tutorial-step p {
    font-size: 1.1em;
    color: var(--text-color-light);
}

body.dark-mode .tutorial-step p {
    color: var(--text-color-dark);
}

#loadingIndicator {
    text-align: center;
    padding: 25px;
    font-size: 1.3em;
    color: var(--primary-color-light);
}

body.dark-mode #loadingIndicator {
    color: var(--primary-color-dark);
}

.spinner {
    border: 5px solid var(--border-color-light);
    border-top: 5px solid var(--primary-color-light);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 15px auto;
}

body.dark-mode .spinner {
    border-color: var(--border-color-dark);
    border-top-color: var(--primary-color-dark);
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.action-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
}




footer {
    text-align: center;
    margin-top: 45px;
    padding: 25px;
    font-size: 0.95em;
    color: var(--secondary-color-light);
    border-top: 1px solid var(--border-color-light);
}

body.dark-mode footer {
    color: var(--secondary-color-dark);
    border-top-color: var(--border-color-dark);
}

#multipleChoiceButtons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
    width: 100%;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.image-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 20px;
}
.image-modal-overlay img {
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 8px;
    box-shadow: 0 0 40px rgba(0,0,0,0.6);
    cursor: pointer;
    object-fit: contain;
}
`;

