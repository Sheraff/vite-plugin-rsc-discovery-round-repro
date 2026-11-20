// RSC entry. Nothing here imports src/actions.jsx (except the two-round control's seed).
import { loadServerAction, renderToReadableStream } from '@vitejs/plugin-rsc/rsc'
import { App } from 'page' // src/pages/<VARIANT>.jsx
import 'seed' // src/no-seed.js, except in the two-round control

export function renderPage() {
  return renderToReadableStream(<App />)
}

// Calls a server action the way a server handler does, and serializes what it returns.
export async function callAction(actionId) {
  const action = await loadServerAction(actionId)
  return renderToReadableStream(await action())
}
