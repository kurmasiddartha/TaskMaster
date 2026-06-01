const axios = require('axios');

// ─── Constants ────────────────────────────────────────────────────────────────
const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const MODEL_NAME = 'Qwen/Qwen2.5-Coder-7B-Instruct';
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT_MS = 45000; // 45 seconds
const MAX_HISTORY_TURNS = 10;     // Keep last 10 turns to avoid token overflow

/**
 * The system prompt defining the AI's personality and rules.
 * This is prepended to every conversation.
 */
const SYSTEM_PROMPT = `You are TaskMaster AI, an academic collaboration assistant for students.

Help users with coding doubts, debugging, project guidance, architecture suggestions, viva preparation, task clarification, and academic productivity.

Explain concepts clearly and concisely. Encourage learning and collaboration. Do not complete unethical academic cheating requests. Instead, guide the student with hints, explanations, structure, and learning-focused help.

Keep responses focused and practical. Use code examples when helpful. Format code blocks with language identifiers.`;

// ─── Messages Builder ──────────────────────────────────────────────────────────

/**
 * Builds the array of message objects for the OpenAI-compatible chat completion API.
 *
 * @param {string} userMessage - The latest user message.
 * @param {Array}  history     - Prior conversation turns [{role, content}].
 * @param {string} taskContext - Optional current task/project details.
 * @returns {Array} Array of message objects.
 */
const buildMessages = (userMessage, history = [], taskContext = '') => {
  // Start with system context
  let systemContext = SYSTEM_PROMPT;
  if (taskContext && taskContext.trim()) {
    systemContext += `\n\nCurrent task context provided by the user:\n${taskContext.trim()}`;
  }

  const messages = [
    { role: 'system', content: systemContext }
  ];

  // Append trimmed history (limit to last N turns)
  const recentHistory = history.slice(-MAX_HISTORY_TURNS);
  for (const turn of recentHistory) {
    messages.push({
      role: turn.role,
      content: turn.content
    });
  }

  // Append current user message
  messages.push({
    role: 'user',
    content: userMessage
  });

  return messages;
};

// ─── Core API Request ─────────────────────────────────────────────────────────

/**
 * Makes a single request to the Hugging Face Inference API using axios.
 *
 * @param {Array} messages - The messages array.
 * @returns {Promise<Object>} The raw response data from HF.
 * @throws Will throw on network, auth, or non-recoverable API errors.
 */
const makeHFRequest = async (messages) => {
  const apiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  try {
    const response = await axios.post(
      HF_API_URL,
      {
        model: MODEL_NAME,
        messages: messages,
        max_tokens: 512,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: REQUEST_TIMEOUT_MS,
      }
    );

    return response.data;
  } catch (err) {
    // Handle axios-specific error responses
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data;

      if (status === 401 || status === 403) {
        throw new Error('INVALID_API_KEY');
      }
      if (status === 429) {
        throw new Error('RATE_LIMIT');
      }
      // Handle model loading (503)
      if (status === 503) {
        return { loading: true, estimated_time: data?.estimated_time || 20 };
      }

      console.error('[AI Service] HF API error response:', status, data);
      throw new Error('API_ERROR');
    }

    // Handle timeout
    if (err.code === 'ECONNABORTED') {
      throw new Error('TIMEOUT');
    }

    // Handle DNS / network errors
    if (err.code === 'ENOTFOUND') {
      console.error('[AI Service] DNS resolution failed for Hugging Face API');
      throw new Error('API_ERROR');
    }

    throw err;
  }
};

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Calls the Hugging Face AI with automatic retry logic.
 * Handles model-loading 503 responses by waiting and retrying.
 *
 * @param {string} userMessage      - The user's current message.
 * @param {Array}  conversationHistory - Prior turns for memory context.
 * @param {string} taskContext      - Optional task/project context.
 * @returns {Promise<string>} The AI assistant's reply text.
 */
const getAIResponse = async (userMessage, conversationHistory = [], taskContext = '') => {
  const messages = buildMessages(userMessage, conversationHistory, taskContext);

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const data = await makeHFRequest(messages);

      // Model is still loading — wait and retry
      if (data && data.loading) {
        const waitMs = Math.min((data.estimated_time || 20) * 1000, 30000);
        console.log(`[AI Service] Model loading, waiting ${waitMs / 1000}s before retry ${attempt}/${MAX_RETRIES}...`);
        await new Promise((res) => setTimeout(res, waitMs));
        continue;
      }

      // Extract the generated text from the response
      const generated = data?.choices?.[0]?.message?.content;

      if (!generated || !generated.trim()) {
        throw new Error('EMPTY_RESPONSE');
      }

      return generated.trim();
    } catch (err) {
      lastError = err;

      // Non-retryable errors — fail immediately
      if (
        err.message === 'MISSING_API_KEY' ||
        err.message === 'INVALID_API_KEY' ||
        err.message === 'RATE_LIMIT' ||
        err.message === 'EMPTY_RESPONSE'
      ) {
        break;
      }

      // Retryable errors (TIMEOUT, API_ERROR, network issues)
      if (attempt < MAX_RETRIES) {
        const backoffMs = attempt * 2000; // 2s, 4s exponential backoff
        console.log(`[AI Service] Attempt ${attempt} failed (${err.message}). Retrying in ${backoffMs / 1000}s...`);
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }
  }

  // All retries exhausted — rethrow last error
  throw lastError;
};

module.exports = { getAIResponse };
