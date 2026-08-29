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
import { GET, POST } from '@/app/api/payments/route'

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
  return new NextRequest(`http://localhost:3000/api/payments${search ? `?${search}` : ''}`, {
    method: 'GET',
  })
}

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/payments', {
    method: 'POST',
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

describe('GET /api/payments', () => {
  it('requires authentication', async () => {
    mockedRequirePermission.mockResolvedValue(null)
    const response = await GET(createGetRequest())
    expect(response.status).toBe(401)
  })

  it('returns payments for authorized user', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({
        data: [{ payment_id: '1', amount: 500, method: 'manual_cash' }],
        count: 1,
        error: null,
      }) as any
    )
    const response = await GET(createGetRequest())
    expect(response.status).toBe(200)
  })
})

describe('POST /api/payments', () => {
  it('creates a payment', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(
      createSupabaseClient({
        data: { payment_id: '1', amount: 500, method: 'manual_cash' },
        error: null,
      }) as any
    )
    const response = await POST(createPostRequest({ invoice_id: '1', method: 'manual_cash', amount: 500 }))
    expect(response.status).toBe(201)
  })
})
