'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useSupabase'

const ADMIN_EMAILS = ['nicobusso_7@hotmail.com']

interface UserRow {
  id: string
  email: string
  confirmed: boolean
  createdAt: string
  lastSignIn: string | null
}

export default function AdminPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState('')

  useEffect(() => {
    if (!loading && (!user || !ADMIN_EMAILS.includes(user.email ?? ''))) {
      router.push('/')
    }
  }, [user, loading, router])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    if (data.users) setUsers(data.users)
    setLoadingUsers(false)
  }

  useEffect(() => {
    if (user && ADMIN_EMAILS.includes(user.email ?? '')) {
      fetchUsers()
    }
  }, [user])

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setMsg(null)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, password: newPassword }),
    })
    const data = await res.json()
    if (data.error) {
      setMsg({ text: data.error, ok: false })
    } else {
      setMsg({ text: `Usuario ${data.user.email} creado`, ok: true })
      setNewEmail('')
      setNewPassword('')
      fetchUsers()
    }
    setCreating(false)
  }

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`¿Eliminar a ${email}?`)) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (data.error) {
      setMsg({ text: data.error, ok: false })
    } else {
      setMsg({ text: `Usuario eliminado`, ok: true })
      fetchUsers()
    }
  }

  const doResetPassword = async () => {
    if (!resetUserId || !resetPassword) return
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: resetUserId, password: resetPassword }),
    })
    const data = await res.json()
    if (data.error) {
      setMsg({ text: data.error, ok: false })
    } else {
      setMsg({ text: 'Contraseña actualizada', ok: true })
      setResetUserId(null)
      setResetPassword('')
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, border: '2px solid #333', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) return null

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0A0A0A', color: '#F5F0EB', padding: '24px 16px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#9A9A9A', cursor: 'pointer', fontSize: 22 }}>←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Panel Admin</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#9A9A9A' }}>Gestión de usuarios</p>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, fontSize: 14,
            backgroundColor: msg.ok ? '#0a2a0a' : '#2a0a0a',
            border: `1px solid ${msg.ok ? '#2a5a2a' : '#5a2a2a'}`,
            color: msg.ok ? '#90ee90' : '#ffaaaa' }}>
            {msg.text}
          </div>
        )}

        {/* Create user */}
        <div style={{ backgroundColor: '#1a1a1a', borderRadius: 14, padding: '20px', marginBottom: 24, border: '1px solid #2a2a2a' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Agregar usuario</h2>
          <form onSubmit={createUser} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="email" placeholder="email@ejemplo.com" value={newEmail}
              onChange={e => setNewEmail(e.target.value)} required
              style={{ padding: '11px 14px', backgroundColor: '#111', border: '1px solid #333', borderRadius: 9, color: '#F5F0EB', fontSize: 15, outline: 'none' }}
            />
            <input
              type="text" placeholder="contraseña (mín. 6 caracteres)" value={newPassword}
              onChange={e => setNewPassword(e.target.value)} required minLength={6}
              style={{ padding: '11px 14px', backgroundColor: '#111', border: '1px solid #333', borderRadius: 9, color: '#F5F0EB', fontSize: 15, outline: 'none' }}
            />
            <button type="submit" disabled={creating}
              style={{ padding: '12px', backgroundColor: '#F5F0EB', color: '#0A0A0A', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}>
              {creating ? 'Creando...' : '+ Crear usuario'}
            </button>
          </form>
        </div>

        {/* User list */}
        <div style={{ backgroundColor: '#1a1a1a', borderRadius: 14, border: '1px solid #2a2a2a', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a2a' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
              Usuarios ({users.length})
            </h2>
          </div>

          {loadingUsers ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9A9A9A' }}>Cargando...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9A9A9A' }}>No hay usuarios</div>
          ) : (
            users.map((u) => (
              <div key={u.id} style={{ padding: '14px 20px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                    {ADMIN_EMAILS.includes(u.email) && (
                      <span style={{ fontSize: 10, padding: '2px 6px', backgroundColor: '#2a2a6a', color: '#aaaaff', borderRadius: 4, flexShrink: 0 }}>ADMIN</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                    Creado {new Date(u.createdAt).toLocaleDateString('es')}
                    {u.lastSignIn && ` · Último acceso ${new Date(u.lastSignIn).toLocaleDateString('es')}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => { setResetUserId(u.id); setResetPassword('') }}
                    style={{ padding: '6px 10px', backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 7, color: '#ccc', fontSize: 12, cursor: 'pointer' }}>
                    🔑
                  </button>
                  {!ADMIN_EMAILS.includes(u.email) && (
                    <button
                      onClick={() => deleteUser(u.id, u.email ?? '')}
                      style={{ padding: '6px 10px', backgroundColor: '#2a1010', border: '1px solid #5a2020', borderRadius: 7, color: '#ffaaaa', fontSize: 12, cursor: 'pointer' }}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reset password modal */}
        {resetUserId && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 }}>
            <div style={{ backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360, border: '1px solid #2a2a2a' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Nueva contraseña</h3>
              <input
                type="text" placeholder="Nueva contraseña" value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', backgroundColor: '#111', border: '1px solid #333', borderRadius: 9, color: '#F5F0EB', fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setResetUserId(null)}
                  style={{ flex: 1, padding: '11px', backgroundColor: '#2a2a2a', border: 'none', borderRadius: 9, color: '#ccc', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={doResetPassword} disabled={!resetPassword}
                  style={{ flex: 1, padding: '11px', backgroundColor: '#F5F0EB', border: 'none', borderRadius: 9, color: '#0A0A0A', fontWeight: 700, cursor: 'pointer' }}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
