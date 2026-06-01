const { getAIResponse } = require('../services/aiService');

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 1000;       // Characters per user message
const MAX_HISTORY_ITEMS = 20;          // Max conversation history items (10 turns)
const MAX_CONTEXT_LENGTH = 500;        // Characters for task context

/**
 * POST /api/ai/chat
 * Protected route — requires valid JWT (req.user is attached by middleware).
 *
 * Handles AI chat requests, validates/sanitizes inputs, calls the AI service,
 * and returns a user-friendly response.
 */
const chat = async (req, res) => {
  try {
    let { message, taskContext, conversationHistory } = req.body;

    // ── Input Validation ──────────────────────────────────────────────────────

    // Empty or missing message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a message before sending.',
      });
    }

    // Sanitize: trim whitespace
    message = message.trim();

    // Message length limit
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    // Basic prompt injection protection — strip known injection patterns
    message = message.replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/gi, '');

    // Validate and sanitize conversation history
    if (!Array.isArray(conversationHistory)) {
      conversationHistory = [];
    }

    // Limit and validate history shape
    conversationHistory = conversationHistory
      .filter(
        (turn) =>
          turn &&
          typeof turn.role === 'string' &&
          typeof turn.content === 'string' &&
          ['user', 'assistant'].includes(turn.role)
      )
      .slice(-MAX_HISTORY_ITEMS); // Keep last N items

    // Sanitize task context
    if (taskContext && typeof taskContext === 'string') {
      taskContext = taskContext
        .trim()
        .replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/gi, '')
        .slice(0, MAX_CONTEXT_LENGTH);
    } else {
      taskContext = '';
    }

    // ── Call AI Service ───────────────────────────────────────────────────────

    const reply = await getAIResponse(message, conversationHistory, taskContext);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (err) {
    // ── Map service errors to user-friendly messages ───────────────────────────
    console.error('[AI Controller] Error:', err.message);

    const errorMap = {
      MISSING_API_KEY: {
        status: 503,
        error: 'AI Assistant is not configured. Please contact the administrator.',
      },
      INVALID_API_KEY: {
        status: 503,
        error: 'AI Assistant is temporarily unavailable. Please try again later.',
      },
      RATE_LIMIT: {
        status: 429,
        error: 'AI Assistant is receiving too many requests. Please wait a moment and try again.',
      },
      TIMEOUT: {
        status: 504,
        error: 'AI Assistant took too long to respond. Please try again.',
      },
      EMPTY_RESPONSE: {
        status: 502,
        error: 'AI Assistant returned an empty response. Please rephrase your question and try again.',
      },
      API_ERROR: {
        status: 502,
        error: 'AI Assistant is temporarily unavailable. Please try again.',
      },
    };

    const mapped = errorMap[err.message];
    if (mapped) {
      return res.status(mapped.status).json({ success: false, error: mapped.error });
    }

    // Generic fallback — never expose internal details
    return res.status(500).json({
      success: false,
      error: 'AI Assistant is temporarily unavailable. Please try again.',
    });
  }
};

module.exports = { chat };
