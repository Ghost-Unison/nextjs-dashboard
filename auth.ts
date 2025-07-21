/* 
在为数据库设定种子时，您使用了一个名为 bcrypt 的包来对用户的密码进行哈希处理，然后再将其存储在数据库中。
在本章后面，您将再次使用它来比较用户输入的密码是否与数据库中的密码匹配。
但是，您需要为 bcrypt 包创建一个单独的文件。这是因为 bcrypt 依赖于 Next.js 中间件中不可用的 Node.js API。
*/
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import type { User } from '@/app/lib/definitions'
import bcrypt from 'bcrypt'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`
    return user[0]
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUser(email)
          if (!user) return null
          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) return user
        }

        return null
      },
    }),
  ],
})
