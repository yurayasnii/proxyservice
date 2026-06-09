import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/models/User'
import { generateReferralCode } from '@/lib/utils/auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      checks: ['state'],
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false
      const provider = account?.provider ?? 'unknown'
      try {
        await connectDB()
        const existing = await User.findOne({ email: user.email.toLowerCase() })
        if (!existing) {
          const base = (user.name?.replace(/[^a-z0-9]/gi, '').toLowerCase() ?? user.email.split('@')[0]).slice(0, 16)
          const username = `${base}_${Math.random().toString(36).slice(2, 6)}`
          await User.create({
            email: user.email.toLowerCase(),
            username,
            avatarUrl: user.image ?? undefined,
            role: 'user',
            referralCode: generateReferralCode(),
            emailVerified: true,
            oauthProviders: [provider],
          })
        } else {
          const set: Record<string, unknown> = {}
          if (user.image) set.avatarUrl = user.image
          await User.updateOne(
            { _id: existing._id },
            {
              ...(Object.keys(set).length ? { $set: set } : {}),
              $addToSet: { oauthProviders: provider },
            }
          )
        }
        return true
      } catch (err) {
        console.error('[OAuth signIn error]', err)
        return false
      }
    },

    async jwt({ token, account, user }) {
      if (account && user?.email) {
        try {
          await connectDB()
          const dbUser = await User.findOne({ email: user.email.toLowerCase() })
          if (dbUser) {
            token.userId = dbUser._id.toString()
            token.role = dbUser.role
            token.email = dbUser.email
          }
        } catch (err) {
          console.error('[jwt callback error]', err)
        }
      }
      return token
    },

    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string
        session.user.role = (token.role as string) ?? 'user'
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
})
