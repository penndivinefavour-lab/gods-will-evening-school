import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Phase 0 foundation guards', () => {
  it('imports the browser Supabase module without importing server-only modules', async () => {
    const moduleSource = await import('@/lib/supabase-browser')

    expect(typeof moduleSource.getSupabaseBrowserClient).toBe('function')
  })

  it('imports the server Supabase module and exports the async server client', async () => {
    const moduleSource = await import('@/lib/supabase-server')

    expect(typeof moduleSource.getSupabaseServerClient).toBe('function')
  })

  it('imports the authentication helper module', async () => {
    const moduleSource = await import('@/lib/auth')

    expect(typeof moduleSource.getUserRoleContext).toBe('function')
    expect(typeof moduleSource.hasPermission).toBe('function')
  })

  it('does not leave the old mixed Supabase module in the source tree', () => {
    const mixedModulePath = path.resolve(__dirname, '../../lib/supabase.ts')
    expect(fs.existsSync(mixedModulePath)).toBe(false)
  })
})
