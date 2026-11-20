'use server'
// Reached only from browser code. Its result renders a client component.
import { Inner } from './Inner.jsx'

export async function showInner() {
  return <Inner />
}
