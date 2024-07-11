import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  const { db, client } = await connectToDatabase();

  const tokenValue = await db.collection('token').findOne({ token });

  if (tokenValue) {
    return NextResponse.json({ status: 200, message: 'valid' });
  } else {
    return NextResponse.json({ status: 404, message: 'Not valid' });
  }
}

export { GET };
