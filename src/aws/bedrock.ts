// src/aws/bedrock.ts
import {
  BedrockRuntimeClient,
  ConverseCommand,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  // In production (Amplify), the SDK will automatically pick up IAM role credentials
  // if these environment variables are not explicitly provided.
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
  } : {}),
})

const NOVA_LITE = process.env.BEDROCK_PRIMARY_MODEL  || 'amazon.nova-lite-v1:0'
const MISTRAL   = process.env.BEDROCK_FALLBACK_MODEL || 'mistral.mistral-large-2402-v1:0'


async function callNovaLite(prompt: string): Promise<string> {
  const response = await client.send(new ConverseCommand({
    modelId: NOVA_LITE,
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 4096, temperature: 0.1 },
  }))
  const content = response.output?.message?.content
  if (!content || content.length === 0) throw new Error('Nova Lite: empty response')
  const block = content[0]
  if ('text' in block && typeof block.text === 'string') return block.text
  throw new Error('Nova Lite: no text block in response')
}


async function callMistral(prompt: string): Promise<string> {
  const body = JSON.stringify({
    prompt:      `<s>[INST]${prompt}[/INST]`,
    max_tokens:  4096,
    temperature: 0.1,
  })
  const response = await client.send(new InvokeModelCommand({
    modelId:     MISTRAL,
    body:        Buffer.from(body),
    contentType: 'application/json',
    accept:      'application/json',
  }))
  const result = JSON.parse(Buffer.from(response.body || new Uint8Array()).toString())
  return String(result.outputs?.[0]?.text || '')
}


export async function callBedrock(prompt: string): Promise<string> {
  // Try Nova Lite first, fall back to Mistral automatically
  try {
    console.log('[Bedrock] Calling Nova Lite...')
    const text = await callNovaLite(prompt)
    console.log('[Bedrock] Nova Lite responded successfully.')
    return text
  } catch (e) {
    console.warn('[Bedrock] Nova Lite failed, falling back to Mistral:', e)
    const text = await callMistral(prompt)
    console.log('[Bedrock] Mistral responded successfully.')
    return text
  }
}


export async function callBedrockJSON(prompt: string): Promise<Record<string, unknown>> {
  const raw = await callBedrock(prompt)
  // Strip markdown code fences if present
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error(`Bedrock returned invalid JSON:\n${cleaned}`)
  }
}
