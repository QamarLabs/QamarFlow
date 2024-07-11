import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function GET(request: NextRequest, { params }: { params: { slug: string; cid: string } }) {
  const { slug, cid } = params;
  const { db, client } = await connectToDatabase();

  const cards = await db.collection('cards').find({ boardId: slug }).toArray();

  return NextResponse.json(cards);
}

async function POST(request: NextRequest, { params }: { params: { slug: string; cid: string } }) {
  const { slug, cid } = params;
  const { db, client } = await connectToDatabase();

  const body = await request.json();
  const { id, boardId, columnId, dateCreated, userId, title, type, description, sequence } = body;

  const data = {
    _id: id,
    boardId,
    columnId,
    title,
    type,
    dateCreated,
    userId,
    sequence,
    description
  };

  const card = await db.collection('cards').insertOne(data);

  return NextResponse.json(card);
}

async function DELETE(request: NextRequest, { params }: { params: { slug: string; cid: string } }) {
  const { slug, cid } = params;
  const { db, client } = await connectToDatabase();

  await db.collection('columns').remove({ boardId: slug });
  return NextResponse.json({ message: 'All columns deleted' });
}

export { GET, POST, DELETE };
