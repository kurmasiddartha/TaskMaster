import api from '../api/axios';

/**
 * Send a chat message to the TaskMaster AI Assistant.
 *
 * @param {string} message - The current user message.
 * @param {Array} conversationHistory - Prior turns for memory.
 * @param {string} taskContext - Details of the task being discussed.
 * @returns {Promise<string>} The AI's reply.
 */
export const sendAIChatMessage = async (message, conversationHistory = [], taskContext = '') => {
  try {
    const response = await api.post('/api/ai/chat', {
      message,
      conversationHistory,
      taskContext,
    });
    return response.data.reply;
  } catch (error) {
    console.error('AI API error:', error);
    throw new Error(error.response?.data?.error || 'AI Assistant is temporarily unavailable. Please try again.');
  }
};
