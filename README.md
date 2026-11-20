# @vitejs/plugin-rsc: a server reference first seen by the client build is missing from the RSC build

Reproduction for (issue link once filed).

Plain `@vitejs/plugin-rsc`, no framework. A `'use server'` module that only the browser entry imports is first seen
by the client build ([4/5]), after the RSC build ([3/5]). `vite build` exits 0; calling the action fails. Its result
renders a client component, which only an RSC build that includes the action can find.

```sh
npm install
npm run repro    # only the browser entry imports the action: BUG
npm run control  # a server-rendered client component imports it; a second build seeded from the first: OK
```

```
src/entry.browser.jsx  imports showInner from actions.jsx (its only importer in the `browser` variant)
src/actions.jsx        'use server'  showInner() returns <Inner />
src/Inner.jsx          'use client'  <p>inner</p>
src/Outer.jsx          'use client'  imports showInner (control: `rendered` page renders it)
src/pages/*.jsx        the server page (VARIANT): browser = <p>page</p>; rendered = <Outer />
```

`repro.mjs` builds with `vite build`, reads the action id from the client bundle, then `call.mjs` (a separate
process) imports `dist/rsc/index.js` and `dist/ssr/index.js`, calls the action (`loadServerAction(id)`,
`renderToReadableStream(result)`) and renders the Flight result to HTML.

The two-build control is a second complete `vite build` in which the RSC entry also imports the `'use server'`
modules the first build's client environment transformed (recorded by `record.js`), so the scans and the RSC build
see them.

Results (Node 26.12.1, Linux x64; @vitejs/plugin-rsc 0.5.39, vite 8.3.8, @vitejs/plugin-react 6.3.0, react 19.3.1):

```
$ npm run repro
BUG browser   only the browser entry imports the action
    vite build: exit 0, no warning about showInner
    client calls: fc5b8e0c47b4#showInner
    rsc build has showInner: no
    Inner in client JS: no
    showInner(): server reference not found 'fc5b8e0c47b4'

$ npm run control
OK  rendered  a client component the server renders imports it
    vite build: exit 0, no warning about showInner
    client calls: fc5b8e0c47b4#showInner
    rsc build has showInner: yes
    Inner in client JS: yes
    html: <p>inner</p>
OK  browser   second build, seeded from the first
    vite build: exit 0, no warning about showInner
    client calls: fc5b8e0c47b4#showInner
    rsc build has showInner: yes
    Inner in client JS: yes
    html: <p>inner</p>
```

Same rows with react 19.2.9, and on vite 7.3.8 (@vitejs/plugin-react 5.2.0).
