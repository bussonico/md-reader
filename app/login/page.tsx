'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo/title */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📖</div>
          <h1 style={{ color: '#F5F0EB', fontSize: 24, fontWeight: 700, margin: 0 }}>MD Reader</h1>
          <p style={{ color: '#9A9A9A', fontSize: 14, marginTop: 8 }}>Tu biblioteca personal</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#1a1a1a', borderRadius: 16, border: '1px solid #2a2a2a' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
            <h2 style={{ color: '#F5F0EB', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Revisá tu email</h2>
            <p style={{ color: '#9A9A9A', fontSize: 14, margin: 0 }}>Te enviamos un enlace mágico a <strong style={{ color: '#F5F0EB' }}>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ color: '#9A9A9A', fontSize: 13, display: 'block', marginBottom: 8 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{ width: '100%', padding: '14px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, color: '#F5F0EB', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '14px', backgroundColor: '#F5F0EB', color: '#0A0A0A', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Enviando...' : 'Enviar enlace mágico →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
