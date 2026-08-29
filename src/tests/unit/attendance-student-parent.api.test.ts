import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock('@/lib/api/auth', () => ({
  requirePermission: vi.fn(),
}))

vi.mock('@/lib/supabase-server', () => ({
  getSupabaseServerClient: vi.fn(),
}))

import { requirePermission } from '@/lib/api/auth'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { GET as GET_STUDENT } from '@/app/api/attendance/student/me/route'
import { GET as GET_PARENT } from '@/app/api/attendance/parent/child/route'

const mockedRequirePermission = vi.mocked(requirePermission)
const mockedGetSupabaseServerClient = vi.mocked(getSupabaseServerClient)

const studentContext = {
  userId: 'student-1',
  role: 'student' as const,
  schoolId: 'school-1',
}

const parentContext = {
  userId: 'parent-1',
  role: 'parent' as const,
  schoolId: 'school-1',
}

function createSupabaseClient(result: { data: unknown; error: { message: string } | null }) {
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    gte: () => chain,
    lte: () => chain,
    in: () => chain,
    order: () => Promise.resolve(result),
    maybeSingle: () => Promise.resolve(result),
    single: () => Promise.resolve(result),
    update: () => chain,
    insert: () => chain,
    delete: () => chain,
    from: () => chain,
  }
  return {
    from: () => chain,
  } as unknown as ReturnType<typeof getSupabaseServerClient>
}

function createGetRequest(search = ''): NextRequest {
  return new NextRequest(`http://localhost:3000/api/attendance/student/me${search ? `?${search}` : ''}`, {
    method: 'GET',
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/attendance/student/me', () => {
  it('rejects non-student access', async () => {
    mockedRequirePermission.mockResolvedValue({ ...studentContext, role: 'teacher' } as any)
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: [], error: null }) as any)
    const response = await GET_STUDENT(createGetRequest())
    expect(response.status).toBe(401)
  })
})

describe('GET /api/attendance/parent/child', () => {
  it('rejects non-parent access', async () => {
    mockedRequirePermission.mockResolvedValue({ ...parentContext, role: 'teacher' } as any)
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: [], error: null }) as any)
    const request = new NextRequest('http://localhost:3000/api/attendance/parent/child', { method: 'GET' })
    const response = await GET_PARENT(request)
    expect(response.status).toBe(401)
  })
})
