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
      // Build compact history for context
      const historyPayload = messages.map(m => ({
        role: m.type === 'bot' ? 'assistant' : 'user',
        type: m.type,
        content: m.content,
      }))

      // Always use Render backend directly
      console.log('Sending request to:', 'https://fisd-counselor.onrender.com/api/ask')
      console.log('Payload:', { question: message, conversationHistory: historyPayload })
      
      const response = await axios.post('https://fisd-counselor.onrender.com/api/ask', { question: message, conversationHistory: historyPayload })
      console.log('Response received:', response.data)
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.answer,
        sources: response.data.sources || [],
        followUps: response.data.followUps || [],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error asking question:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.'
      if (error.response?.status === 0) {
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
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <NavBar />
      
      {/* Debug component - remove after testing */}
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