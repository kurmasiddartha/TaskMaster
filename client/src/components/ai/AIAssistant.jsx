import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../DashboardLayout';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { useAIChat } from '../../hooks/useAIChat';
import { getProjects } from '../../api/projectService';
import { getTasksByProject } from '../../api/taskService';
import '../../styles/aiAssistant.css';

const QUICK_PROMPTS = [
  'Explain this error',
  'Generate viva questions',
  'Suggest architecture',
  'Improve task description',
  'Create proposal message',
  'Debug my code',
];

/**
 * Main TaskMaster AI Assistant chat page.
 * Provides context selection dropdowns linked to MERN task and project states,
 * quick action chips, and automated keyboard listeners.
 */
const AIAssistant = () => {
  const {
    messages,
    loading,
    taskContext,
    setTaskContext,
    sendMessage,
    clearChat,
  } = useAIChat();

  const [input, setInput] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');

  const scrollRef = useRef(null);
  const textRef = useRef(null);

  // Auto-scroll chat area on message generation
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load project items for context-selection mapping
  useEffect(() => {
    const fetchContextOptions = async () => {
      try {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects || []);
      } catch (err) {
        console.error('Error fetching context options:', err);
      }
    };
    fetchContextOptions();
  }, []);

  // Fetch tasks whenever project changes
  useEffect(() => {
    const fetchRelatedTasks = async () => {
      if (!selectedProject) {
        setTasks([]);
        setSelectedTask('');
        setTaskContext('');
        return;
      }

      try {
        const fetchedTasks = await getTasksByProject(selectedProject);
        setTasks(fetchedTasks || []);

        const activeProj = projects.find((p) => p._id === selectedProject);
        setTaskContext(`Project: "${activeProj?.title || ''}"`);
      } catch (err) {
        console.error('Error fetching tasks for AI context:', err);
      }
    };
    fetchRelatedTasks();
  }, [selectedProject]);

  // Sync specific task changes to context
  useEffect(() => {
    if (selectedTask) {
      const activeProj = projects.find((p) => p._id === selectedProject);
      const activeTask = tasks.find((t) => t._id === selectedTask);
      setTaskContext(
        `Project: "${activeProj?.title || ''}" | Task: "${activeTask?.title || ''}" (Status: ${activeTask?.status || ''})`
      );
    } else if (selectedProject) {
      const activeProj = projects.find((p) => p._id === selectedProject);
      setTaskContext(`Project: "${activeProj?.title || ''}"`);
    }
  }, [selectedTask]);

  const handleSend = () => {
    if (!input || !input.trim() || loading) return;
    sendMessage(input);
    setInput('');
    if (textRef.current) {
      textRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <DashboardLayout>
      <div className="ai-assistant-container">
        {/* Header bar */}
        <header className="ai-chat-header">
          <div className="ai-chat-header-info">
            <div className="ai-bot-avatar">✨</div>
            <div className="ai-chat-title">
              <h3>TaskMaster AI Assistant</h3>
              <p>Academic collaboration & coding support</p>
            </div>
          </div>

          <div className="ai-chat-header-actions">
            {/* Grounding Context Dropdown Menu */}
            <div className="ai-context-selector-wrapper">
              <span className="ai-context-label">Context Grounding:</span>
              <select
                className="ai-context-select"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>

              {selectedProject && (
                <select
                  className="ai-context-select"
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                >
                  <option value="">-- Select Task (Optional) --</option>
                  {tasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button className="ai-clear-btn" onClick={clearChat} title="Reset Chat Session">
              Reset Session
            </button>
          </div>
        </header>

        {/* Scrollable conversation history */}
        <div className="ai-messages-scroll-area">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={scrollRef} />
        </div>

        {/* Quick action prompts */}
        <div className="ai-quick-prompts-container">
          <span className="quick-prompts-title">Quick Actions:</span>
          <div className="quick-prompts-scrollable">
            {QUICK_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                className="quick-prompt-chip"
                onClick={() => setInput(promptText)}
                disabled={loading}
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        {/* User Input Area */}
        <div className="ai-chat-input-bar">
          <div className="ai-chat-textarea-wrapper">
            <textarea
              ref={textRef}
              rows={1}
              className="ai-chat-textarea"
              placeholder="Ask TaskMaster AI for coding help, project architecture, viva prep..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
          <button
            className="ai-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            title="Send message"
          >
            <span className="send-icon">▲</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;
