//客户端组件 - 可以使用event listeners和hooks
'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
//防抖
import { useDebouncedCallback } from 'use-debounce'

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  //绑定onChange事件，捕获用户输入
  //function handleSearch(term: string) {
  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching...${term}`)

    //URLSearhParams是一个WebAPI，它提供用于操作URL查询参数的实用工具方法
    const params = new URLSearchParams(searchParams)
    //搜索更新时将页码重置为1
    params.set('page', '1')
    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }
    //将当前路径替换为带查询参数的URL
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        // 确保input字段与URL同步，并在共享URL时填充input
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  )
}
