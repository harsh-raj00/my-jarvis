import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('🚨 GLOBAL ERROR:', event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 UNHANDLED REJECTION:', event.reason)
})

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    console.error('⚠️ Error:', error.message)
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#000',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui'
        }}>
          <div style={{
            textAlign: 'center',
            border: '1px solid #ff0000',
            borderRadius: '8px',
            padding: '32px',
            maxWidth: '500px'
          }}>
            <h1 style={{ color: '#ff4444', marginBottom: '16px' }}>⚠️ System Error</h1>
            <p style={{ marginBottom: '16px' }}>J.A.R.V.I.S. encountered an issue.</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Reboot
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

try {
  console.log('📡 Starting React app...')
  const root = ReactDOM.createRoot(document.getElementById('root'))
  
  if (!root) {
    throw new Error('Root element not found!')
  }

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )
  console.log('✅ React app mounted')
} catch (error) {
  console.error('❌ Initialization error:', error.message)
  document.body.innerHTML = `<div style="color:red;padding:20px;font-family:monospace;">FATAL ERROR: ${error.message}</div>`
}
