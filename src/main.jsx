import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

function BootError({ error }) {
  return (
    <div style={{minHeight:'100vh',background:'#05070b',color:'#e5e7eb',fontFamily:'Inter,system-ui,sans-serif',display:'grid',placeItems:'center',padding:24}}>
      <div style={{maxWidth:760,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:28,boxShadow:'0 24px 80px rgba(0,0,0,.35)'}}>
        <div style={{fontSize:13,letterSpacing:2,textTransform:'uppercase',color:'#7af0bf',fontWeight:800,marginBottom:12}}>Hán Tinh Premium · boot guard</div>
        <h1 style={{fontSize:28,lineHeight:1.15,margin:'0 0 12px'}}>Website đã tải, nhưng app gặp lỗi runtime.</h1>
        <p style={{color:'#94a3b8',lineHeight:1.6,margin:'0 0 16px'}}>Mở DevTools → Console hoặc Vercel → Deployments → Logs để xem lỗi chi tiết. Lỗi thường gặp nhất là thiếu Environment Variables Supabase.</p>
        <pre style={{whiteSpace:'pre-wrap',background:'rgba(0,0,0,.35)',border:'1px solid rgba(255,255,255,.10)',borderRadius:14,padding:14,color:'#fecaca',fontSize:13,overflow:'auto'}}>{String(error?.stack || error?.message || error)}</pre>
      </div>
    </div>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { error: null } }
  static getDerivedStateFromError(error){ return { error } }
  componentDidCatch(error, info){ console.error('React render error:', error, info) }
  render(){ return this.state.error ? <BootError error={this.state.error} /> : this.props.children }
}

const root = document.getElementById('root')
if (!root) {
  document.body.innerHTML = '<div style="font-family:system-ui;padding:32px">Missing #root element</div>'
} else {
  ReactDOM.createRoot(root).render(<ErrorBoundary><App /></ErrorBoundary>)
}
