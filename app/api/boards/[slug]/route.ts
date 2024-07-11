import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  const { db, client } = await connectToDatabase();
  const board = await db.collection('boards').findOne({ _id: slug });

  return NextResponse.json(board);
}

async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const { db, client } = await connectToDatabase();
  const body = await request.json();
  const { _id, name, dateCreated, createdBy, backgroundImage } = body;
  const data = {
    _id,
    name,
    dateCreated,
    createdBy,
    backgroundImage
  };

  const board = await db.collection('boards').updateOne({ _id: slug }, { $set: data });
  return NextResponse.json(board);
}

async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  const { db, client } = await connectToDatabase();
  const { slug } = params;

  await db.collection('cards').remove({ boardId: slug });
  await db.collection('columns').remove({ boardId: slug });
  await db.collection('boards').deleteOne({ _id: slug });

  return NextResponse.json({ messsage: 'Delete boards with columns and cards' });
}

export { GET, PATCH, DELETE };
