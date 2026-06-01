import React, { useState } from 'react';

/**
 * Renders individual chat bubbles with inline markdown parsing and syntax-highlighted code containers.
 */
const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  /**
   * Helper function to chunk text by code block markers and render custom formatted structures.
   */
  const renderMessageContent = (text) => {
    if (!text) return '';

    // Split text by fenced triple backticks code blocks
    const chunks = text.split(/(```[\s\S]*?```)/g);

    return chunks.map((chunk, idx) => {
      if (chunk.startsWith('```') && chunk.endsWith('```')) {
        const rawLines = chunk.slice(3, -3).trim().split('\n');
        let language = 'CODE';
        let codeLines = rawLines;

        // Extract programming language identifier from the first line if present
        if (rawLines[0] && !rawLines[0].includes(' ') && rawLines[0].length < 15) {
          language = rawLines[0].toUpperCase();
          codeLines = rawLines.slice(1);
        }

        const codeContent = codeLines.join('\n');
        return <CodeSnippet key={idx} code={codeContent} language={language} />;
      }

      // Render standard paragraph content with rich inline formatting
      return (
        <span
          key={idx}
          className="message-text"
          dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(chunk) }}
        />
      );
    });
  };

  return (
    <div className={`chat-message-row ${isUser ? 'user-message' : 'assistant-message'} ${message.isError ? 'error-bubble' : ''}`}>
      <div className="message-avatar">
        <span>{isUser ? '👤' : '✨'}</span>
      </div>
      <div className="message-bubble-wrapper">
        <div className="message-bubble">
          <div className="message-body">{renderMessageContent(message.content)}</div>
          <div className="message-meta-info">
            <span className="message-timestamp">{timeString}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Embedded code block wrapper with functional copy-to-clipboard behavior.
 */
const CodeSnippet = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-snippet-container">
      <div className="code-snippet-header">
        <span className="code-snippet-lang">{language}</span>
        <button className="code-copy-btn" onClick={copyToClipboard}>
          {copied ? '✓ Copied' : 'Copy Code'}
        </button>
      </div>
      <pre className="code-snippet-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
};

/**
 * Escapes unsafe characters to prevent XSS and parses standard text markers (bold, italics, lists, inline backticks).
 */
const parseInlineMarkdown = (rawText) => {
  if (!rawText) return '';

  let sanitized = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Parse inline backticks: `const val = 1` -> <code class="inline-code">const val = 1</code>
  sanitized = sanitized.replace(/`([^`\n]+)`/g, '<code class="chat-inline-code">$1</code>');

  // Parse double backstars for bolding: **text** -> <strong>text</strong>
  sanitized = sanitized.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Parse single backstars for italicizing: *text* -> <em>text</em>
  sanitized = sanitized.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Parse standard lists items to bulleted structures
  sanitized = sanitized.replace(/\n\*\s([^\n]+)/g, '<br/>• $1');
  sanitized = sanitized.replace(/\n-\s([^\n]+)/g, '<br/>• $1');

  // Standard carriage returns -> <br/>
  sanitized = sanitized.replace(/\n/g, '<br/>');

  return sanitized;
};

export default ChatMessage;
