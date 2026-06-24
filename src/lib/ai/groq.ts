import Groq from 'groq-sdk'

let client: Groq | null = null

/**
 * Gets the Groq client instance (singleton).
 */
export function getGroqClient(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error('Missing GROQ_API_KEY environment variable')
    }
    client = new Groq({ apiKey })
  }
  return client
}

/**
 * Calls Groq chat completion with a timeout.
 * Uses Llama 3.1 70B for high-quality generation.
 */
export async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number = 15000
): Promise<string> {
  const groq = getGroqClient()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const completion = await groq.chat.completions.create(
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      },
      { signal: controller.signal }
    )

    clearTimeout(timeout)
    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}
