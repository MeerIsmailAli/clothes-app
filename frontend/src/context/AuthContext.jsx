import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api'

async function readResponse(response) {
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = body.detail || Object.values(body).flat().join(' ')
    throw new Error(detail || 'The request could not be completed.')
  }
  return body
}

async function refreshAccess(refresh) {
  const response = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }),
  })
  return readResponse(response)
}

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('thread-form-auth') || 'null') } catch { return null }
  })
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const saveTokens = useCallback((next) => {
    setTokens(next)
    if (next) sessionStorage.setItem('thread-form-auth', JSON.stringify(next))
    else sessionStorage.removeItem('thread-form-auth')
  }, [])

  const currentUser = useCallback(async (access) => {
    const response = await fetch(`${API_URL}/auth/me/`, { headers: { Authorization: `Bearer ${access}` } })
    return readResponse(response)
  }, [])

  useEffect(() => {
    let active = true
    async function restoreSession() {
      if (!tokens?.refresh) { setAuthLoading(false); return }
      try {
        const refreshed = await refreshAccess(tokens.refresh)
        const next = { access: refreshed.access, refresh: refreshed.refresh || tokens.refresh }
        const profile = await currentUser(next.access)
        if (active) { saveTokens(next); setUser(profile) }
      } catch {
        if (active) { saveTokens(null); setUser(null) }
      } finally { if (active) setAuthLoading(false) }
    }
    restoreSession()
    return () => { active = false }
  }, []) // Restore once when the app opens.

  const login = useCallback(async (credentials) => {
    const response = await fetch(`${API_URL}/auth/token/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials),
    })
    const issued = await readResponse(response)
    const profile = await currentUser(issued.access)
    saveTokens({ access: issued.access, refresh: issued.refresh })
    setUser(profile)
    return profile
  }, [currentUser, saveTokens])

  const register = useCallback(async (details) => {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details),
    })
    const issued = await readResponse(response)
    saveTokens({ access: issued.access, refresh: issued.refresh })
    setUser(issued.user)
    return issued.user
  }, [saveTokens])

  const logout = useCallback(async () => {
    const refresh = tokens?.refresh
    saveTokens(null)
    setUser(null)
    if (refresh) {
      await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }),
      }).catch(() => {})
    }
  }, [saveTokens, tokens])

  const value = useMemo(() => ({ user, authLoading, login, register, logout }), [user, authLoading, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
