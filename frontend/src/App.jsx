import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ecampus-chat-messages')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadData, setLeadData] = useState({ name: '', email: '', phone: '', action: '' })
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('ecampus-theme')
    return saved ? JSON.parse(saved) : false
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const listRef = useRef(null)

  // Convert plain text cues into markdown headings for consistent rendering
  const formatMessage = (text) => {
    if (!text) return text
    // Promote lines starting with "Semester <number>" to h2
    let formatted = text.replace(/(^|\n)\s*Semester\s+(\d+)\s*(\n|$)/g, (m, p1, num, p3) => `${p1}## Semester ${num}\n`)
    // Optional: Promote lines that look like numbered section titles like "1. <Title>" to h3
    formatted = formatted.replace(/(^|\n)\s*\d+\.\s+([^\n]+)\s*(\n|$)/g, (m, p1, title, p3) => `${p1}### ${title.trim()}\n`)
    return formatted
  }

  // Custom link component to open links in new tab
  const CustomLink = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="external-link">
      {children}
    </a>
  )

  useEffect(() => {
    if (listRef.current) {
      setTimeout(() => {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 100);
    }
  }, [messages, typing])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ecampus-chat-messages', JSON.stringify(messages))
  }, [messages])

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('ecampus-theme', JSON.stringify(isDarkTheme))
  }, [isDarkTheme])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowChat(false)
        setIsMobileMenuOpen(false)
      }
    }
    
    if (showChat) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showChat])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && !e.target.closest('.chat-sidebar') && !e.target.closest('.mobile-menu-btn')) {
        setIsMobileMenuOpen(false)
      }
    }
    
    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  async function handleSend(e) {
    e.preventDefault()
    const question = input.trim()
    if (!question) return
    const userMsg = { id: Date.now(), role: 'user', text: question }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setTyping(true)
    
    // Add a placeholder message for the streaming response
    const assistantMsgId = Date.now() + 1
    setMessages((m) => [...m, { id: assistantMsgId, role: 'assistant', text: '' }])
    
    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.text
      }));

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question,
          conversationHistory 
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.full) {
                // Final message, add action buttons
                setMessages((m) => m.map(msg => 
                  msg.id === assistantMsgId 
                    ? { ...msg, text: data.fullResponse }
                    : msg
                ))
                setTyping(false)
                return
              } else if (data.content) {
                // Stream content
                setMessages((m) => m.map(msg => 
                  msg.id === assistantMsgId 
                    ? { ...msg, text: msg.text + data.content }
                    : msg
                ))
              }
            } catch (e) {
              console.error('Error parsing stream data:', e)
            }
          }
        }
      }
    } catch (err) {
      setMessages((m) => m.map(msg => 
        msg.id === assistantMsgId 
          ? { ...msg, text: 'Error contacting server.' }
          : msg
      ))
      setTyping(false)
    }
  }

  const quickQuestions = [
    'Available Online Courses',
    'Fees Structure', 
    'Eligibility Criteria',
    'Admission Process',
    'Scholarships & Discounts'
  ]

  const handleQuickQuestion = (question) => {
    setInput(question)
    handleSend({ preventDefault: () => {} })
  }

  const handleLeadCapture = (action) => {
    setShowLeadForm(true)
    setLeadData(prev => ({ ...prev, action }))
  }

  const submitLeadForm = async (e) => {
    e.preventDefault()
    
    try {
      // Get the last question from messages
      const lastQuestion = messages.length > 0 ? messages[messages.length - 1].text : 'No question asked'
      
      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.text
      }))

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          action: leadData.action,
          conversationHistory,
          lastQuestion
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setShowLeadForm(false)
        setLeadData({ name: '', email: '', phone: '', action: '' })
        setMessages((m) => [...m, { 
          id: Date.now(), 
          role: 'assistant', 
          text: `Thank you! Our team will contact you within 24 hours. Your reference ID: ${data.leadId}`
        }])
      } else {
        alert('Error saving lead. Please try again.')
      }
    } catch (error) {
      console.error('Error saving lead:', error)
      alert('Error saving lead. Please try again.')
    }
  }

  if (showChat) {
  return (
      <div className={`chat-full-page ${isDarkTheme ? 'dark' : 'light'}`}>
        <div className="chat-header">
          <div className="chat-header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              ☰
            </button>
            <div className="logo">
              <span className="logo-icon">🎓</span>
              <span className="logo-text">eCampus</span>
            </div>
            <span className="tagline">Your Distance Learning</span>
          </div>
          <div className="chat-header-right">
            {/* New Chat Controls */}
            <button
              className="header-btn"
              onClick={() => {
                if (!messages.length) return
                // Archive current chat into localStorage (history list)
                const historyKey = 'ecampus-chat-history'
                const existing = JSON.parse(localStorage.getItem(historyKey) || '[]')
                const title = messages.find(m => m.role === 'user')?.text?.slice(0, 60) || 'New chat'
                existing.unshift({ id: Date.now(), title, messages })
                localStorage.setItem(historyKey, JSON.stringify(existing))
                // Start new chat
                setMessages([])
                localStorage.removeItem('ecampus-chat-messages')
              }}
            >
              New Chat
            </button>
            <button
              className="header-btn secondary"
              onClick={() => {
                setMessages([])
                localStorage.removeItem('ecampus-chat-messages')
              }}
            >
              Clear Chat
            </button>
            <button className="theme-toggle" onClick={() => setIsDarkTheme(!isDarkTheme)}>
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
            <button className="close-chat" onClick={() => setShowChat(false)}>
              ✕
            </button>
          </div>
        </div>

        <div className="chat-container">
          <div className={`chat-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-section">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => handleLeadCapture('brochure')}>
                  📋 Get Brochure
                </button>
                <button className="action-btn" onClick={() => handleLeadCapture('counselor')}>
                  📞 Talk to Counselor
                </button>
                <button className="action-btn primary" onClick={() => handleLeadCapture('apply')}>
                  🎯 Apply Now
                </button>
              </div>
            </div>
            
            <div className="sidebar-section">
              <h3>Quick Questions</h3>
              <div className="quick-questions">
                {quickQuestions.map((question, idx) => (
                  <button 
                    key={idx} 
                    className="quick-question-btn"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Popular Courses</h3>
              <div className="popular-courses">
                <div className="course-item">
                  <span className="course-icon">🎓</span>
                  <span className="course-name">Online MBA</span>
                </div>
                <div className="course-item">
                  <span className="course-icon">💼</span>
                  <span className="course-name">PG Diploma</span>
                </div>
                <div className="course-item">
                  <span className="course-icon">📚</span>
                  <span className="course-name">BBA Online</span>
                </div>
                <div className="course-item">
                  <span className="course-icon">🔬</span>
                  <span className="course-name">MSc IT</span>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Top Universities</h3>
              <div className="universities-list">
                <div className="university-item">
                  <span className="university-icon">🏛️</span>
                  <span className="university-name">IGNOU</span>
                </div>
                <div className="university-item">
                  <span className="university-icon">🎓</span>
                  <span className="university-name">TISS</span>
                </div>
                <div className="university-item">
                  <span className="university-icon">🏫</span>
                  <span className="university-name">Amity</span>
                </div>
                <div className="university-item">
                  <span className="university-icon">🌟</span>
                  <span className="university-name">Manipal</span>
                </div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Why Choose Online?</h3>
              <div className="benefits-list">
                <div className="benefit-item">
                  <span className="benefit-icon">⏰</span>
                  <span className="benefit-text">Flexible Schedule</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">💰</span>
                  <span className="benefit-text">Affordable Fees</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🏠</span>
                  <span className="benefit-text">Study from Home</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📜</span>
                  <span className="benefit-text">UGC Approved</span>
                </div>
              </div>
            </div>
          </div>

                    <div className="chat-main">
            <div className="chat-messages" ref={listRef}>
              {messages.length === 0 && (
                <div className="welcome-message">
                  <div className="welcome-content">
                    <h2>Hello! Looking for online courses for yourself or your child?</h2>
                    <p>I'm here to help you find the best online and distance learning programs from top Indian universities.</p>
                  </div>
                </div>
              )}
              
              {messages.map((m) => (
                <div key={m.id} className={`message ${m.role}`}>
                  <div className="message-content">
                    <ReactMarkdown 
                      components={{
                        a: CustomLink
                      }}
                    >
                      {formatMessage(m.text)}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {typing && (
                <div className="message assistant">
                  <div className="message-content typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input-container">
              <form onSubmit={handleSend} className="chat-input-form">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about online courses, fees, eligibility..."
                  className="chat-input"
                  autoFocus
                />
                <button type="submit" className="send-btn" disabled={!input.trim()}>
                  ➤
                </button>
              </form>
            </div>
          </div>
        </div>

        {showLeadForm && (
          <div className="lead-form-overlay" onClick={() => setShowLeadForm(false)}>
            <div className="lead-form" onClick={(e) => e.stopPropagation()}>
              <h3>Get Detailed Information</h3>
              <p>Fill in your details and our counselor will contact you within 24 hours.</p>
              <form onSubmit={submitLeadForm}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={leadData.name}
                  onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={leadData.email}
                  onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={leadData.phone}
                  onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                  required
                />
                <button type="submit" className="submit-lead-btn">
                  Submit & Get Brochure
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`hero-section ${isDarkTheme ? 'dark' : 'light'}`}>
      <div className="hero-content">
        <div className="hero-header">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">eCampus</span>
          </div>
          <button className="theme-toggle-hero" onClick={() => setIsDarkTheme(!isDarkTheme)}>
            {isDarkTheme ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="hero-main">
          <h1>Find the Best Online & Distance Learning Courses from Top Indian Universities</h1>
          <p className="hero-subtitle">In collaboration with reputed universities, verified programs</p>
          
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">✅</span>
              <span>UGC Approved Programs</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🏆</span>
              <span>Top Ranked Universities</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">💰</span>
              <span>Affordable Fees</span>
            </div>
          </div>

          <button className="cta-button" onClick={() => setShowChat(true)}>
            Ask Your Query
        </button>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">100+</span>
              <span className="stat-label">Universities</span>
            </div>
            <div className="stat">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Programs</span>
            </div>
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
