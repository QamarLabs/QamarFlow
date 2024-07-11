import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { db, client } = await connectToDatabase();
  const slug = searchParams.get('slug');

  const user = await db.collection('users').findOne({ _id: slug });

  return NextResponse.json(user);
}

export { GET };
