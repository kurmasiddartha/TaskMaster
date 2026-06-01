import { useState, useEffect } from 'react';
import { sendAIChatMessage } from '../services/aiApi';

/**
 * Reusable React hook for TaskMaster AI Assistant session management.
 * Tracks state of chat history, API requests, active learning contexts, and errors.
 *
 * @param {string} initialContext - Optional initial task context string.
 */
export const useAIChat = (initialContext = '') => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskContext, setTaskContext] = useState(initialContext);

  // Initialize session with a friendly prompt welcoming the student
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I am **TaskMaster AI**, your academic collaboration assistant. 🎓\n\nI can help you explain complex DSA concepts, debug errors in your code, suggest premium project architectures, generate viva prep questions, or compose proposal pitches for potential collaborators.\n\n*Feel free to select a project context from the menu above to ground our conversation!*',
        timestamp: new Date(),
      },
    ]);
  }, []);

  /**
   * Dispatches a message to the backend and appends the user & assistant bubbles.
   *
   * @param {string} content - Message text to send.
   */
  const sendMessage = async (content) => {
    if (!content || !content.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    // Format previous messages for the model's history input constraint
    const apiHistory = messages
      .filter((msg) => msg.id !== 'welcome' && !msg.isError)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    try {
      const reply = await sendAIChatMessage(content.trim(), apiHistory, taskContext);

      const assistantMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message);

      // Render a fallback error bubble inside the chat view
      const errorMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Notification:** ${err.message}`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resets the active chat session.
   */
  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I am **TaskMaster AI**, your academic collaboration assistant. 🎓\n\nI can help you explain complex DSA concepts, debug errors in your code, suggest premium project architectures, generate viva prep questions, or compose proposal pitches for potential collaborators.\n\n*Feel free to select a project context from the menu above to ground our conversation!*',
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    taskContext,
    setTaskContext,
    sendMessage,
    clearChat,
  };
};
