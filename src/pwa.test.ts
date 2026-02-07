import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read vite config source to verify PWA manifest configuration
const configSource = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8')

describe('PWA Manifest (F10)', () => {
  // F10-AC1: valid manifest with name, icons, theme color, display: standalone
  it('has app name in manifest', () => {
    expect(configSource).toContain("name: 'SureSnap'")
  })

  it('has short_name in manifest', () => {
    expect(configSource).toContain("short_name: 'SureSnap'")
  })

  it('has display: standalone', () => {
    expect(configSource).toContain("display: 'standalone'")
  })

  it('has theme_color', () => {
    expect(configSource).toMatch(/theme_color:\s*'#/)
  })

  it('has 192px and 512px icons', () => {
    expect(configSource).toContain('icon-192.png')
    expect(configSource).toContain('icon-512.png')
  })

  it('has a maskable icon', () => {
    expect(configSource).toContain("purpose: 'maskable'")
  })

  // F10-AC2: service worker caches static assets
  it('configures workbox for static asset caching', () => {
    expect(configSource).toContain('workbox')
    expect(configSource).toContain('globPatterns')
  })

  it('excludes API routes from service worker caching', () => {
    expect(configSource).toContain('navigateFallbackDenylist')
    expect(configSource).toContain('/^\\/api\\//')
  })

  it('uses autoUpdate registration', () => {
    expect(configSource).toContain("registerType: 'autoUpdate'")
  })
})
