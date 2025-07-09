import RevenueChart from '@/app/ui/dashboard/revenue-chart'
import LatestInvoices from '@/app/ui/dashboard/latest-invoices'
import { lusitana } from '@/app/ui/fonts'
import { Suspense } from 'react'
import { RevenueChartSkeleton, LatestInvoicesSkeleton, CardsSkeleton } from '@/app/ui/skeletons'
import CardWrapper from '@/app/ui/dashboard/cards'

//异步服务端组件，支持异步获取
export default async function Page() {
  //请求瀑布流
  //使用动态渲染时，应用程序的速度取决于最慢的那一次数据获取的速度
  //const revenue = await fetchRevenue()//此方法中模拟耗时请求
  //const latestInvoices = await fetchLatestInvoices()
  //const { totalPaidInvoices, totalPendingInvoices, numberOfInvoices, numberOfCustomers } = await fetchCardData()
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          {/* 将4个卡片分组wrapper,以免分别使用Suspense包裹时出现分别弹出导致不美观 */}
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  )
}
