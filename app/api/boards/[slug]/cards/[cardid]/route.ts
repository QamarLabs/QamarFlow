import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function GET(request: NextRequest, { params }: { params: { slug: string; cardid: string } }) {
  const { slug, cardid } = params;
  const { db, client } = await connectToDatabase();

  return NextResponse.json({ message: 'Get more details of the card' });
}

async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; cardid: string } }
) {
  const { slug, cardid } = params;
  const body = await request.json();
  const { db, client } = await connectToDatabase();

  await db.collection('cards').updateOne({ _id: cardid, boardId: slug }, { $set: { ...body } });

  return NextResponse.json({ message: 'Card updated' });
}

async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; cardid: string } }
) {
  const { slug, cardid } = params;
  const { db, client } = await connectToDatabase();

  await db.collection('cards').deleteOne({ _id: cardid });

  return NextResponse.json({ message: 'A card has been deleted' });
}

export { GET, DELETE, PATCH };
