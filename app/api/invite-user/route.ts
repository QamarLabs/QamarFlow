import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/util/mongodb';
import { NextRequest, NextResponse } from 'next/server';

async function PATCH(request: NextRequest) {
  const { db, client } = await connectToDatabase();
  const body = await request.json();
  const { email, boardId } = body;

  const user = await db.collection('users').findOne({ email });
  const boardData = await db.collection('boards').findOne({ _id: boardId });

  const isExistingUser = boardData.users.indexOf(user._id);
  if (isExistingUser > -1) {
    return NextResponse.json({ status: 400, message: 'User is already added to the board' });
  } else {
    const board = await db
      .collection('boards')
      .updateOne({ _id: boardId }, { $push: { users: user?._id } });

    if (board) {
      return NextResponse.json({ status: 200, message: 'Invited' });
    } else {
      return NextResponse.json({ status: 404, message: 'Some issues' });
    }
  }
}

export { PATCH };
