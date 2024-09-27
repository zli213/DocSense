import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/../lib/prisma";

export const options = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Invalid credentials");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) {
            throw new Error("No user found");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.userName,
            verified: true, //hard coding
            departmentId: user.departmentID,
            roleId: user.roleID,
          };
        } catch (error) {
          console.error("Authorize error:", error.message);
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    // The jwt callback is used to store the user's information in a token.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.verified = user.verified;
        token.departmentId = user.departmentId;
        token.roleId = user.roleId;
      }
      return token;
    },

    // Get the user information from the token and add it to the session.
    async session({ session, token }) {
      // console.log("Session:", session);
      // console.log("Token:", token);

      if (session?.user) {
        session.user.id = token.id;  // Get user id from token
        session.user.verified = token.verified;  // Get verified from token
        session.user.departmentId = token.departmentId;  // Get departmentId from token
        session.user.roleId = token.roleId;  // Get the roleId from the token
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    register: "/register",
  },
};
