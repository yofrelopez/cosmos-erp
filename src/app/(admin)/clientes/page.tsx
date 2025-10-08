import ClientsTable from '@/components/clients/ClientsTable'
import AddClientModal from '@/components/clients/AddClientModal'

export default function ClientsPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>

      </div>

      <ClientsTable />
    </main>
  )
}
