import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/util/mongodb';
import checkEnvironment from '@/util/check-environment';
import sgMail from '@sendgrid/mail';
import shortId from 'shortid';
import uniqid from 'uniqid';
import { NextRequest, NextResponse } from 'next/server';

const sendMail = async (email, emailData, user) => {
  const url = checkEnvironment();
  const page = 'signup';

  const msg = {
    to: email,
    from: 'dell41ankit@gmail.com',
    subject: 'You are invited to join to a qamarflow clone board',
    html: `<div>
      <div style="height:100px; background-color:#26292c; color: white">
        <p>Qamar Flow</p>
      <div>
      <div style="height:200px; background-color:#0079bf;">
        <a href='${url}/${page}?token=${emailData.token}&email=${email}&boardId=${emailData.boardId}'>Join</a>
      </div>
      <div style="height:100px; background-color:#26292c;">

      </div>
    </div>`
  };

  await sgMail.send(msg);
};

async function POST(request: NextRequest) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');
  const { db, client } = await connectToDatabase();

  const body = await request.json();
  const token = uniqid();
  const id = shortId.generate();
  const boardId = body.boardId;
  const email = body.email;

  const emailData = {
    id,
    token,
    boardId
  };

  await db.collection('token').insertOne({ token, userId: id, status: 'valid', email, boardId });
  const user = await db.collection('users').findOne({ email });

  try {
    await sendMail(email, emailData, user);
    return NextResponse.json({ message: 'Email sent sucessfully', status: 200 });
  } catch {
    return NextResponse.json({ message: 'Failed to send.' });
  }
}

export { POST };
