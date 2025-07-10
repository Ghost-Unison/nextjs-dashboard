import Form from '@/app/ui/invoices/edit-form'
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs'
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data'
import { notFound } from 'next/navigation'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  //获取路由中的invoice.id
  const params = await props.params
  const id = params.id
  //根据id来获取内容，预填充edit表单
  const [invoice, customers] = await Promise.all([fetchInvoiceById(id), fetchCustomers()])

  if (!invoice) {
    //not-found优先于error.tsx，因此想要处理更具体的错误时，可以使用not-found
    notFound()
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  )
}
