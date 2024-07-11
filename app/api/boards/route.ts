import type { NextApiRequest, NextApiResponse } from 'next';

import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function GET(request: NextRequest) {
  const { db, client } = await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userid');

  const boards = await db.collection('boards').find({ createdBy: userId }).limit(30).toArray();

  const invitedBoards = await db.collection('boards').find({ users: userId }).toArray();
  const updatedBoards = boards.concat(invitedBoards);

  return NextResponse.json(updatedBoards);
}

async function POST(request: NextRequest) {
  const { db, client } = await connectToDatabase();
  const requestBody = await request.json();
  const { _id, name, dateCreated, createdBy, backgroundImage } = requestBody;

  const data = {
    _id,
    name,
    dateCreated,
    createdBy,
    backgroundImage,
    users: []
  };

  const board = await db.collection('boards').insertOne(data);
  return NextResponse.json(board);
}

export { GET, POST };
