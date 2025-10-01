import React, { useState, useEffect } from 'react'
import NavBar from './components/NavBar'
import ChatInterface from './components/ChatInterface'
import PingTest from './components/PingTest'
import axios from 'axios'

function App() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasIndexedFiles, setHasIndexedFiles] = useState(false)

  useEffect(() => {
    checkVectorStoreStatus()
    // Simple welcome message
    setMessages([{
      id: 1,
      type: 'bot',
      content: "Hi! I'm your FISD Counselor AI. I can help you with questions about FISD policies, graduation requirements, course selection, and more. What would you like to know?",
      timestamp: new Date()
    }])
  }, [])

  const checkVectorStoreStatus = async () => {
    try {
      // Always use Render backend directly
      const response = await axios.get('https://fisd-counselor.onrender.com/api/upload')
      setHasIndexedFiles(response.data.hasIndexedFiles)
    } catch (error) {
      console.error('Error checking vector store status:', error)
      // For production deployment, assume files are available
      setHasIndexedFiles(true)
    }
  }

  const handleSendMessage = async (message) => {
    if (!message.trim() || isLoading) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Build compact history for context (limit to last 10 messages to prevent payload size issues)
      const recentMessages = messages.slice(-10) // Only last 10 messages
      const historyPayload = recentMessages.map(m => ({
        type: m.type === 'bot' ? 'assistant' : 'user',
        content: m.content,
      }))

      // Always use Render backend directly
      console.log('Sending request to:', 'https://fisd-counselor.onrender.com/api/ask')
      console.log('Payload:', { question: message, conversationHistory: historyPayload })
      
      const response = await axios.post('https://fisd-counselor.onrender.com/api/ask', { question: message, conversationHistory: historyPayload }, {
        timeout: 35000, // 35 second timeout for Render cold starts with conversation history
        headers: {
          'Content-Type': 'application/json',
        }
      })
      console.log('Response received:', response.data)
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.answer,
        sources: response.data.sources || [],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error asking question:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        conversationLength: messages.length,
        historyPayloadLength: historyPayload.length
      })
      
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.'
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. The server may be slow to respond. Please try again.'
      } else if (error.response?.status === 0) {
        errorMessage = 'Network error: Cannot connect to server. Please check your internet connection.'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again in a moment.'
      } else if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please contact support.'
      }
      
      const errorMessageObj = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMessage,
        error: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessageObj])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col">
      <NavBar />

      {/* Backend Connection Test */}
      <PingTest />

      <main className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          hasIndexedFiles={hasIndexedFiles}
        />
      </main>
    </div>
  )
}

export default App