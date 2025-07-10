import Form from '@/app/ui/invoices/edit-form'
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs'
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  //获取路由中的invoice.id
  const params = await props.params
  const id = params.id
  //根据id来获取内容，预填充edit表单
  const [invoice, customers] = await Promise.all([fetchInvoiceById(id), fetchCustomers()])

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
