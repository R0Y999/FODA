const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const OLLAMA_URL = '/api/chat';
const GEMINI_URL = '/api/generate';
const MODEL = 'gemma4:e2b';

const FOCUS_PROMPTS = {
  empresa: 'Analiza la organización de forma integral: estructura, recursos humanos, cultura, procesos internos, posición en el mercado y entorno competitivo.',
  producto: 'Enfócate en el producto o servicio descrito: calidad, diferenciación, precio, ciclo de vida, satisfacción del cliente y competencia directa.',
  mercado: 'Enfócate en la posición competitiva y el mercado: cuota de mercado, tendencias, regulaciones, competidores, demanda y oportunidades de expansión.',
};

function buildMessages(description, focus) {
  const focusInstruction = FOCUS_PROMPTS[focus] || FOCUS_PROMPTS.empresa;

  const system = `Eres un consultor de estrategia empresarial experto. Generas análisis FODA en formato JSON.

${focusInstruction}

REGLAS:
1. Responde SOLO con un JSON válido. Nada más.
2. No uses bloques de código markdown. No uses \`\`\`.
3. El JSON tiene 4 claves: "fortalezas", "oportunidades", "debilidades", "amenazas".
4. Cada clave es un array de 4 a 6 strings en español.
5. Cada string es profesional, claro y apto para presentaciones.`;

  const user = `Genera el análisis FODA para la siguiente descripción. Responde SOLO con el JSON:

${description}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

function extractJSON(text) {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Try parsing the whole cleaned text first
  try {
    const parsed = JSON.parse(cleaned);
    if (isValidFoda(parsed)) return parsed;
  } catch { /* continue */ }

  // Try to find JSON object within the text
  const braceStart = cleaned.indexOf('{');
  const braceEnd = cleaned.lastIndexOf('}');
  if (braceStart === -1 || braceEnd === -1) return null;

  const jsonStr = cleaned.slice(braceStart, braceEnd + 1);
  try {
    const parsed = JSON.parse(jsonStr);
    if (isValidFoda(parsed)) return parsed;
  } catch { /* continue */ }

  return null;
}

function isValidFoda(obj) {
  return (
    obj &&
    Array.isArray(obj.fortalezas) && obj.fortalezas.length > 0 &&
    Array.isArray(obj.oportunidades) && obj.oportunidades.length > 0 &&
    Array.isArray(obj.debilidades) && obj.debilidades.length > 0 &&
    Array.isArray(obj.amenazas) && obj.amenazas.length > 0
  );
}

export async function generateFoda(description, focus) {
  if (IS_LOCAL) {
    return generateViaOllama(description, focus);
  }
  return generateViaGemini(description, focus);
}

async function generateViaGemini(description, focus) {
  let response;
  try {
    response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, focus }),
    });
  } catch (err) {
    throw new Error('No se pudo conectar con el servidor. Intenta de nuevo.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Error del servidor (${response.status})`);
  }

  if (!isValidFoda(data)) {
    throw new Error('La IA devolvió un formato inesperado. Intenta de nuevo.');
  }

  return data;
}

async function generateViaOllama(description, focus) {
  let response;
  try {
    response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: buildMessages(description, focus),
        stream: false,
        format: 'json',
        options: {
          temperature: 0.7,
          num_predict: 2048,
        },
      }),
    });
  } catch (err) {
    throw new Error(
      'No se pudo conectar con Ollama. Asegúrate de que esté corriendo.\n\nEjecuta: ollama serve'
    );
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `Modelo "${MODEL}" no encontrado. Instálalo con:\n\nollama pull ${MODEL}`
      );
    }
    throw new Error(`Error de Ollama (${response.status}): ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.message?.content || '';

  const result = extractJSON(text);
  if (!result) {
    throw new Error(
      'Ollama devolvió una respuesta que no se pudo interpretar. Intenta de nuevo.\n\nRespuesta: ' +
        text.substring(0, 200)
    );
  }

  return result;
}
