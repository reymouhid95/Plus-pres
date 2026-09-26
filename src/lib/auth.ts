import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { guestSchema, normalizeCode } from "@/lib/validation";
import { canAddMember, duoForCode } from "@/lib/duo";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      id: "guest",
      name: "Invité",
      credentials: {
        displayName: { label: "Pseudo", type: "text" },
        code: { label: "Code", type: "text" },
      },
      // Auth progressive (§29) : un pseudo + code valide créent un joueur invité.
      // Le compte est créé sans email ni mot de passe (`isGuest`), convertible
      // ensuite via /api/auth/upgrade sans changer d'user.id.
      async authorize(credentials) {
        const parsed = guestSchema.safeParse({
          displayName: credentials?.displayName,
          code: credentials?.code,
        });
        if (!parsed.success || !parsed.data.code) return null;

        const code = normalizeCode(parsed.data.code);
        const duo = await duoForCode(code);
        if (!duo) return null;

        // Vérifier que le duo a de la place
        const check = canAddMember(duo.memberUserIds, "placeholder");
        if (!check.ok) return null;

        const user = await db.user.create({
          data: { displayName: parsed.data.displayName, isGuest: true },
        });
        return { id: user.id, name: user.displayName };
      },
    }),
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        // Les joueurs invités (Phase B) n'ont pas de mot de passe : pas de login par identifiants.
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.avatarEmoji,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.uid;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
