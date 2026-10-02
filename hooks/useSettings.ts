'use client'

import { useState, useEffect } from 'react'
import { db, Settings, DEFAULT_SETTINGS } from '@/lib/db'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    db.settings.get('global').then((s) => {
      if (s) setSettings(s)
      setLoaded(true)
    })
  }, [])

  const updateSettings = async (updates: Partial<Omit<Settings, 'id'>>) => {
    const next = { ...settings, ...updates }
    setSettings(next)
    await db.settings.put(next)
  }

  return { settings, updateSettings, loaded }
}

export type { Settings }
