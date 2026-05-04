import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { error: null } }
  static getDerivedStateFromError(error){ return { error } }
  componentDidCatch(error, info){ console.error('Lỗi render:', error, info) }
  render(){
    if(this.state.error) return (
      <div style={{minHeight:'100vh',background:'#05070b',color:'#e5e7eb',fontFamily:'system-ui',display:'grid',placeItems:'center',padding:24}}>
        <div style={{maxWidth:600,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:20,padding:28}}>
          <h1 style={{fontSize:22,marginBottom:12}}>Hệ thống gặp lỗi</h1>
          <p style={{color:'#94a3b8',marginBottom:16}}>Kiểm tra Vercel Environment Variables (VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY)</p>
          <pre style={{whiteSpace:'pre-wrap',background:'rgba(0,0,0,.3)',borderRadius:10,padding:12,color:'#fca5a5',fontSize:13}}>{String(this.state.error?.message||this.state.error)}</pre>
        </div>
      </div>
    )
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>)
