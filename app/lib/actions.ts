'use server'
/* 
不是标记服务器端组件，而是把文件中所有导出函数标记为Server Action。
然后其它客户端或者服务器端组件中就可以调用这些函数。
最后程序包中打包时，此文件中没有被使用的函数会被自动剔除。
*/
/*
在服务端组件中，在action中直接加use server然后直接写Server Action也可以
*/

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(), //从字符串强制转换为数字并验证其类型
  status: z.enum(['pending', 'paid']),
  date: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })
const UpdateInvoice = FormSchema.omit({ id: true, date: true })

export async function createInvoice(formData: FormData) {
  //从formData提取数据的方法有很多，.get ; 表单字段很多时，考虑entries
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })
  //print in terminal, not browser
  //console.log(rawFormData)

  //金额转换为分
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `
  } catch (error) {
    console.error(error)
  }

  /*
    Next.js 有一个客户端路由缓存，用于将路由段存储在用户的浏览器中一段时间。
    除了prefetch之外 ，此缓存还确保用户可以在路由之间快速导航，同时减少向服务器发出的请求数。

    由于您正在更新 invoices 路由中显示的数据，因此您需要清除此缓存并触发对服务器的新请求。您可以使用 Next.js 中的 revalidatePath 函数执行此作。
    
    此时更新数据库之后，将重新验证/dashboard/invoices 路由，并从服务器获取新数据
  */

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices') //redirect通过抛出error来工作，所以放在tryCatch之外
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })
  const amountInCents = amount * 100

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `
  } catch (error) {
    console.error(error)
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice')

  await sql`DELETE FROM invoices WHERE id = ${id}`
  revalidatePath('/dashboard/invoices')
  //点按钮是在/dashboard/invoices 所以不用重定向
}
