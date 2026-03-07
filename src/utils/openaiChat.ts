/**
 * OpenAI Chat Integration
 * 
 * Direct OpenAI API integration for AI chat functionality.
 * Note: This feature is currently disabled pending future release.
 */

import { Logger } from './logger';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  text: string;
  error?: string;
}

/**
 * System prompt for the manifestation coach
 */
const SYSTEM_PROMPT = `You are Luna, a friendly and encouraging manifestation coach for the Vortex app. You help users with:

- Manifestation techniques (369 method, visualization, affirmations)
- Staying consistent with their 45-day challenge
- Writing powerful affirmations
- Understanding how manifestation works
- Motivation and encouragement
- Using the Vortex app features

Your personality:
- Warm, supportive, and empowering
- Use emojis sparingly but effectively (✨ 🌙 💫 🎯)
- Break down complex concepts simply
- Always end with a question or suggestion to keep the conversation going
- Reference the app's features when relevant (gratitude journal, affirmations, meditation, vision board)
- Keep responses concise (2-4 paragraphs max)

If asked about something outside manifestation/wellness, politely redirect to how you can help with their manifestation journey.`;

/**
 * Check if AI chat is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!OPENAI_API_KEY;
}

/**
 * Get AI response via OpenAI API
 */
export async function getAIResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  if (!OPENAI_API_KEY) {
    return {
      text: '',
      error: 'AI chat not configured',
    };
  }

  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      Logger.error('OpenAI chat error:', errorText);
      return { text: '', error: 'Chat request failed' };
    }

    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content || '';

    return { text: responseText };
  } catch (error) {
    Logger.error('AI chat error:', error);
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
