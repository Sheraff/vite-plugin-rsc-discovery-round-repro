'use client'
// Control: a client component the server renders also imports the action.
import { showInner } from './actions.jsx'

export function Outer() {
  return <button onClick={() => showInner()}>outer</button>
}
