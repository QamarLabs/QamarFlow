import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  const { db, client } = await connectToDatabase();

  const user = await db.collection('users').findOne({ email });
  if (user) {
    return NextResponse.json({ status: 200, message: 'Found' });
  } else {
    return NextResponse.json({ status: 404, message: 'Not found' });
  }
}

export { GET };
