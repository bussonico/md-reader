'use client'

import BottomSheet from '@/components/shared/BottomSheet'
import { Settings } from '@/lib/db'

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
  settings: Settings
  onChange: (updates: Partial<Omit<Settings, 'id'>>) => void
}

const THEMES: Settings['theme'][] = ['Claro', 'Sepia', 'Oscuro', 'Negro']
const FONTS = ['Merriweather', 'Georgia', 'system-ui', 'monospace']
const FONT_LABELS: Record<string, string> = {
  Merriweather: 'Merriweather',
  Georgia: 'Georgia',
  'system-ui': 'Sistema',
  monospace: 'Mono',
}

export default function SettingsSheet({ open, onClose, settings, onChange }: SettingsSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Ajustes de lectura">
      <div className="space-y-6 pb-4">
        {/* Theme */}
        <div>
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">
            Tema
          </label>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => onChange({ theme: t })}
                className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                  settings.theme === t
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Tamaño de letra
            </label>
            <span className="text-xs text-neutral-600">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min={14}
            max={28}
            step={1}
            value={settings.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="w-full accent-neutral-900"
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>14</span>
            <span>28</span>
          </div>
        </div>

        {/* Line height */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Interlineado
            </label>
            <span className="text-xs text-neutral-600">{settings.lineHeight}</span>
          </div>
          <input
            type="range"
            min={1.2}
            max={2.0}
            step={0.1}
            value={settings.lineHeight}
            onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
            className="w-full accent-neutral-900"
          />
        </div>

        {/* Font family */}
        <div>
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">
            Tipografía
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FONTS.map((f) => (
              <button
                key={f}
                onClick={() => onChange({ fontFamily: f })}
                className={`py-2.5 rounded-xl text-xs border-2 transition-all ${
                  settings.fontFamily === f
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                }`}
                style={{ fontFamily: f }}
              >
                {FONT_LABELS[f] ?? f}
              </button>
            ))}
          </div>
        </div>

        {/* Margins */}
        <div>
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">
            Márgenes
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['S', 'M', 'L'] as const).map((m) => (
              <button
                key={m}
                onClick={() => onChange({ margins: m })}
                className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                  settings.margins === m
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                {m === 'S' ? 'Pequeño' : m === 'M' ? 'Medio' : 'Grande'}
              </button>
            ))}
          </div>
        </div>

        {/* Alignment */}
        <div>
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">
            Alineación
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['left', 'justify'] as const).map((a) => (
              <button
                key={a}
                onClick={() => onChange({ alignment: a })}
                className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                  settings.alignment === a
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                {a === 'left' ? 'Izquierda' : 'Justificado'}
              </button>
            ))}
          </div>
        </div>

        {/* Reading mode */}
        <div>
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">
            Modo de lectura
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['paginado', 'scroll'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onChange({ readingMode: mode })}
                className={`py-2.5 rounded-xl text-xs font-medium border-2 transition-all capitalize ${
                  settings.readingMode === mode
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                {mode === 'paginado' ? 'Paginado' : 'Scroll'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
