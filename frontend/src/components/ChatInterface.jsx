import React, { useState, useRef, useEffect } from 'react'
import { Send, User } from 'lucide-react'

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
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-3 ${
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>

              {/* Simple Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Sources: {message.sources.map((source, index) => (
                      <span key={index}>
                        {source.type === 'web' ? source.title : source.filename}
                        {index < message.sources.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>


      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              hasIndexedFiles 
                ? "Ask about FISD policies, graduation requirements..."
                : "Please wait while PDFs are being processed..."
            }
            disabled={!hasIndexedFiles || isLoading}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || !hasIndexedFiles || isLoading}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface