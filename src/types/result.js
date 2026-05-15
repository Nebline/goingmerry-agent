export function makeResult({ success, output, agent, action, error = null }) {
  return { success, output, agent, action, error, ts: Date.now() }
}
