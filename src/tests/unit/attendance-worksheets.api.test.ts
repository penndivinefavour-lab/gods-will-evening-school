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
import { GET as GET_WORKSHEETS, POST as POST_WORKSHEETS } from '@/app/api/attendance/worksheets/route'
import {
  GET as GET_WORKSHEET,
  PATCH as PATCH_WORKSHEET,
  DELETE as DELETE_WORKSHEET,
} from '@/app/api/attendance/worksheets/[id]/route'
import {
  POST as APPROVE_WORKSHEET,
} from '@/app/api/attendance/worksheets/[id]/approve/route'
import {
  POST as REJECT_WORKSHEET,
} from '@/app/api/attendance/worksheets/[id]/reject/route'
import { GET as GET_REPORTS } from '@/app/api/attendance/reports/route'

const mockedRequirePermission = vi.mocked(requirePermission)
const mockedGetSupabaseServerClient = vi.mocked(getSupabaseServerClient)

type RoleContext = {
  userId: string
  role: 'platform_technical_administrator' | 'school_administrator' | 'teacher' | 'student' | 'parent'
  schoolId: string | null
}

const roleContext: RoleContext = {
  userId: 'user-1',
  role: 'teacher',
  schoolId: 'school-1',
}

function createSupabaseClient(result: { data: unknown; error: { message: string } | null; count?: number | null }) {
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
  return new NextRequest(`http://localhost:3000/api/attendance/worksheets${search ? `?${search}` : ''}`, {
    method: 'GET',
  })
}

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/attendance/worksheets', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedRequirePermission.mockResolvedValue(roleContext)
})

describe('GET /api/attendance/worksheets', () => {
  it('returns attendance worksheets for authorized user', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: [], error: null }) as any)
    const response = await GET_WORKSHEETS(createGetRequest())
    expect(response.status).toBe(200)
  })
})

describe('POST /api/attendance/worksheets', () => {
  it('creates attendance worksheet', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: { attendance_worksheet_id: 'ws-1' }, error: null }) as any)
    const response = await POST_WORKSHEETS(createPostRequest({ class_id: 'class-1', worksheet_date: '2026-08-24' }))
    expect(response.status).toBe(201)
  })
})

describe('GET /api/attendance/worksheets/[id]', () => {
  it('returns attendance worksheet', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: { attendance_worksheet_id: 'ws-1' }, error: null }) as any)
    const response = await GET_WORKSHEET(createGetRequest(), { params: Promise.resolve({ id: 'ws-1' }) })
    expect(response.status).toBe(200)
  })
})

describe('PATCH /api/attendance/worksheets/[id]', () => {
  it('updates worksheet status', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: { attendance_worksheet_id: 'ws-1' }, error: null }) as any)
    const request = new NextRequest('http://localhost:3000/api/attendance/worksheets/ws-1', {
      method: 'PATCH',
      body: JSON.stringify({ extraction_status: 'review' }),
    })
    const response = await PATCH_WORKSHEET(request, { params: Promise.resolve({ id: 'ws-1' }) })
    expect(response.status).toBe(200)
  })
})

describe('DELETE /api/attendance/worksheets/[id]', () => {
  it('deletes worksheet', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: null, error: null }) as any)
    const request = new NextRequest('http://localhost:3000/api/attendance/worksheets/ws-1', { method: 'DELETE' })
    const response = await DELETE_WORKSHEET(request, { params: Promise.resolve({ id: 'ws-1' }) })
    expect(response.status).toBe(200)
  })
})

describe('POST /api/attendance/worksheets/[id]/approve', () => {
  it('approves extracted worksheet', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({
      data: { attendance_worksheet_id: 'ws-1', extraction_status: 'extracted', extraction_result: { records: [{ student_id: 'student-1', attendance_date: '2026-08-24', status: 'present' }] } },
      error: null,
    }) as any)
    const request = new NextRequest('http://localhost:3000/api/attendance/worksheets/ws-1/approve', { method: 'POST' })
    const response = await APPROVE_WORKSHEET(request, { params: Promise.resolve({ id: 'ws-1' }) })
    expect(response.status).toBe(200)
  })
})

describe('POST /api/attendance/worksheets/[id]/reject', () => {
  it('rejects worksheet with reason', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({ data: { attendance_worksheet_id: 'ws-1' }, error: null }) as any)
    const request = new NextRequest('http://localhost:3000/api/attendance/worksheets/ws-1/reject', {
      method: 'POST',
      body: JSON.stringify({ rejection_reason: 'Quality check failed' }),
    })
    const response = await REJECT_WORKSHEET(request, { params: Promise.resolve({ id: 'ws-1' }) })
    expect(response.status).toBe(200)
  })
})

describe('GET /api/attendance/reports', () => {
  it('returns attendance report totals', async () => {
    mockedGetSupabaseServerClient.mockResolvedValue(createSupabaseClient({
      data: [
        { attendance_record_id: '1', status: 'present' },
        { attendance_record_id: '2', status: 'absent' },
      ],
      error: null,
    }) as any)
    const response = await GET_REPORTS(createGetRequest())
    expect(response.status).toBe(200)
  })
})
