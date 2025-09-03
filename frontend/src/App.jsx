import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Ask about UGC recognized online universities' }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, typing])

  async function handleSend(e) {
    e.preventDefault()
    const question = input.trim()
    if (!question) return
    const userMsg = { id: Date.now(), role: 'user', text: question }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setTyping(true)
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      const botText = data?.answer || 'Sorry, something went wrong.'
      setMessages((m) => [...m, { id: Date.now() + 1, role: 'assistant', text: botText }])
    } catch (err) {
      setMessages((m) => [...m, { id: Date.now() + 2, role: 'assistant', text: 'Error contacting server.' }])
    } finally {
      setTyping(false)
    }
  }

  const universities = [
    { name: 'Amity Online', fullName: 'Amity University Online', est: 2005, nirf: 32, type: 'private', location: 'Noida, Uttar Pradesh' },
    { name: 'Manipal Online', fullName: 'Manipal University Online', est: 2021, nirf: 64, type: 'private', location: 'Jaipur, Rajasthan' },
    { name: 'Jain Online', fullName: 'Jain University Online', est: 1990, nirf: 65, type: 'deemed', location: 'Bengaluru, Karnataka' }
  ]

  const quickQueries = [
    'What are the ignou admission process?',
    'What are the online engineering degrees?',
    'Show me the top universities in Delhi',
    'Best online MBA programs',
    'IGNOU admission process',
    'Online engineering degrees',
    'Compare fees'
  ]

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="left-panel">
          <div className="header">
            <div className="logo">
              <span className="logo-icon">🎓</span>
              <span className="logo-text">eCampus AI</span>
            </div>
            <button className="filters-btn">
              <span>📊</span> Filters
            </button>
          </div>

          <div className="search-section">
            <h1>Let AI help you to study?</h1>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search universities, courses, programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="quick-buttons">
              {quickQueries.slice(0, 4).map((query, idx) => (
                <button key={idx} className="quick-btn" onClick={() => setSearchQuery(query)}>
                  {query}
                </button>
              ))}
            </div>
          </div>

          <div className="stats">
            <p>Found 100+ universities and 1000+ programs</p>
          </div>

          <div className="university-grid">
            {universities.map((uni, idx) => (
              <div key={idx} className="university-card">
                <div className="uni-header">
                  <span className={`uni-type ${uni.type}`}>{uni.type}</span>
                  <span className="uni-location">{uni.location.split(',')[1]}</span>
                </div>
                <div className="uni-logo">
                  <span>{uni.name.charAt(0)}</span>
                </div>
                <h3>{uni.name}</h3>
                <p>{uni.fullName}</p>
                <div className="uni-stats">
                  <span>📅 Est. {uni.est}</span>
                  <span>🏆 NIRF Rank: {uni.nirf}</span>
                </div>
                <div className="uni-badges">
                  <span className="badge">UGC Recognized</span>
                  <span className="badge">UGC-DEB</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <div className="chat-header">
            <div className="ai-assistant">
              <span className="ai-icon">🤖</span>
              <div>
                <h3>AI Assistant</h3>
                <p>Ask about UGC recognized online universities</p>
              </div>
            </div>
            <button className="hide-chat" onClick={() => setShowChat(!showChat)}>
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </button>
          </div>

          <div className="chat-messages" ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className={`message ${m.role}`}>
                <div className="message-content">
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="message assistant">
                <div className="message-content typing">
                  <span>Typing...</span>
                </div>
              </div>
            )}
            
            <div className="suggested-questions">
              {quickQueries.slice(4).map((query, idx) => (
                <button key={idx} className="suggested-btn" onClick={() => {
                  setInput(query)
                  handleSend({ preventDefault: () => {} })
                }}>
                  {query}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSend} className="chat-input-form">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about online programs, fees, duration, eligibility"
              className="chat-input"
            />
            <button type="submit" className="send-btn">Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
