import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  const { db, client } = await connectToDatabase();

  const columns = await db.collection('columns').find({ boardId: slug }).toArray();
  console.log('GET COLUMNS:', columns);
  return NextResponse.json(columns);
}

async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  console.log('SLUG:', slug);
  const { db, client } = await connectToDatabase();

  const { id, boardId, boardName, columnName, dateCreated, userId, cards, sequence } =
    await request.json();

  const data = {
    _id: id,
    boardId,
    boardName,
    columnName,
    dateCreated,
    userId,
    sequence
  };

  console.log('data:', data);

  const board = await db.collection('columns').insertOne(data);
  return NextResponse.json(board);
}

export { GET, POST };
