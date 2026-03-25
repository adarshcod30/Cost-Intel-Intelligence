// src/aws/bedrock.ts
import {
  BedrockRuntimeClient,
  ConverseCommand,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const NOVA_PRO = 'amazon.nova-pro-v1:0'
const MISTRAL  = 'mistral.mistral-large-2402-v1:0'


async function callNovaPro(prompt: string): Promise<string> {
  const response = await client.send(new ConverseCommand({
    modelId: NOVA_PRO,
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 4096, temperature: 0.1 },
  }))
  const content = response.output?.message?.content
  if (!content || content.length === 0) throw new Error('Nova Pro: empty response')
  const block = content[0]
  if ('text' in block) return block.text
  throw new Error('Nova Pro: no text block in response')
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
  const result = JSON.parse(Buffer.from(response.body).toString())
  return result.outputs?.[0]?.text || ''
}


export async function callBedrock(prompt: string): Promise<string> {
  // Try Nova Pro first, fall back to Mistral automatically
  try {
    console.log('[Bedrock] Calling Nova Pro...')
    const text = await callNovaPro(prompt)
    console.log('[Bedrock] Nova Pro responded successfully.')
    return text
  } catch (e) {
    console.warn('[Bedrock] Nova Pro failed, falling back to Mistral:', e)
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
