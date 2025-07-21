import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  //指定自定义登录、注销和错误页面的路由
  pages: {
    signIn: '/login',
  },
  callbacks: {
    //authorized回调用于验证请求是否有权访问具有 Next.js 中间件的页面。它在请求完成之前调用，并接收具有 auth 和 request 属性的对象。
    // auth 属性包含用户的session，request 属性包含传入请求。
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
