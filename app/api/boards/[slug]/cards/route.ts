import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const { db, client } = await connectToDatabase();

  const columns = await db.collection('cards').find({ boardId: slug }).toArray();
  return NextResponse.json(columns);
}

async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const { db, client } = await connectToDatabase();

  await db.collection('cards').deleteOne({ boardId: slug });
  return NextResponse.json({ message: 'All columns deleted' });
}

export { GET, DELETE };
