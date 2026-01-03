/**
 * OpenAI Chat Integration
 * Provides AI-powered chatbot responses using OpenAI's GPT API
 * 
 * Setup:
 * 1. Get API key from https://platform.openai.com/api-keys
 * 2. Add to .env: OPENAI_API_KEY=your-key-here
 * 3. Install: npm install openai (optional, using fetch directly)
 */

// Safely import env variables
let OPENAI_API_KEY: string | undefined;
try {
  const env = require('@env');
  OPENAI_API_KEY = env.OPENAI_API_KEY;
} catch (error) {
  OPENAI_API_KEY = undefined;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  text: string;
  error?: string;
}

/**
 * System prompt for the manifestation coach persona
 */
const SYSTEM_PROMPT = `You are Luna, a friendly and encouraging manifestation coach for the Moonifest app. You help users with:

- Manifestation techniques (369 method, visualization, affirmations)
- Staying consistent with their 45-day challenge
- Writing powerful affirmations
- Understanding how manifestation works
- Motivation and encouragement
- Using the Moonifest app features

Your personality:
- Warm, supportive, and empowering
- Use emojis sparingly but effectively (✨ 🌙 💫 🎯)
- Break down complex concepts simply
- Always end with a question or suggestion to keep the conversation going
- Reference the app's features when relevant (gratitude journal, affirmations, meditation, vision board)
- Keep responses concise (2-4 paragraphs max)

If asked about something outside manifestation/wellness, politely redirect to how you can help with their manifestation journey.`;

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!(OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here');
}

/**
 * Get AI response from OpenAI
 */
export async function getAIResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  if (!isOpenAIConfigured()) {
    return {
      text: '',
      error: 'OpenAI API key not configured',
    };
  }

  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective model, can upgrade to gpt-4 if needed
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 500, // Keep responses concise
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('No response from OpenAI');
    }

    return {
      text: assistantMessage.trim(),
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Failed to get AI response',
    };
  }
}

/**
 * Convert conversation history to ChatMessage format
 */
export function formatConversationHistory(
  messages: Array<{ text: string; sender: 'user' | 'bot' }>
): ChatMessage[] {
  return messages
    .filter(msg => msg.text.trim())
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));
}
