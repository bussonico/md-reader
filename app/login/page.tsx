'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('error') === 'link_expired') {
      setErrorMsg('El enlace expiró o ya fue usado. Pedí uno nuevo.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setErrorMsg(error.message.includes('rate')
        ? 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.'
        : `Error: ${error.message}`)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>📖</div>
        <h1 style={{ color: '#F5F0EB', fontSize: 24, fontWeight: 700, margin: 0 }}>MD Reader</h1>
        <p style={{ color: '#9A9A9A', fontSize: 14, marginTop: 8 }}>Tu biblioteca personal</p>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: '#2a1010', border: '1px solid #5a2020', borderRadius: 10, color: '#ffaaaa', fontSize: 14, textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}

      {sent ? (
        <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#1a1a1a', borderRadius: 16, border: '1px solid #2a2a2a' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
          <h2 style={{ color: '#F5F0EB', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Revisá tu email</h2>
          <p style={{ color: '#9A9A9A', fontSize: 14, margin: '0 0 20px' }}>
            Te enviamos un enlace a <strong style={{ color: '#F5F0EB' }}>{email}</strong>
          </p>
          <p style={{ color: '#666', fontSize: 12, margin: 0 }}>
            Si no llega en 2 min, revisá spam.
          </p>
          <button
            onClick={() => setSent(false)}
            style={{ marginTop: 20, background: 'none', border: 'none', color: '#9A9A9A', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Usar otro email
          </button>
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
              style={{
                width: '100%', padding: '14px 16px',
                backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: 12, color: '#F5F0EB', fontSize: 16,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px', backgroundColor: '#F5F0EB', color: '#0A0A0A',
              borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Enviando...' : 'Enviar enlace mágico →'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100dvh', backgroundColor: '#0A0A0A',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <Suspense fallback={<div style={{ color: '#9A9A9A' }}>Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
