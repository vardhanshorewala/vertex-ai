import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env";
import { generateId } from "./utils";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  walletId?: string; // Reference to their custodial wallet
}

// Helper functions for JSON storage
async function getUsers(): Promise<AuthUser[]> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const usersPath = path.join(process.cwd(), 'src/data/users.json');
    const data = await fs.readFile(usersPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function storeUsers(users: AuthUser[]): Promise<void> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const usersPath = path.join(process.cwd(), 'src/data/users.json');
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(usersPath), { recursive: true });
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error storing users:', error);
  }
}

async function createUser(user: { email: string; name: string; image?: string }): Promise<AuthUser> {
  const users = await getUsers();
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === user.email);
  if (existingUser) {
    return existingUser;
  }

  const newUser: AuthUser = {
    id: generateId('user'),
    email: user.email,
    name: user.name,
    image: user.image,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  await storeUsers(users);
  return newUser;
}

async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const users = await getUsers();
  return users.find(user => user.email === email) || null;
}

export async function updateUserWallet(userId: string, walletId: string): Promise<void> {
  console.log('updateUserWallet called:', { userId, walletId });
  
  const users = await getUsers();
  console.log('Current users:', users.map(u => ({ id: u.id, email: u.email, walletId: u.walletId })));
  
  const userIndex = users.findIndex(user => user.id === userId);
  console.log('User index found:', userIndex);
  
  if (userIndex !== -1) {
    users[userIndex]!.walletId = walletId;
    users[userIndex]!.updatedAt = new Date().toISOString();
    await storeUsers(users);
    console.log('User updated successfully:', { userId, walletId });
  } else {
    console.error('User not found for wallet update:', { userId, availableUserIds: users.map(u => u.id) });
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        try {
          // Create or get existing user
          await createUser({
            email: profile.email,
            name: profile.name || user.name || '',
            image: (profile as any).picture || user.image,
          });
          return true;
        } catch (error) {
          console.error('Error creating user:', error);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, user, account }) {
      // If this is the initial sign-in, get user data
      if (user?.email) {
        const dbUser = await getUserByEmail(user.email);
        if (dbUser) {
          token.userId = dbUser.id;
          token.walletId = dbUser.walletId;
          console.log('JWT: User found on sign-in:', { userId: dbUser.id, hasWallet: !!dbUser.walletId });
        }
      }
      
      // If we don't have userId but have email, fetch it
      if (!token.userId && token.email) {
        const dbUser = await getUserByEmail(token.email);
        if (dbUser) {
          token.userId = dbUser.id;
          token.walletId = dbUser.walletId;
          console.log('JWT: User found on refresh:', { userId: dbUser.id, hasWallet: !!dbUser.walletId });
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        (session as any).userId = token.userId;
        (session as any).walletId = token.walletId;
        
        // Get fresh user data
        const dbUser = await getUserByEmail(session.user.email!);
        if (dbUser) {
          (session as any).walletId = dbUser.walletId;
          console.log('Session: Fresh wallet data loaded:', { userId: dbUser.id, hasWallet: !!dbUser.walletId });
        }
      }
      
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}; 