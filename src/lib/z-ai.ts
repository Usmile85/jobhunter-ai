import { execSync } from 'child_process';
import { readFileSync, unlinkSync, existsSync } from 'fs';

/**
 * Call z-ai chat CLI and return the parsed response content
 */
export async function zaiChat(prompt: string, systemPrompt: string): Promise<string> {
  const outputFile = `/tmp/z-ai-output-${Date.now()}.json`;

  try {
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/`/g, '\\`');
    const escapedSystem = systemPrompt.replace(/"/g, '\\"').replace(/`/g, '\\`');

    const command = `z-ai chat --prompt "${escapedPrompt}" --system "${escapedSystem}" --output ${outputFile}`;
    execSync(command, { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

    if (!existsSync(outputFile)) {
      throw new Error('z-ai chat did not produce output file');
    }

    const raw = readFileSync(outputFile, 'utf-8');
    const parsed = JSON.parse(raw);

    const content = parsed?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in z-ai chat response');
    }

    return content;
  } finally {
    if (existsSync(outputFile)) {
      unlinkSync(outputFile);
    }
  }
}

/**
 * Call z-ai chat CLI and parse the response as JSON.
 * Handles markdown-wrapped JSON (```json ... ```).
 */
export async function zaiChatJSON<T = unknown>(prompt: string, systemPrompt: string): Promise<T> {
  const content = await zaiChat(prompt, systemPrompt);

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
 * Call z-ai web_search function and return the search results
 */
export async function zaiWebSearch(query: string, num: number = 10): Promise<{ results: Array<{ title: string; url: string; snippet?: string }> }> {
  const outputFile = `/tmp/z-ai-output-${Date.now()}.json`;

  try {
    const args = JSON.stringify({ query, num });
    const command = `z-ai function --name "web_search" --args '${args.replace(/'/g, "'\\''")}' --output ${outputFile}`;
    execSync(command, { timeout: 120000, maxBuffer: 10 * 1024 * 1024 });

    if (!existsSync(outputFile)) {
      throw new Error('z-ai web_search did not produce output file');
    }

    const raw = readFileSync(outputFile, 'utf-8');
    const parsed = JSON.parse(raw);

    return parsed;
  } finally {
    if (existsSync(outputFile)) {
      unlinkSync(outputFile);
    }
  }
}
