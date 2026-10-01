/**
 * Gemini API Integration Layer
 * Uses GEMINI_API_KEY from environment variables (or VITE_GEMINI_API_KEY for Vite client build).
 * NEVER prompts the user for an API key.
 */

const DEFAULT_MODEL = 'gemini-2.5-flash';

export class GeminiApiClient {
  private static getEnvApiKey(): string | null {
    // Check Vite client env or global process env
    const metaEnv = (import.meta as any).env;
    const globalProcess = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
    const key =
      metaEnv?.VITE_GEMINI_API_KEY ||
      metaEnv?.GEMINI_API_KEY ||
      globalProcess?.env?.GEMINI_API_KEY ||
      globalProcess?.env?.VITE_GEMINI_API_KEY;

    if (key && typeof key === 'string' && key.trim().length > 5) {
      return key.trim();
    }
    return null;
  }

  public static isConfigured(): boolean {
    return Boolean(this.getEnvApiKey());
  }

  public static async generateStructuredContent<T>(
    prompt: string,
    systemInstruction: string = 'You are the AI Learning Twin cognitive engine. Respond ONLY with valid JSON.'
  ): Promise<T | null> {
    const apiKey = this.getEnvApiKey();
    if (!apiKey) {
      return null;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.warn(`Gemini API returned status ${response.status}`);
        return null;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      let cleaned = rawText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        cleaned = match[0];
      }
      return JSON.parse(cleaned) as T;
    } catch (err) {
      console.warn('Gemini request failed or returned invalid JSON, utilizing cognitive engine:', err);
      return null;
    }
  }
}
