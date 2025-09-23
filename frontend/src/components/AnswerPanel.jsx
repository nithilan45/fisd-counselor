import React from 'react'
import { MessageSquare, ExternalLink, FileText, AlertTriangle } from 'lucide-react'

function AnswerPanel({ answer }) {
  if (!answer) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Answer
          </h2>
        </div>
        
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Ask a question to see the answer here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center mb-4">
        <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Answer
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question:
          </h3>
          <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            {answer.question}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Answer:
          </h3>
          <div className={`p-4 rounded-md ${
            answer.error 
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
              : 'bg-gray-50 dark:bg-gray-700'
          }`}>
            {answer.error && (
              <div className="flex items-center mb-3 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Error occurred</span>
              </div>
            )}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {answer.answer.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {answer.sources && answer.sources.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sources:
            </h3>
            <div className="space-y-2">
              {answer.sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="flex items-center">
                    {source.type === 'web' ? (
                      <ExternalLink className="w-4 h-4 text-blue-600 mr-2" />
                    ) : (
                      <FileText className="w-4 h-4 text-green-600 mr-2" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {source.type === 'web' ? source.title : `${source.filename} · p. ${source.page}`}
                    </span>
                  </div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnswerPanel