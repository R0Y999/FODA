const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const FOCUS_PROMPTS = {
  empresa: 'Analiza la organización de forma integral: estructura, recursos humanos, cultura, procesos internos, posición en el mercado y entorno competitivo.',
  producto: 'Enfócate en el producto o servicio descrito: calidad, diferenciación, precio, ciclo de vida, satisfacción del cliente y competencia directa.',
  mercado: 'Enfócate en la posición competitiva y el mercado: cuota de mercado, tendencias, regulaciones, competidores, demanda y oportunidades de expansión.',
};

function buildPrompt(description, focus) {
  const focusInstruction = FOCUS_PROMPTS[focus] || FOCUS_PROMPTS.empresa;

  return `Eres un consultor de estrategia empresarial experto. Generas análisis FODA en formato JSON.

${focusInstruction}

REGLAS:
1. Responde SOLO con un JSON válido. Nada más.
2. No uses bloques de código markdown. No uses \`\`\`.
3. El JSON tiene 4 claves: "fortalezas", "oportunidades", "debilidades", "amenazas".
4. Cada clave es un array de 4 a 6 strings en español.
5. Cada string es profesional, claro y apto para presentaciones.

Genera el análisis FODA para la siguiente descripción. Responde SOLO con el JSON:

${description}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY no configurada en las variables de entorno de Vercel.' });
  }

  const { description, focus } = req.body;

  if (!description || description.length < 500) {
    return res.status(400).json({ error: 'La descripción debe tener al menos 500 caracteres.' });
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: buildPrompt(description, focus) }],
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      let errMsg;
      try {
        const errData = JSON.parse(errText);
        errMsg = errData?.error?.message || response.statusText;
      } catch {
        errMsg = errText.substring(0, 300) || response.statusText;
      }

      return res.status(response.status).json({
        error: `Error de Gemini (${response.status}): ${errMsg}`
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start === -1 || end === -1) {
        return res.status(500).json({ error: 'No se pudo interpretar la respuesta de la IA.' });
      }
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    }

    if (
      !Array.isArray(parsed.fortalezas) ||
      !Array.isArray(parsed.oportunidades) ||
      !Array.isArray(parsed.debilidades) ||
      !Array.isArray(parsed.amenazas)
    ) {
      return res.status(500).json({ error: 'La IA devolvió un formato inesperado. Intenta de nuevo.' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno: ' + err.message });
  }
}
