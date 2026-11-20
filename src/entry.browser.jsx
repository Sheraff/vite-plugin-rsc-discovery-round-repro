// Browser entry. Only browser code imports the action: e.g. a global shortcut or an error reporter.
import '@vitejs/plugin-rsc/browser' // loads the client references
import { showInner } from './actions.jsx'

globalThis.showInner = showInner
