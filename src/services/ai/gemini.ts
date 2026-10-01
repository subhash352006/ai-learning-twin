/**
 * Client-side AI Connector
 * All calls are proxied through the server endpoint `/api/gemini`.
 * The API key is NEVER accessed on the frontend.
 */

export class GeminiApiClient {
  /**
   * Calls the server-side `/api/gemini` endpoint.
   * The server accesses GEMINI_API_KEY securely.
   */
  public static async generateStructuredContent<T>(
    prompt: string,
    systemInstruction: string = 'You are the AI Learning Twin cognitive engine. Respond ONLY with valid JSON.'
  ): Promise<T | null> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction }),
      });

      if (!response.ok) {
        console.warn(`/api/gemini returned status ${response.status}`);
        return null;
      }

      const data = await response.json();
      if (!data || data.configured === false || !data.text) {
        return null;
      }

      let cleaned = data.text.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        cleaned = match[0];
      }
      return JSON.parse(cleaned) as T;
    } catch (err) {
      console.warn('Call to /api/gemini failed, using cognitive engine:', err);
      return null;
    }
  }
}
