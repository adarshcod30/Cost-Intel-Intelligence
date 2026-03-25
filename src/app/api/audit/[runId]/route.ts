import { NextResponse } from 'next/server';
import { getRunEvents } from '@/aws/dynamo';

export async function GET(
  request: Request,
  { params }: { params: { runId: string } }
) {
  try {
    const events = await getRunEvents(params.runId);
    return NextResponse.json({ events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
