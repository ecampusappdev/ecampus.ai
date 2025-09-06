import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WelcomeSection = ({ isDarkTheme }) => {
  const [currentText, setCurrentText] = useState(0)
  
  const welcomeTexts = [
    "Hello! Looking for online courses?",
    "Find the best distance learning programs",
    "Discover top Indian universities",
    "Get expert guidance on admissions",
    "Explore UGC-approved courses"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % welcomeTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [welcomeTexts.length])

  return (
    <motion.div 
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative">
        <h2 className={`text-3xl md:text-4xl font-bold mb-4 min-h-[3rem] flex items-center justify-center ${
          isDarkTheme ? 'text-white' : 'text-gray-900'
        }`}>
          <AnimatePresence mode="wait">
            <motion.span 
              key={currentText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              {welcomeTexts[currentText]}
            </motion.span>
          </AnimatePresence>
        </h2>
        <motion.p 
          className={`text-lg max-w-2xl mx-auto ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-600'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          I'm here to help you find the best online and distance learning programs from top Indian universities.
        </motion.p>
      </div>
      
      {/* Animated dots */}
      <motion.div 
        className="flex justify-center space-x-1 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        {welcomeTexts.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentText 
                ? 'bg-blue-500' 
                : isDarkTheme ? 'bg-gray-600' : 'bg-gray-400'
            }`}
            animate={{ 
              scale: index === currentText ? 1.25 : 1,
              opacity: index === currentText ? 1 : 0.6
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

export default WelcomeSection
