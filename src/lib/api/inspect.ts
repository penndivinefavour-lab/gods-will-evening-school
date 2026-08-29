import { getSupabaseServerClient } from '@/lib/supabase-server'

type InspectRow = {
  table_schema?: string
  table_name?: string
  rolname?: string
  schemaname?: string
  tablename?: string
  policyname?: string
}

type InspectResults = {
  tables: string[]
  roles: string[]
  policies: string[]
  errors: string[]
}

function toName(value: unknown) {
  if (typeof value === 'string') {
    return value
  }
  return ''
}

export async function inspectDatabase(): Promise<InspectResults> {
  const supabase = await getSupabaseServerClient()
  const results: InspectResults = {
    tables: [],
    roles: [],
    policies: [],
    errors: [],
  }

  try {
    const { data: tableRows, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_schema, table_name')
      .eq('table_schema', 'public')
      .order('table_name', { ascending: true })

    if (tableError) {
      results.errors.push(`tables query failed: ${tableError.message}`)
    } else {
      results.tables = (tableRows as InspectRow[] | null ?? []).map((row) => `${toName(row.table_schema)}.${toName(row.table_name)}`)
    }
  } catch (error) {
    results.errors.push(`tables query exception: ${error instanceof Error ? error.message : 'unknown'}`)
  }

  try {
    const { data: roleRows, error: roleError } = await supabase
      .from('pg_roles')
      .select('rolname')
      .order('rolname', { ascending: true })

    if (roleError) {
      results.errors.push(`roles query failed: ${roleError.message}`)
    } else {
      results.roles = (roleRows as InspectRow[] | null ?? []).map((row) => toName(row.rolname))
    }
  } catch (error) {
    results.errors.push(`roles query exception: ${error instanceof Error ? error.message : 'unknown'}`)
  }

  try {
    const { data: policyRows, error: policyError } = await supabase
      .from('pg_policies')
      .select('schemaname, tablename, policyname')
      .eq('schemaname', 'public')
      .order('tablename', { ascending: true })

    if (policyError) {
      results.errors.push(`policies query failed: ${policyError.message}`)
    } else {
      results.policies = (policyRows as InspectRow[] | null ?? []).map((row) => `${toName(row.schemaname)}.${toName(row.tablename)}: ${toName(row.policyname)}`)
    }
  } catch (error) {
    results.errors.push(`policies query exception: ${error instanceof Error ? error.message : 'unknown'}`)
  }

  return results
}
