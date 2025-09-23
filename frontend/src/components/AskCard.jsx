import React, { useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'

function AskCard({ onAsk, hasIndexedFiles, isLoading }) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (question.trim() && hasIndexedFiles) {
      onAsk(question.trim())
      setQuestion('')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center mb-4">
        <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ask a Question
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              hasIndexedFiles 
                ? "Ask about FISD policies, graduation requirements, course selection, etc..."
                : "Please upload and process PDFs first to ask questions."
            }
            disabled={!hasIndexedFiles || isLoading}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white"
            rows={4}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {hasIndexedFiles ? (
              <span className="text-green-600 dark:text-green-400">✓ Ready to answer questions</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">⚠ Upload PDFs first</span>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!question.trim() || !hasIndexedFiles || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Processing...' : 'Ask Question'}
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Powered by Perplexity AI:</strong> Get real-time web search results combined with your FISD document context for comprehensive answers.
        </p>
      </div>
    </div>
  )
}

export default AskCard