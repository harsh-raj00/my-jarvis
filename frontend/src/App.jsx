import React, { useState } from 'react'
import LandingPage from './components/LandingPage'
import JarvisDashboard from './components/Dashboard/JarvisDashboard'

function App() {
  const [showDashboard, setShowDashboard] = useState(false)

  if (!showDashboard) {
    return <LandingPage onEnter={() => setShowDashboard(true)} />
  }

  return <JarvisDashboard />
}

export default App
