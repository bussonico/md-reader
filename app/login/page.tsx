'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email o contraseña incorrectos.')
      } else {
        router.push('/')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: undefined },
      })
      if (error) {
        if (error.message.includes('already')) {
          setError('Ya existe una cuenta con ese email. Iniciá sesión.')
        } else if (error.message.includes('password')) {
          setError('La contraseña debe tener al menos 6 caracteres.')
        } else {
          setError(error.message)
        }
      } else {
        // Auto sign in after register
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
        if (!loginErr) {
          router.push('/')
          router.refresh()
        } else {
          setError('Cuenta creada. Iniciá sesión.')
          setMode('login')
        }
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>📖</div>
        <h1 style={{ color: '#F5F0EB', fontSize: 24, fontWeight: 700, margin: 0 }}>MD Reader</h1>
        <p style={{ color: '#9A9A9A', fontSize: 14, marginTop: 8 }}>Tu biblioteca personal</p>
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid #2a2a2a' }}>
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError('') }}
            style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
              backgroundColor: mode === m ? '#F5F0EB' : 'transparent',
              color: mode === m ? '#0A0A0A' : '#9A9A9A',
            }}
          >
            {m === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: '#2a1010', border: '1px solid #5a2020', borderRadius: 10, color: '#ffaaaa', fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ color: '#9A9A9A', fontSize: 13, display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoComplete="email"
            style={{
              width: '100%', padding: '13px 16px', backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a', borderRadius: 11, color: '#F5F0EB',
              fontSize: 16, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div>
          <label style={{ color: '#9A9A9A', fontSize: 13, display: 'block', marginBottom: 6 }}>
            Contraseña {mode === 'register' && <span style={{ color: '#666' }}>(mínimo 6 caracteres)</span>}
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            style={{
              width: '100%', padding: '13px 16px', backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a', borderRadius: 11, color: '#F5F0EB',
              fontSize: 16, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 4, padding: '14px', backgroundColor: '#F5F0EB', color: '#0A0A0A',
            borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '...' : mode === 'login' ? 'Entrar →' : 'Crear cuenta →'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100dvh', backgroundColor: '#0A0A0A',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <Suspense fallback={null}>
        <AuthForm />
      </Suspense>
    </div>
  )
}
