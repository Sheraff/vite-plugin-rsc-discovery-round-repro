// SSR entry: turns a Flight stream into HTML (loads client references from the SSR build).
import { use } from 'react'
import { renderToReadableStream } from 'react-dom/server.edge'
import { createFromReadableStream } from '@vitejs/plugin-rsc/ssr'

export async function flightToHtml(flight) {
  const payload = createFromReadableStream(flight)
  function Root() {
    return use(payload)
  }
  const errors = []
  const html = await renderToReadableStream(<Root />, {
    onError(error) {
      errors.push(String(error?.message ?? error))
    },
  })
  await html.allReady
  return { html: await new Response(html).text(), errors }
}
