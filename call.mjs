// Runs in its own process after each build: RSC calls the action and serializes its result,
// SSR decodes it and renders HTML. Prints one JSON line.
const [actionId] = process.argv.slice(2)
const rsc = await import('./dist/rsc/index.js')
const ssr = await import('./dist/ssr/index.js')

let result
try {
  const flight = await rsc.callAction(actionId)
  const { html, errors } = await ssr.flightToHtml(flight)
  if (errors.length > 0) {
    result = { ok: false, message: `SSR: ${errors.join('; ')}` }
  } else {
    result = { ok: html.includes('<p>inner</p>'), message: `html: ${html}` }
  }
} catch (error) {
  result = { ok: false, message: `showInner(): ${error.message}` }
}
console.log(JSON.stringify(result))
