// Builds the app with `vite build`, then calls the server action from the built RSC entry and
// renders its result to HTML with the built SSR entry (call.mjs).
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const mode = process.argv[2] ?? 'repro'

if (mode === 'repro') {
  await check('browser', 'only the browser entry imports the action')
} else if (mode === 'control') {
  await check('rendered', 'a client component the server renders imports it')
  await twoRounds()
}

async function check(variant, label, seedFile) {
  const buildOutput = build(variant, seedFile)
  const actionId = actionIdInClientJs()
  const result = callAndRender(actionId)
  console.log(`${result.ok ? 'OK ' : 'BUG'} ${variant.padEnd(9)} ${label}`)
  console.log(`    vite build: exit 0, ${buildOutput.includes('showInner') ? 'mentions showInner' : 'no warning about showInner'}`)
  console.log(`    client calls: ${actionId}`)
  console.log(`    rsc build has showInner: ${rscHasAction() ? 'yes' : 'no'}`)
  console.log(`    Inner in client JS: ${innerInClientJs() ? 'yes' : 'no'}`)
  console.log(`    ${result.message}`)
}

// Second complete build, seeded with the server references the first build's client
// environment found: the RSC entry imports them, so the RSC build sees them.
async function twoRounds() {
  build('browser')
  const files = JSON.parse(fs.readFileSync('.seed/client-server-references.json', 'utf8'))
  const seedFile = path.resolve('.seed/seed.js')
  fs.writeFileSync(seedFile, files.map((file) => `import ${JSON.stringify(file)}\n`).join(''))
  await check('browser', 'second build, seeded from the first', seedFile)
}

function build(variant, seedFile) {
  fs.rmSync('dist', { recursive: true, force: true })
  const env = { ...process.env, VARIANT: variant }
  if (seedFile) {
    env.SEED_FILE = seedFile
  }
  const result = spawnSync('node_modules/.bin/vite', ['build'], { env, encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error(`vite build failed:\n${result.stderr}`)
  }
  return result.stdout + result.stderr
}

// The id the client bundle sends when it calls showInner.
function actionIdInClientJs() {
  const dir = 'dist/client/assets'
  for (const file of fs.readdirSync(dir)) {
    const match = /createServerReference\("([^"]*#showInner)"/.exec(
      fs.readFileSync(path.join(dir, file), 'utf8'),
    )
    if (match) {
      return match[1]
    }
  }
  throw new Error('no showInner reference in the client bundle')
}

function innerInClientJs() {
  const dir = 'dist/client/assets'
  return fs
    .readdirSync(dir)
    .some((file) => fs.readFileSync(path.join(dir, file), 'utf8').includes('"inner"'))
}

function rscHasAction() {
  return fs.readFileSync('dist/rsc/index.js', 'utf8').includes('showInner')
}

function callAndRender(actionId) {
  const output = execFileSync('node', ['call.mjs', actionId], { encoding: 'utf8' })
  return JSON.parse(output)
}
