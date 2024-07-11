import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; cid: string; cardid: string } }
) {
  const { slug, cid, cardid } = params;
  const { db, client } = await connectToDatabase();
  const body = await request.json();

  const { boardName, columnName, columnId } = body;
  const data = {
    boardName,
    columnName,
    columnId
  };

  const board = await db.collection('cards').updateOne({ _id: cardid }, { $set: data });

  return NextResponse.json(board);
}

async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; cid: string; cardid: string } }
) {
  const { cardid, cid } = params;
  const { db, client } = await connectToDatabase();

  await db.collection('cards').deleteOne({ _id: cardid, columnId: cid });

  return NextResponse.json({ messsage: 'Deleted' });
}

export { PATCH, DELETE };
