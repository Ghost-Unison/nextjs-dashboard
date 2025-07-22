import SideNav from '@/app/ui/dashboard/sidenav'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

/*
开启PPR
Partial Prerendering 的伟大之处在于，您无需更改代码即可使用它。
只要你使用 Suspense 来包装路由的动态部分，Next.js 就会知道路由的哪些部分是静态的，哪些是动态的。
*/
export const experimental_ppr = true

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  )
}
