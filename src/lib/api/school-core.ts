const API_BASE = typeof window !== 'undefined' ? window.location.origin : ''

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`)
  }

  return data
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export type Student = {
  student_id: string
  school_id: string
  user_id: string | null
  admission_number: string
  first_name: string
  middle_name: string | null
  last_name: string
  preferred_name: string | null
  gender: string
  date_of_birth: string | null
  place_of_birth: string | null
  nationality: string | null
  region: string | null
  division: string | null
  residential_address: string | null
  phone: string | null
  email: string | null
  status: string
  previous_school: string | null
  gce_level: string | null
  candidate_status: string | null
  health_notes: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}

export type Guardian = {
  guardian_id: string
  school_id: string
  user_id: string | null
  first_name: string
  last_name: string
  relationship: string | null
  phone: string
  alternative_phone: string | null
  email: string | null
  occupation: string | null
  address: string | null
  emergency_contact: boolean
  created_at: string
  updated_at: string
}

export type Teacher = {
  teacher_id: string
  school_id: string
  user_id: string | null
  staff_id: string
  first_name: string
  last_name: string
  qualifications: string | null
  specialization: string | null
  phone: string | null
  email: string | null
  employment_status: string
  date_joined: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}

export type Class = {
  class_id: string
  school_id: string
  academic_year_id: string | null
  name: string
  stream: string | null
  display_name: string | null
  capacity: number | null
  status: string
  created_at: string
  updated_at: string
}

export type Subject = {
  subject_id: string
  school_id: string
  name: string
  code: string | null
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type TeacherAssignment = {
  teacher_assignment_id: string
  school_id: string
  teacher_id: string
  class_id: string
  subject_id: string
  created_at: string
  updated_at: string
}

export type Enrollment = {
  enrollment_id: string
  school_id: string
  student_id: string
  class_id: string
  academic_year_id: string | null
  status: string
  created_at: string
  updated_at: string
}

export type FeeStructure = {
  fee_structure_id: string
  school_id: string
  academic_year_id: string | null
  class_id: string | null
  name: string
  description: string | null
  amount: number
  currency: string
  frequency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Invoice = {
  invoice_id: string
  school_id: string
  student_id: string
  fee_structure_id: string
  amount: number
  status: string
  created_at: string
  updated_at: string
}

export type Payment = {
  payment_id: string
  school_id: string
  invoice_id: string
  amount: number
  method: string
  reference: string | null
  status: string
  created_at: string
  updated_at: string
}

export type Receipt = {
  receipt_id: string
  school_id: string
  payment_id: string
  invoice_id: string
  student_id: string
  receipt_number: string | null
  amount: number
  method: string | null
  paid_by: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export type AttendanceRecord = {
  attendance_record_id: string
  school_id: string
  student_id: string
  class_id: string
  enrollment_id: string | null
  teacher_id: string | null
  academic_year_id: string | null
  attendance_date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type AttendanceWorksheet = {
  attendance_worksheet_id: string
  school_id: string
  class_id: string
  teacher_id: string | null
  academic_year_id: string | null
  worksheet_date: string
  file_id: string | null
  extraction_status: 'pending' | 'extraction' | 'extracted' | 'review' | 'approved' | 'rejected'
  extraction_result: unknown
  reviewed_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export type StudentGuardian = {
  student_guardian_id: string
  school_id: string
  student_id: string
  guardian_id: string
  is_primary: boolean
  created_at: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  limit: number
  offset: number
}

export async function listStudents(params?: { search?: string; status?: string; limit?: number; offset?: number }) {
  return request(`/api/students${buildQuery({
    search: params?.search,
    status: params?.status,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function getStudent(id: string) {
  return request(`/api/students/${id}`)
}

export async function createStudent(payload: Partial<Student>) {
  return request('/api/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateStudent(id: string, payload: Partial<Student>) {
  return request(`/api/students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listGuardians(params?: { search?: string; limit?: number; offset?: number }) {
  return request(`/api/guardians${buildQuery({
    search: params?.search,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function getGuardian(id: string) {
  return request(`/api/guardians/${id}`)
}

export async function createGuardian(payload: Partial<Guardian>) {
  return request('/api/guardians', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateGuardian(id: string, payload: Partial<Guardian>) {
  return request(`/api/guardians/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listTeachers(params?: { search?: string; status?: string; limit?: number; offset?: number }) {
  return request(`/api/teachers${buildQuery({
    search: params?.search,
    status: params?.status,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function getTeacher(id: string) {
  return request(`/api/teachers/${id}`)
}

export async function createTeacher(payload: Partial<Teacher>) {
  return request('/api/teachers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTeacher(id: string, payload: Partial<Teacher>) {
  return request(`/api/teachers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listClasses(params?: { search?: string; status?: string; academic_year_id?: string; limit?: number; offset?: number }) {
  return request(`/api/classes${buildQuery({
    search: params?.search,
    status: params?.status,
    academic_year_id: params?.academic_year_id,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function getClass(id: string) {
  return request(`/api/classes/${id}`)
}

export async function createClass(payload: Partial<Class>) {
  return request('/api/classes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateClass(id: string, payload: Partial<Class>) {
  return request(`/api/classes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listSubjects(params?: { search?: string; active?: string; limit?: number; offset?: number }) {
  return request(`/api/subjects${buildQuery({
    search: params?.search,
    active: params?.active,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function getSubject(id: string) {
  return request(`/api/subjects/${id}`)
}

export async function createSubject(payload: Partial<Subject>) {
  return request('/api/subjects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateSubject(id: string, payload: Partial<Subject>) {
  return request(`/api/subjects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listTeacherAssignments(params?: { teacher_id?: string; class_id?: string; subject_id?: string; limit?: number; offset?: number }) {
  return request(`/api/teacher-assignments${buildQuery({
    teacher_id: params?.teacher_id,
    class_id: params?.class_id,
    subject_id: params?.subject_id,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function getTeacherAssignment(id: string) {
  return request(`/api/teacher-assignments/${id}`)
}

export async function createTeacherAssignment(payload: Partial<TeacherAssignment>) {
  return request('/api/teacher-assignments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTeacherAssignment(id: string, payload: Partial<TeacherAssignment>) {
  return request(`/api/teacher-assignments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listEnrollments(params?: { student_id?: string; class_id?: string; academic_year_id?: string; status?: string; limit?: number; offset?: number }) {
  return request(`/api/enrollments${buildQuery({
    student_id: params?.student_id,
    class_id: params?.class_id,
    academic_year_id: params?.academic_year_id,
    status: params?.status,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function getEnrollment(id: string) {
  return request(`/api/enrollments/${id}`)
}

export async function createEnrollment(payload: Partial<Enrollment>) {
  return request('/api/enrollments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateEnrollment(id: string, payload: Partial<Enrollment>) {
  return request(`/api/enrollments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listStudentGuardians(params?: { student_id?: string; guardian_id?: string; limit?: number; offset?: number }) {
  return request(`/api/student-guardians${buildQuery({
    student_id: params?.student_id,
    guardian_id: params?.guardian_id,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function createStudentGuardian(payload: Partial<StudentGuardian>) {
  return request('/api/student-guardians', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listFeeStructures(params?: { search?: string; academic_year_id?: string; class_id?: string; limit?: number; offset?: number }) {
  return request(`/api/fee-structures${buildQuery({
    search: params?.search,
    academic_year_id: params?.academic_year_id,
    class_id: params?.class_id,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function getFeeStructure(id: string) {
  return request(`/api/fee-structures/${id}`)
}

export async function createFeeStructure(payload: Partial<FeeStructure>) {
  return request('/api/fee-structures', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateFeeStructure(id: string, payload: Partial<FeeStructure>) {
  return request(`/api/fee-structures/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listInvoices(params?: { student_id?: string; fee_structure_id?: string; status?: string; limit?: number; offset?: number }) {
  return request(`/api/invoices${buildQuery({
    student_id: params?.student_id,
    fee_structure_id: params?.fee_structure_id,
    status: params?.status,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function getInvoice(id: string) {
  return request(`/api/invoices/${id}`)
}

export async function createInvoice(payload: Partial<Invoice>) {
  return request('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateInvoice(id: string, payload: Partial<Invoice>) {
  return request(`/api/invoices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listPayments(params?: { invoice_id?: string; method?: string; limit?: number; offset?: number }) {
  return request(`/api/payments${buildQuery({
    invoice_id: params?.invoice_id,
    method: params?.method,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function getPayment(id: string) {
  return request(`/api/payments/${id}`)
}

export async function createPayment(payload: Partial<Payment>) {
  return request('/api/payments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updatePayment(id: string, payload: Partial<Payment>) {
  return request(`/api/payments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listReceipts(params?: { payment_id?: string; student_id?: string; limit?: number; offset?: number }) {
  return request(`/api/receipts${buildQuery({
    payment_id: params?.payment_id,
    student_id: params?.student_id,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function getReceipt(id: string) {
  return request(`/api/receipts/${id}`)
}

export async function createReceipt(payload: Partial<Receipt>) {
  return request('/api/receipts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateReceipt(id: string, payload: Partial<Receipt>) {
  return request(`/api/receipts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listAttendanceRecords(params?: { class_id?: string; student_id?: string; date_from?: string; date_to?: string; status?: string; limit?: number; offset?: number }) {
  return request(`/api/attendance${buildQuery({
    class_id: params?.class_id,
    student_id: params?.student_id,
    date_from: params?.date_from,
    date_to: params?.date_to,
    status: params?.status,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  })}`)
}

export async function createAttendanceRecord(payload: Partial<AttendanceRecord>) {
  return request('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getAttendanceRecord(id: string) {
  return request(`/api/attendance/${id}`)
}

export async function updateAttendanceRecord(id: string, payload: Partial<AttendanceRecord>) {
  return request(`/api/attendance/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
