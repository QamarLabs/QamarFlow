import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function PATCH(request: NextRequest, { params }: { params: { cid: string } }) {
  const { cid } = params;
  const body = await request.json();
  const { db, client } = await connectToDatabase();
  console.log('COLUMN CID!!', cid);
  const board = await db.collection('columns').updateOne({ _id: cid }, { $set: { ...body } });

  return NextResponse.json(board);
}

async function DELETE(request: NextRequest, { params }: { params: { cid: string } }) {
  const { cid } = params;
  const { db, client } = await connectToDatabase();

  await db.collection('cards').remove({ columnId: cid });
  await db.collection('columns').deleteOne({ _id: cid });

  return NextResponse.json({ messsage: 'Deleted' });
}

export { PATCH, DELETE };
