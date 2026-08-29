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
import { GET, POST } from '@/app/api/teacher-assignments/route'
import { GET as GET_BY_ID, PATCH } from '@/app/api/teacher-assignments/[id]/route'

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
  return new NextRequest(`http://localhost:3000/api/teacher-assignments${search ? `?${search}` : ''}`, {
    method: 'GET',
  })
}

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/teacher-assignments', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function createPatchRequest(id: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`http://localhost:3000/api/teacher-assignments/${id}`, {
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

describe('GET /api/teacher-assignments', () => {
  it('requires authentication', async () => {
    mockedRequirePermission.mockResolvedValue(null)
    const response = await GET(createGetRequest())
    expect(response.status).toBe(401)
  })

  it('returns teacher assignments for authorized user', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({
        data: [{ teacher_assignment_id: '1', teacher_id: 't1', class_id: 'c1', subject_id: 's1' }],
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

describe('POST /api/teacher-assignments', () => {
  it('rejects unauthenticated request', async () => {
    mockedRequirePermission.mockResolvedValue(null)
    const response = await POST(createPostRequest({ teacher_id: 't1', class_id: 'c1', subject_id: 's1' }))
    expect(response.status).toBe(401)
  })

  it('rejects missing required fields', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: null, error: null }) as any
    )
    const response = await POST(createPostRequest({ teacher_id: '' }))
    expect(response.status).toBe(400)
  })

  it('rejects teacher not found in school', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: null, error: null }) as any
    )
    const response = await POST(createPostRequest({ teacher_id: 't1', class_id: 'c1', subject_id: 's1' }))
    expect(response.status).toBe(400)
  })

  it('rejects duplicate assignment', async () => {
    const dupResult = { data: { teacher_assignment_id: 'dup' }, error: null }
    const dupChain = createSupabaseClient(dupResult) as any
    mockedGetSupabaseServerClient.mockResolvedValue(dupChain)
    const response = await POST(createPostRequest({ teacher_id: 't1', class_id: 'c1', subject_id: 's1' }))
    expect(response.status).toBe(400)
  })
})

describe('GET /api/teacher-assignments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedRequirePermission.mockResolvedValue(roleContext)
  })

  it('returns teacher assignment by id', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: { teacher_assignment_id: '1', teacher_id: 't1', class_id: 'c1', subject_id: 's1' }, error: null }) as any
    )
    const response = await GET_BY_ID(createGetRequest(), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.teacher_assignment_id).toBe('1')
  })

  it('returns 404 when teacher assignment not found', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: null, error: null }) as any
    )
    const response = await GET_BY_ID(createGetRequest(), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(404)
  })
})

describe('PATCH /api/teacher-assignments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedRequirePermission.mockResolvedValue(roleContext)
  })

  it('updates teacher assignment', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: { teacher_assignment_id: '1', class_id: 'c2' }, error: null }) as any
    )
    const response = await PATCH(createPatchRequest('1', { class_id: 'c2' }), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.class_id).toBe('c2')
  })

  it('rejects cross-school update when assignment belongs to another school', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({ data: null, error: null }) as any
    )
    const response = await PATCH(createPatchRequest('1', { class_id: 'c2' }), { params: Promise.resolve({ id: '1' }) })
    expect(response.status).toBe(404)
  })
})
