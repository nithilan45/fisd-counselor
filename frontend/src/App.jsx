import React, { useState, useEffect } from 'react'
import NavBar from './components/NavBar'
import ChatInterface from './components/ChatInterface'
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
      const response = await axios.get('/api/upload/vector-store')
      setHasIndexedFiles(response.data.hasIndexedFiles)
    } catch (error) {
      console.error('Error checking vector store status:', error)
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

      const response = await axios.post('/api/ask', { question: message, history: historyPayload })
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
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
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