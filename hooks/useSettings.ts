'use client'

import { useState, useEffect } from 'react'
import { Settings, DEFAULT_SETTINGS } from '@/lib/db'

const STORAGE_KEY = 'md-reader-settings'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
      }
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  const updateSettings = (updates: Partial<Omit<Settings, 'id'>>) => {
    const next = { ...settings, ...updates }
    setSettings(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  return { settings, updateSettings, loaded }
}

export type { Settings }
