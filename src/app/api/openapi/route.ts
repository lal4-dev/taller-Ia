import { NextResponse } from 'next/server';
import openSpecData from '../../../../docs/openspec.json';

export async function GET() {
  return NextResponse.json(openSpecData, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
