import Anthropic from '@anthropic-ai/sdk'
import config from '../../merry.config.js'

const client = new Anthropic()

export async function callLLM({ prompt, complexity = 'simple', system, maxTokens = 1024 }) {
  const model = config.models[complexity]
  const messages = [{ role: 'user', content: prompt }]
  const params = { model, max_tokens: maxTokens, messages }

  if (system) {
    // cache_control reduce tokens en llamadas repetidas con el mismo system prompt
    params.system = [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
  }

  const res = await client.messages.create(params)
  return res.content[0].text
}
