// Layer 1: Local blocklist (instant, free)
const BLOCKED_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'dick', 'cock', 'pussy',
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'slut', 'whore', 'cunt',
  'nazi', 'hitler', 'kill', 'murder', 'rape', 'porn', 'sex', 'drug',
  'weed', 'cocaine', 'meth', 'heroin',
]

// Common letter substitutions
const SUBSTITUTIONS: Record<string, string> = {
  '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i',
  '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't',
}

function normalizeText(text: string): string {
  let normalized = text.toLowerCase()
  for (const [sub, letter] of Object.entries(SUBSTITUTIONS)) {
    normalized = normalized.replaceAll(sub, letter)
  }
  // Remove non-alphanumeric
  normalized = normalized.replace(/[^a-z]/g, '')
  return normalized
}

function checkBlocklist(name: string): boolean {
  const normalized = normalizeText(name)
  return BLOCKED_WORDS.some(word => normalized.includes(word))
}

// Layer 2: Claude API for edge cases
async function checkWithClaude(name: string): Promise<boolean> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return true // If no API key, pass through (blocklist already checked)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: `You are a content filter for a kids' car naming game (ages 5-12). Reply ONLY with "SAFE" or "UNSAFE". A name is UNSAFE if it contains or references profanity, hate speech, sexual content, violence, drug references, or anything inappropriate for children. The name to check is: "${name}"`,
        }],
      }),
    })

    if (!response.ok) return true // Fail open — don't block signups if AI is down

    const data = await response.json()
    const result = data.content?.[0]?.text?.trim().toUpperCase()
    return result === 'SAFE'
  } catch {
    return true // Fail open
  }
}

export async function isNameSafe(name: string): Promise<{ safe: boolean; reason?: string }> {
  // Empty or too short
  if (!name || name.trim().length < 1) {
    return { safe: false, reason: 'Name cannot be empty' }
  }

  // Too long
  if (name.length > 24) {
    return { safe: false, reason: 'Name must be 24 characters or less' }
  }

  // Layer 1: Blocklist
  if (checkBlocklist(name)) {
    return { safe: false, reason: 'This name is not allowed' }
  }

  // Layer 2: Claude API
  const aiSafe = await checkWithClaude(name)
  if (!aiSafe) {
    return { safe: false, reason: 'This name is not allowed' }
  }

  return { safe: true }
}
