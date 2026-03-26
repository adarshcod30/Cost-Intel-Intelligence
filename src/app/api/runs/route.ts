import { NextResponse } from 'next/server';
import { getAllRuns } from '@/aws/dynamo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const runs = await getAllRuns();
    return NextResponse.json({ runs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
