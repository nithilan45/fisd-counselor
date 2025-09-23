import React from 'react'
import { FileText, RefreshCw, Upload, FolderOpen } from 'lucide-react'

function PDFUploader({ uploadedFiles, isLoading, onRefresh, inputDirPath, onProcessPdfs }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          PDF Documents
        </h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <FolderOpen className="w-4 h-4 mr-2" />
          <span>Input Directory:</span>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 text-sm font-mono">
          {inputDirPath || 'Loading...'}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Place your FISD PDF files in this directory to process them automatically.
        </p>
      </div>

      {uploadedFiles.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Processed Files ({uploadedFiles.length})
            </span>
            <button
              onClick={onProcessPdfs}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Upload className="w-3 h-3 mr-1" />
              Process Now
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{file}</span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">✓ Processed</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No PDFs processed yet
          </p>
          <button
            onClick={onProcessPdfs}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center mx-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            Process PDFs
          </button>
        </div>
      )}
    </div>
  )
}

export default PDFUploader