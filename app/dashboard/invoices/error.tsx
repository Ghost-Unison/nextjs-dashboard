'use client'
/*
是客户端组件 
统一处理未捕获的异常
error.tsx 文件可用于定义路由段的 UI 边界。它用作意外错误的 catch-all，并允许您向用户显示回退 UI
*/

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Attempt to recover by trying to re-render the invoices route - 回退到/invoices 因为error.tsx在invoice下
          () => reset()
        }
      >
        Try again
      </button>
    </main>
  )
}
