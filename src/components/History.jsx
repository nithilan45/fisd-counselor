import React from 'react'
import { History as HistoryIcon, MessageSquare, Trash2 } from 'lucide-react'

function History({ history }) {
  const clearHistory = () => {
    // This would need to be implemented in the parent component
    console.log('Clear history requested')
  }

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <HistoryIcon className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              History
            </h2>
          </div>
        </div>
        
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No questions asked yet
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <HistoryIcon className="w-5 h-5 mr-2 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Questions
          </h2>
        </div>
        <button
          onClick={clearHistory}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="Clear history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((item, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.question}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {item.answer.substring(0, 100)}...
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-xs text-gray-400">
                    {item.sources?.length || 0} sources
                  </span>
                  {item.error && (
                    <span className="text-xs text-red-500">Error</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Showing last {history.length} questions
      </div>
    </div>
  )
}

export default History