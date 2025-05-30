"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

// Complete AI Chatbot Interface - Everything in One File
export default function ChatbotInterface() {
  // State management
  const [messages, setMessages] = useState<
    Array<{
      id: string
      role: "user" | "assistant"
      content: string
      createdAt: Date
    }>
  >([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Add global styles
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
      }
      
      .chatbot-container {
        min-height: 100vh;
        padding: 1rem;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      }
      
      .chatbot-card {
        max-width: 4rem;
        max-width: 64rem;
        margin: 0 auto;
        height: calc(100vh - 2rem);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .chatbot-header {
        padding: 1.5rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        background: rgba(248, 250, 252, 0.8);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .header-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
      }
      
      .avatar-small {
        width: 2rem;
        height: 2rem;
        font-size: 0.75rem;
      }
      
      .avatar-user {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      }
      
      .header-text h1 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
      }
      
      .header-text p {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
      }
      
      .badge {
        background: #e5e7eb;
        color: #374151;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .welcome-screen {
        text-align: center;
        padding: 3rem 1rem;
        color: #6b7280;
      }
      
      .welcome-icon {
        width: 3rem;
        height: 3rem;
        margin: 0 auto 1rem;
        color: #9ca3af;
      }
      
      .welcome-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 0.5rem;
      }
      
      .welcome-text {
        max-width: 28rem;
        margin: 0 auto;
        line-height: 1.5;
      }
      
      .message-group {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
      }
      
      .message-group.user {
        flex-direction: row-reverse;
      }
      
      .message-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .message-content.user {
        align-items: flex-end;
      }
      
      .message-bubble {
        max-width: 80%;
        padding: 0.75rem 1rem;
        border-radius: 1rem;
        word-wrap: break-word;
        white-space: pre-wrap;
        line-height: 1.5;
      }
      
      .message-bubble.user {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border-bottom-right-radius: 0.25rem;
      }
      
      .message-bubble.assistant {
        background: #f3f4f6;
        color: #1f2937;
        border-bottom-left-radius: 0.25rem;
      }
      
      .message-time {
        font-size: 0.75rem;
        color: #9ca3af;
        padding: 0 0.25rem;
      }
      
      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: #f3f4f6;
        border-radius: 1rem;
        max-width: 12rem;
        border-bottom-left-radius: 0.25rem;
      }
      
      .typing-dots {
        display: flex;
        gap: 0.25rem;
      }
      
      .typing-dot {
        width: 0.5rem;
        height: 0.5rem;
        background: #9ca3af;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
      }
      
      .typing-dot:nth-child(1) { animation-delay: -0.32s; }
      .typing-dot:nth-child(2) { animation-delay: -0.16s; }
      
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      
      .input-area {
        padding: 1rem 1.5rem;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        background: rgba(248, 250, 252, 0.8);
      }
      
      .input-form {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      .input-wrapper {
        flex: 1;
        position: relative;
      }
      
      .input-field {
        width: 100%;
        padding: 0.75rem 3rem 0.75rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        background: white;
        transition: all 0.2s;
        outline: none;
      }
      
      .input-field:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .input-field:disabled {
        background: #f9fafb;
        color: #9ca3af;
        cursor: not-allowed;
      }
      
      .char-counter {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.75rem;
        color: #9ca3af;
      }
      
      .send-button {
        width: 2.5rem;
        height: 2.5rem;
        border: none;
        border-radius: 0.5rem;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        outline: none;
      }
      
      .send-button:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }
      
      .send-button:disabled {
        background: #d1d5db;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      
      .footer-text {
        text-align: center;
        font-size: 0.75rem;
        color: #9ca3af;
      }
      
      .separator {
        height: 1px;
        background: linear-gradient(to right, transparent, #e5e7eb, transparent);
        margin: 1rem 0;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .animate-spin {
        animation: spin 1s linear infinite;
      }
      
      @media (max-width: 640px) {
        .chatbot-container {
          padding: 0.5rem;
        }
        
        .chatbot-card {
          height: calc(100vh - 1rem);
          border-radius: 0.5rem;
        }
        
        .chatbot-header {
          padding: 1rem;
        }
        
        .badge {
          display: none;
        }
        
        .message-bubble {
          max-width: 90%;
        }
        
        .input-area {
          padding: 1rem;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(timestamp)
  }

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 15)

  // AI API call function
  const callAI = async (messages: Array<{ role: string; content: string }>) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || "your-api-key-here"}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant. Be concise, friendly, and informative in your responses.",
            },
            ...messages,
          ],
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      return response
    } catch (error) {
      console.error("Error calling AI:", error)
      throw error
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: generateId(),
      role: "user" as const,
      content: input.trim(),
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await callAI([
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage.content },
      ])

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Response body is null")

      const assistantMessage = {
        id: generateId(),
        role: "assistant" as const,
        content: "",
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)

      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim() !== "")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                fullContent += content
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: fullContent } : msg)),
                )
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = {
        id: generateId(),
        role: "assistant" as const,
        content: "Sorry, I encountered an error. Please try again.",
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setIsTyping(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Icons as inline SVG components
  const BotIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )

  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )

  const SendIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )

  const LoaderIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="message-group">
      <div className="avatar avatar-small">
        <BotIcon />
      </div>
      <div className="typing-indicator">
        <div className="typing-dots">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="chatbot-container">
      <div className="chatbot-card">
        {/* Header */}
        <div className="chatbot-header">
          <div className="header-info">
            <div className="avatar">
              <BotIcon />
            </div>
            <div className="header-text">
              <h1>AI Assistant</h1>
              <p>{isLoading ? "Thinking..." : "Ready to help"}</p>
            </div>
          </div>
          <div className="badge">{messages.length} messages</div>
        </div>

        {/* Messages Area */}
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <BotIcon />
              </div>
              <h3 className="welcome-title">Welcome to AI Assistant</h3>
              <p className="welcome-text">
                Start a conversation by typing a message below. I'm here to help with any questions you might have!
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={message.id}>
              <div className={`message-group ${message.role}`}>
                <div className={`avatar avatar-small ${message.role === "user" ? "avatar-user" : ""}`}>
                  {message.role === "user" ? <UserIcon /> : <BotIcon />}
                </div>
                <div className={`message-content ${message.role}`}>
                  <div className={`message-bubble ${message.role}`}>{message.content}</div>
                  <div className="message-time">{formatTime(message.createdAt)}</div>
                </div>
              </div>
              {index < messages.length - 1 && <div className="separator" />}
            </div>
          ))}

          {/* Typing Indicator */}
          {(isLoading || isTyping) && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                disabled={isLoading}
                className="input-field"
                autoComplete="off"
                maxLength={1000}
              />
              <div className="char-counter">{input.length}/1000</div>
            </div>
            <button type="submit" disabled={isLoading || !input.trim()} className="send-button">
              {isLoading ? <LoaderIcon /> : <SendIcon />}
            </button>
          </form>
          <div className="footer-text">Press Enter to send • AI responses are generated and may contain errors</div>
        </div>
      </div>
    </div>
  )
}
