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
import { GET, POST } from '@/app/api/teachers/route'
import { GET as GET_BY_ID, PATCH } from '@/app/api/teachers/[id]/route'

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
  return new NextRequest(`http://localhost:3000/api/teachers${search ? `?${search}` : ''}`, {
    method: 'GET',
  })
}

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/teachers', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function createPatchRequest(id: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`http://localhost:3000/api/teachers/${id}`, {
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

describe('GET /api/teachers', () => {
  it('requires authentication', async () => {
    mockedRequirePermission.mockResolvedValue(null)
    const response = await GET(createGetRequest())
    expect(response.status).toBe(401)
  })

  it('returns teachers for authorized user', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({
        data: [{ teacher_id: '1', first_name: 'John', last_name: 'Doe' }],
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

  it('filters by search query', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({
        data: [{ teacher_id: '1', first_name: 'John', last_name: 'Doe' }],
        count: 1,
        error: null,
      }) as any
    )
    const response = await GET(createGetRequest('search=John'))
    expect(response.status).toBe(200)
  })
})

describe('POST /api/teachers', () => {
  it('rejects unauthenticated request', async () => {
    mockedRequirePermission.mockResolvedValue(null)
    const response = await POST(createPostRequest({ first_name: 'Jane', last_name: 'Doe', staff_id: 'T001', employment_status: 'active' }))
    expect(response.status).toBe(401)
  })

  it('rejects missing required fields', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: null, error: null }) as any
    )
    const response = await POST(createPostRequest({ first_name: '', last_name: 'Doe' }))
    expect(response.status).toBe(400)
  })

  it('rejects duplicate staff id', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: { teacher_id: 'existing' }, error: null }) as any
    )
    const response = await POST(createPostRequest({ first_name: 'Jane', last_name: 'Doe', staff_id: 'T001', employment_status: 'active' }))
    expect(response.status).toBe(400)
  })
})

describe('GET /api/teachers/[id]', () => {
  beforeEach(() => {
    mockedRequirePermission.mockResolvedValue(roleContext)
  })

  it('returns teacher by id', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: { teacher_id: '1', first_name: 'John', last_name: 'Doe' }, error: null }) as any
    )
    const response = await GET_BY_ID(createGetRequest(), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.teacher_id).toBe('1')
  })

  it('returns 404 when teacher not found', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: null, error: null }) as any
    )
    const response = await GET_BY_ID(createGetRequest(), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(404)
  })
})

describe('PATCH /api/teachers/[id]', () => {
  beforeEach(() => {
    mockedRequirePermission.mockResolvedValue(roleContext)
  })

  it('updates teacher', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: { school_id: 'school-1', staff_id: 'T001', first_name: 'Updated' }, error: null }) as any
    )
    const response = await PATCH(createPatchRequest('1', { first_name: 'Updated' }), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.first_name).toBe('Updated')
  })

  it('rejects cross-school update when teacher belongs to another school', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: null, error: null }) as any
    )
    const response = await PATCH(createPatchRequest('1', { first_name: 'Updated' }), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(404)
  })
})
