import React from 'react'
import { GraduationCap, Sparkles } from 'lucide-react'

function NavBar() {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-yellow-800" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                FISD Counselor AI
              </h1>
              <p className="text-blue-100 text-sm font-medium">
                Your intelligent academic advisor
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar