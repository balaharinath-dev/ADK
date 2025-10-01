import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Settings, Plus, Minimize2, Bot, User, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000/chat');
  const [showSettings, setShowSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'I received your message.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to the API'}. Please check your endpoint.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  };

  if (isMinimized) {
    return (
      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center group transition-all hover:scale-110"
        >
          <MessageSquare size={24} className="text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl z-40">
      {/* Header */}
      <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 animate-pulse"></div>
          <h2 className="text-sm font-semibold text-zinc-100">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={startNewChat}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
            title="New Chat"
          >
            <Plus size={16} className="text-zinc-400" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
            title="Settings"
          >
            <Settings size={16} className="text-zinc-400" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
            title="Minimize"
          >
            <Minimize2 size={16} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-zinc-800 bg-zinc-900/30 p-3">
          <label className="block text-xs font-medium mb-2 text-zinc-400">API Endpoint</label>
          <input
            type="text"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-100"
            placeholder="http://localhost:8000/chat"
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
              message.role === 'assistant' 
                ? 'bg-gradient-to-br from-orange-500 to-pink-500' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
              {message.role === 'assistant' ? (
                <Bot size={16} className="text-white" />
              ) : (
                <User size={16} className="text-white" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white ml-8'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-100 mr-8'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
              </div>
              <div className={`text-xs mt-1 px-1 ${
                message.role === 'user' ? 'text-right text-zinc-500' : 'text-zinc-600'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-zinc-400" />
                <span className="text-xs text-zinc-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-800 p-3 bg-zinc-900/30 backdrop-blur">
        <div className="flex items-end gap-2 bg-zinc-900 rounded-lg border border-zinc-800 p-2 focus-within:border-zinc-700 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none focus:outline-none max-h-[120px] placeholder-zinc-500 text-zinc-100"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-zinc-600 text-center mt-2">
          Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;