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
import { GET, POST } from '@/app/api/receipts/route'

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
  return new NextRequest(`http://localhost:3000/api/receipts${search ? `?${search}` : ''}`, {
    method: 'GET',
  })
}

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/receipts', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function chain(result: { data: unknown; error: { message: string } | null; count?: number | null }) {
  const methods: Record<string, unknown> = {
    select: () => methods,
    eq: () => methods,
    or: () => methods,
    order: () => methods,
    range: () => Promise.resolve({ data: result.data ?? [], error: result.error, count: result.count ?? 0 }),
    maybeSingle: () => Promise.resolve(result),
    neq: () => methods,
    update: () => methods,
    delete: () => methods,
    insert: () => methods,
    single: () => Promise.resolve(result),
  }
  return methods
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedRequirePermission.mockResolvedValue(roleContext)
})

describe('GET /api/receipts', () => {
  it('requires authentication', async () => {
    mockedRequirePermission.mockResolvedValue(null)
    const response = await GET(createGetRequest())
    expect(response.status).toBe(401)
  })

  it('returns receipts for authorized user', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue({
      from: () => chain({ data: [{ receipt_id: '1', amount: 500, method: 'manual_cash' }], error: null }),
    } as any)
    const response = await GET(createGetRequest())
    expect(response.status).toBe(200)
  })
})

describe('POST /api/receipts', () => {
  it('creates a receipt', async () => {
    let receiptMaybeSingle = true
    mockedGetSupabaseServerClient.mockResolvedValue({
      from: (table: string) => {
        if (table === 'payments') {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: () => Promise.resolve({ data: { payment_id: '1' }, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'receipts') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: () => {
                  if (receiptMaybeSingle) {
                    receiptMaybeSingle = false
                    return Promise.resolve({ data: null, error: null })
                  }
                  return Promise.resolve({ data: { receipt_id: '1' }, error: null })
                },
              }),
            }),
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({ data: { receipt_id: '1', amount: 500 }, error: null }),
              }),
            }),
          }
        }
        return chain({ data: null, error: null })
      },
    } as any)
    const response = await POST(createPostRequest({ payment_id: '1', invoice_id: '1', student_id: '1', amount: 500 }))
    expect(response.status).toBe(201)
  })
})
