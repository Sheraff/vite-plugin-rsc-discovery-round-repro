// Test instrumentation only: records the `'use server'` modules the client environment transforms.
import fs from 'node:fs'

export function recordClientServerReferences() {
  const files = new Set()
  return {
    name: 'record-client-server-references',
    applyToEnvironment: (environment) => environment.name === 'client',
    transform: {
      order: 'pre', // before plugin-rsc removes the directive
      handler(code, id) {
        if (/^\s*['"]use server['"]/.test(code)) {
          files.add(id)
        }
      },
    },
    buildEnd() {
      fs.mkdirSync('.seed', { recursive: true })
      fs.writeFileSync('.seed/client-server-references.json', JSON.stringify([...files], null, 2))
    },
  }
}
