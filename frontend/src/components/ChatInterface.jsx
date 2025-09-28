import React, { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Loader2 } from 'lucide-react'

function ChatInterface({ messages, onSendMessage, isLoading, hasIndexedFiles }) {
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim())
      setInputMessage('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Messages Area - ChatGPT style */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl mx-auto px-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-4">
                FISD Counselor AI
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                How can I help you with FISD policies and academic guidance today?
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className="flex gap-4 p-4 md:py-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      )}
                    </div>
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="text-gray-900 dark:text-gray-100 leading-7 whitespace-pre-wrap">
                        {message.content}
                      </div>
                      
                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sources:
                          </p>
                          <div className="space-y-1">
                            {message.sources.map((source, index) => (
                              <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline block"
                              >
                                {source.title || source.filename || 'Source'}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="group">
                <div className="flex gap-4 p-4 md:py-6">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-sm bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-gray-500 dark:text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - ChatGPT style */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  hasIndexedFiles 
                    ? "Message FISD Counselor AI..."
                    : "Please wait while PDFs are being processed..."
                }
                disabled={!hasIndexedFiles || isLoading}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                rows="1"
                style={{ minHeight: '44px', maxHeight: '200px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !hasIndexedFiles || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface