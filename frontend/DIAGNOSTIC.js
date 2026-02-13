// Diagnostic Script for J.A.R.V.I.S. Frontend
// Open browser console (F12) and paste this entire script

console.log('🔍 J.A.R.V.I.S. Frontend Diagnostic Started\n')

// Check 1: DOM Elements
console.group('✅ DOM Check')
const root = document.getElementById('root')
const loading = document.getElementById('loading-screen')
console.log('Root element exists:', !!root)
console.log('Root innerHTML length:', root?.innerHTML?.length || 0)
console.log('Loading screen exists:', !!loading)
console.log('Loading screen visible:', loading?.style?.display !== 'none')
console.groupEnd()

// Check 2: React
console.group('✅ React Check')
console.log('React loaded:', typeof React !== 'undefined')
console.log('ReactDOM loaded:', typeof ReactDOM !== 'undefined')
console.groupEnd()

// Check 3: Backend Connection
console.group('✅ Backend Check')
fetch('http://localhost:8000/api/v1/health', { mode: 'cors' })
  .then(r => r.json())
  .then(d => {
    console.log('✅ Backend Status:', d.status)
    return fetch('http://localhost:8000/api/v1/system/health', { mode: 'cors' })
  })
  .then(r => r.json())
  .then(d => {
    console.log('✅ System Metrics:',`CPU ${d.cpu_usage.toFixed(1)}% | Memory ${d.memory_usage.toFixed(1)}% | Disk ${d.disk_usage.toFixed(1)}%`)
  })
  .catch(e => console.error('❌ Backend Error:', e.message))
console.groupEnd()

// Check 4: Network and fetch availability
console.group('✅ Network Check')
console.log('Fetch available:', typeof fetch !== 'undefined')
console.log('Navigator online:', navigator.onLine)
console.log('Current URL:', window.location.href)
console.groupEnd()

// Check 5: Console errors
console.group('✅ Error Log')
window.addEventListener('error', (e) => {
  console.error('⚠️ JS Error:', e.message)
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('⚠️ Unhandled Promise:', e.reason)
})
console.log('Error listeners attached')
console.groupEnd()

// Check 6: App Component Check
console.group('✅ Component Check')
setTimeout(() => {
  if (root.innerHTML.includes('J.A.R.V.I.S') || root.innerHTML.includes('StandaloneDashboard') || root.innerHTML.length > 100) {
    console.log('✅ React app rendered successfully!')
    console.log('Root has content, app is displaying')
  } else {
    console.warn('⚠️ React app not rendering yet')
    console.log('Root innerHTML:', root.innerHTML.substring(0, 200))
  }
}, 2000)

console.log('\n✅ Diagnostic Complete - Check results above')
console.log('💡 If you see errors, paste them below')
