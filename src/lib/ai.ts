import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Call OpenAI chat completion and return the response content
 */
export async function aiChat(prompt: string, systemPrompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content in AI response');
  }
  return content;
}

/**
 * Call OpenAI chat and parse response as JSON.
 * Handles markdown-wrapped JSON (```json ... ```).
 */
export async function aiChatJSON<T = unknown>(prompt: string, systemPrompt: string): Promise<T> {
  const content = await aiChat(prompt, systemPrompt);

  // Strip markdown code fences if present
  let cleaned = content.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  return JSON.parse(cleaned) as T;
}

/**
 * Search the web using Serper.dev API
 * Sign up at https://serper.dev for a free API key (2500 free searches)
 */
export async function webSearch(query: string, num: number = 10): Promise<Array<{ title: string; url: string; snippet?: string; source?: string }>> {
  const apiKey = process.env.SERPER_API_KEY;
  
  if (!apiKey) {
    throw new Error('SERPER_API_KEY environment variable is required for web search');
  }

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      num,
      gl: 'ng', // Default to Nigeria, user can change
    }),
  });

  if (!response.ok) {
    throw new Error(`Search API failed with status ${response.status}`);
  }

  const data = await response.json();

  // Serper returns organic results array
  const organic = data.organic || [];
  return organic.map((r: { title?: string; link?: string; snippet?: string }) => ({
    title: r.title || '',
    url: r.link || '',
    snippet: r.snippet || '',
    source: r.link ? new URL(r.link).hostname : '',
  }));
}
