export type RoleContext = {
  userId: string
  role: 'platform_technical_administrator' | 'school_administrator' | 'teacher' | 'student' | 'parent'
  schoolId: string | null
}

export const roleContext: RoleContext = {
  userId: 'user-1',
  role: 'school_administrator',
  schoolId: 'school-1',
}

export function createGetRequest(search = ''): Request {
  return new Request(`http://localhost:3000/api/students${search ? `?${search}` : ''}`, {
    method: 'GET',
  })
}

export function createPostRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/students', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function createPatchRequest(id: string, body: Record<string, unknown>): Request {
  return new Request(`http://localhost:3000/api/students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function mockListClient(result: Response) {
  return { response: result }
}

export function mockGetClient(result: Response) {
  return { response: result }
}

export function mockPostClient(duplicateCheck: Response, insertResult: Response) {
  return { duplicateCheck, insertResult }
}

export function mockPatchClient(getResult: Response, updateResult: Response) {
  return { getResult, updateResult }
}
