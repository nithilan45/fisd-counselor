import React from 'react'

function NavBar() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">🎓</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              FISD Counselor AI
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your intelligent assistant for FISD policies and guidance
            </p>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar