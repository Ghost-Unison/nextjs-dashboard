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

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }), //从字符串强制转换为数字并验证其类型
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })
const UpdateInvoice = FormSchema.omit({ id: true, date: true })

export type State = {
  errors?: {
    customerId?: string[]
    amount?: string[]
    status?: string[]
  }
  message?: string | null
}

export async function createInvoice(prevState: State, formData: FormData) {
  //从formData提取数据的方法有很多，.get ; 表单字段很多时，考虑entries
  //Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })
  //print in terminal, not browser
  //console.log(rawFormData)

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    }
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data
  const amountInCents = amount * 100 //金额转换为分
  const date = new Date().toISOString().split('T')[0]

  // Insert data into the database
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `
  } catch (error) {
    //console.error(error)
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    }
  }

  /*
    Next.js 有一个客户端路由缓存，用于将路由段存储在用户的浏览器中一段时间。
    除了prefetch之外 ，此缓存还确保用户可以在路由之间快速导航，同时减少向服务器发出的请求数。

    由于您正在更新 invoices 路由中显示的数据，因此您需要清除此缓存并触发对服务器的新请求。您可以使用 Next.js 中的 revalidatePath 函数执行此作。
    
    此时更新数据库之后，将重新验证/dashboard/invoices 路由，并从服务器获取新数据
  */

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices') //redirect通过抛出error来工作，所以放在tryCatch之外
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    }
  }
  const { customerId, amount, status } = validatedFields.data
  const amountInCents = amount * 100

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `
  } catch (error) {
    //console.error(error)
    return {
      message: 'Database Error: Failed to Create Invoice.',
    }
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string) {
  //throw new Error('Failed to Delete Invoice')

  await sql`DELETE FROM invoices WHERE id = ${id}`
  revalidatePath('/dashboard/invoices')
  //点按钮是在/dashboard/invoices 所以不用重定向
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}
