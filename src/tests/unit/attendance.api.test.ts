import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock('@/lib/api/auth', () => ({
  requirePermission: vi.fn(),
}))

vi.mock('@/lib/supabase-server', () => ({
  getSupabaseServerClient: vi.fn(),
}))

vi.mock('@/lib/api/error', () => ({
  badRequest: vi.fn((message: string) => new Response(message, { status: 400 })),
  unauthorized: vi.fn(() => new Response('Unauthorized', { status: 401 })),
  forbidden: vi.fn(() => new Response('Forbidden', { status: 403 })),
  notFound: vi.fn((message: string) => new Response(message, { status: 404 })),
  serverError: vi.fn((message: string) => new Response(message, { status: 500 })),
}))

import { requirePermission } from '@/lib/api/auth'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { GET, POST } from '@/app/api/attendance/route'
import { GET as GET_ITEM, PATCH as PATCH_ITEM } from '@/app/api/attendance/[id]/route'

const mockedRequirePermission = vi.mocked(requirePermission)
const mockedGetSupabaseServerClient = vi.mocked(getSupabaseServerClient)

type RoleContext = {
  userId: string
  role: 'platform_technical_administrator' | 'school_administrator' | 'teacher' | 'student' | 'parent'
  schoolId: string | null
}

const roleContext: RoleContext = {
  userId: 'user-1',
  role: 'school_administrator',
  schoolId: 'school-1',
}

function createSupabaseClient(result: { data: unknown; error: { message: string } | null; count?: number | null }) {
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    order: () => Promise.resolve(result),
    maybeSingle: () => Promise.resolve(result),
    single: () => Promise.resolve(result),
    update: () => chain,
    insert: () => chain,
    from: () => chain,
  }
  return {
    from: () => chain,
  } as unknown as ReturnType<typeof getSupabaseServerClient>
}

function createGetRequest(search = ''): NextRequest {
  return new NextRequest(`http://localhost:3000/api/attendance${search ? `?${search}` : ''}`, {
    method: 'GET',
  })
}

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/attendance', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function createPatchRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/attendance/1', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedRequirePermission.mockResolvedValue(roleContext)
})

describe('GET /api/attendance', () => {
  it('requires authentication', async () => {
    mockedRequirePermission.mockResolvedValue(null)
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: [], error: null }) as any)
    const response = await GET(createGetRequest())
    expect(response.status).toBe(401)
  })

  it('returns attendance records for authorized user', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: [], error: null }) as any)
    const response = await GET(createGetRequest())
    expect(response.status).toBe(200)
  })
})

describe('POST /api/attendance', () => {
  it('rejects unauthenticated request', async () => {
    mockedRequirePermission.mockResolvedValue(null)
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: null, error: null }) as any)
    const response = await POST(createPostRequest({ student_id: 'student-1', class_id: 'class-1', attendance_date: '2026-08-22', status: 'present' }))
    expect(response.status).toBe(401)
  })

  it('rejects missing required fields', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: null, error: null }) as any)
    const response = await POST(createPostRequest({ status: 'present' }))
    expect(response.status).toBe(400)
  })

  it('rejects invalid status', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: null, error: null }) as any)
    const response = await POST(createPostRequest({ student_id: 'student-1', class_id: 'class-1', attendance_date: '2026-08-22', status: 'unknown' }))
    expect(response.status).toBe(400)
  })

  it('prevents duplicate attendance for same student, class and date', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: { attendance_record_id: 'existing' }, error: null }) as any)
    const response = await POST(createPostRequest({ student_id: 'student-1', class_id: 'class-1', attendance_date: '2026-08-22', status: 'present' }))
    expect(response.status).toBe(400)
  })
})

describe('GET /api/attendance/[id]', () => {
  it('returns 404 when record is missing', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: null, error: null }) as any)
    const response = await GET_ITEM(createGetRequest(), { params: Promise.resolve({ id: 'missing-id' }) })
    expect(response.status).toBe(404)
  })
})

describe('PATCH /api/attendance/[id]', () => {
  it('rejects invalid status on update', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: { attendance_record_id: '1' }, error: null }) as any)
    const response = await PATCH_ITEM(createPatchRequest({ status: 'maybe' }), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(400)
  })
})
