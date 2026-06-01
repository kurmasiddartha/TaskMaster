import React from 'react';

/**
 * Animated typing bubble showing a loading state while AI generates response.
 */
const TypingIndicator = () => {
  return (
    <div className="typing-indicator-container">
      <div className="typing-bubble">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <span className="typing-text">TaskMaster AI is generating response...</span>
    </div>
  );
};

export default TypingIndicator;
