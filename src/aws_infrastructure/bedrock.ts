import { 
  BedrockRuntimeClient, 
  ConverseCommand, 
  InvokeModelCommand 
} from '@aws-sdk/client-bedrock-runtime';
import { AWS_CONFIG, BEDROCK_MODELS, PIPELINE_CONFIG } from './config';

const client = new BedrockRuntimeClient(AWS_CONFIG);

const callNovaPro = async (prompt: string): Promise<string> => {
  const command = new ConverseCommand({
    modelId: BEDROCK_MODELS.PRIMARY,
    messages: [
      {
        role: 'user',
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      maxTokens: PIPELINE_CONFIG.BEDROCK_MAX_TOKENS,
      temperature: PIPELINE_CONFIG.BEDROCK_TEMPERATURE,
    },
  });

  const response = await client.send(command);
  return response.output?.message?.content?.[0]?.text || '';
};

const callMistral = async (prompt: string): Promise<string> => {
  const body = JSON.stringify({
    prompt: `<s>[INST]${prompt}[/INST]`,
    max_tokens: PIPELINE_CONFIG.BEDROCK_MAX_TOKENS,
    temperature: PIPELINE_CONFIG.BEDROCK_TEMPERATURE,
  });

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODELS.FALLBACK,
    body: body,
    contentType: 'application/json',
    accept: 'application/json',
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.outputs?.[0]?.text || '';
};

export const callBedrock = async (prompt: string, forceFallback: boolean = false): Promise<string> => {
  if (!forceFallback) {
    try {
      console.log(`[Bedrock] Calling Nova Pro...`);
      const text = await callNovaPro(prompt);
      console.log(`[Bedrock] Nova Pro responded.`);
      return text;
    } catch (e) {
      console.error(`[Bedrock] Nova Pro failed: ${e}. Falling back to Mistral...`);
    }
  }

  try {
    const text = await callMistral(prompt);
    console.log(`[Bedrock] Mistral responded.`);
    return text;
  } catch (e) {
    throw new Error(`Both Bedrock models failed. Last error: ${e}`);
  }
};

export const callBedrockJson = async (prompt: string): Promise<any> => {
  const raw = await callBedrock(prompt);
  const clean = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error(`Bedrock returned invalid JSON: ${clean}`);
    throw new Error(`Invalid JSON from Bedrock: ${e}`);
  }
};
