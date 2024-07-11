import NextAuth, { AuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDatabase } from '@/util/mongodb';
import { retrieveUsernmeFromEmail } from '@/util/index';

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  session: {
    strategy: 'jwt'
  },
  // useSecureCookies: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    DiscordProvider({
      accessTokenUrl: process.env.DISCORD_ACCESS_TOKEN_URL!,
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!
    })
  ],
  pages: {
    signIn: '/'
  },

  callbacks: {
    async session({ session, token, user }) {
      const { db, client } = await connectToDatabase();

      if (session && session.user?.email) {
        const userInDb = await db.collection('users').findOne({ email: session.user.email });
        session.user = {
          ...session.user,
          ...userInDb
        };
      }
      return session;
    },
    async signIn({ account, profile }) {
      const { db, client } = await connectToDatabase();

      const user = await db
        .collection('users')
        .find({ email: profile?.email || '' })
        .toArray();

      if (!user.length) {
        await db.collection('users').insertOne({
          _id: account?.providerAccountId,
          username: retrieveUsernmeFromEmail(profile?.email!),
          email: profile?.email,
          fullName: profile?.name,
          avatar: (profile as any)['picture'],
          emailVerified: (profile as any)['email_verified'],
          role: 'Employee',
          company: 'Example'
        });
      }

      return true;
    }
  }
};

const handler: Function = NextAuth(authOptions);

export { handler as GET, handler as POST };
