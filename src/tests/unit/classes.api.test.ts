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
import { GET, POST } from '@/app/api/classes/route'
import { GET as GET_BY_ID, PATCH } from '@/app/api/classes/[id]/route'

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

function createGetRequest(search = ''): NextRequest {
  return new NextRequest(`http://localhost:3000/api/classes${search ? `?${search}` : ''}`, {
    method: 'GET',
  })
}

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/classes', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function createPatchRequest(id: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`http://localhost:3000/api/classes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

function createSupabaseClient(result: { data: unknown; error: { message: string } | null; count?: number | null }) {
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    or: () => chain,
    order: () => chain,
    range: () => Promise.resolve({ data: result.data ?? [], error: result.error, count: result.count ?? 0 }),
    maybeSingle: () => Promise.resolve(result),
    neq: () => chain,
    update: () => chain,
    delete: () => chain,
    insert: () => chain,
    single: () => Promise.resolve(result),
  }
  return {
    from: () => chain,
  } as unknown as ReturnType<typeof getSupabaseServerClient>
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedRequirePermission.mockResolvedValue(roleContext)
})

describe('GET /api/classes', () => {
  it('requires authentication', async () => {
    mockedRequirePermission.mockResolvedValue(null)
    const response = await GET(createGetRequest())
    expect(response.status).toBe(401)
  })

  it('returns classes for authorized user', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({
        data: [{ class_id: '1', name: 'Form 3', status: 'active' }],
        count: 1,
        error: null,
      }) as any
    )
    const response = await GET(createGetRequest())
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toHaveLength(1)
    expect(body.total).toBe(1)
  })
})

describe('POST /api/classes', () => {
  it('rejects unauthenticated request', async () => {
    mockedRequirePermission.mockResolvedValue(null)
    const response = await POST(createPostRequest({ name: 'Form 3', status: 'active' }))
    expect(response.status).toBe(401)
  })

  it('rejects missing required fields', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: null, error: null }) as any
    )
    const response = await POST(createPostRequest({ name: '' }))
    expect(response.status).toBe(400)
  })

  it('rejects duplicate class name for same academic year', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: { class_id: 'existing' }, error: null }) as any
    )
    const response = await POST(createPostRequest({ name: 'Form 3', status: 'active', academic_year_id: 'year-1' }))
    expect(response.status).toBe(400)
  })

  it('rejects invalid academic_year_id', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: null, error: null }) as any
    )
    const response = await POST(createPostRequest({ name: 'Form 3', status: 'active', academic_year_id: 'invalid' }))
    expect(response.status).toBe(400)
  })
})

describe('GET /api/classes/[id]', () => {
  beforeEach(() => {
    mockedRequirePermission.mockResolvedValue(roleContext)
  })

  it('returns class by id', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: { class_id: '1', name: 'Form 3', status: 'active' }, error: null }) as any
    )
    const response = await GET_BY_ID(createGetRequest(), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.class_id).toBe('1')
  })

  it('returns 404 when class not found', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: null, error: null }) as any
    )
    const response = await GET_BY_ID(createGetRequest(), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(404)
  })
})

describe('PATCH /api/classes/[id]', () => {
  beforeEach(() => {
    mockedRequirePermission.mockResolvedValue(roleContext)
  })

  it('updates class', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: { class_id: '1', name: 'Form 3 Updated', status: 'active' }, error: null }) as any
    )
    const response = await PATCH(createPatchRequest('1', { name: 'Form 3 Updated' }), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.name).toBe('Form 3 Updated')
  })

  it('rejects cross-school update when class belongs to another school', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: null, error: null }) as any
    )
    const response = await PATCH(createPatchRequest('1', { name: 'Updated' }), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(404)
  })
})
