import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthDialog({ onClose }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      if (mode === 'login') await login({ username, password })
      else await register({ username, email, password })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally { setWorking(false) }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="dialog-close" onClick={onClose} aria-label="Close sign-in form">×</button>
        <p className="eyebrow">THREAD & FORM ACCOUNT</p>
        <h2 id="auth-title">{mode === 'login' ? 'Welcome back.' : 'Join the good stuff.'}</h2>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError('') }}>Sign in</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError('') }}>Create account</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          <label>Username<input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} /></label>
          {mode === 'register' && <label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>}
          <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 10 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {mode === 'register' && <p className="password-hint">Use at least 10 characters and avoid common passwords.</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" disabled={working}>{working ? 'PLEASE WAIT…' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</button>
        </form>
      </section>
    </div>
  )
}
