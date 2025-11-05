'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PendingBalancesTable from './components/pending-balances-table';
import InvoiceForm from './components/new-invoice-form';
import InvoiceDetailsDialog from './components/invoice-details-dialog';
import type { InvoiceResponse } from '@/types/invoices';
import { Filters } from './components/filters-bar';
import ReceiptUploadDialog from './components/receipt-upload-dialog';
import { Button } from '@/components/ui/button';
import { CreditCardIcon } from 'lucide-react';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<number | null>(null);
  const [filters, setFilters] = useState<Record<string, string | null>>({});

  const fetchInvoices = async (filtersParam?: Record<string, string | null>) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      Object.entries(filtersParam ?? filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (!res.ok) throw new Error('Error al obtener facturas');
      const data: InvoiceResponse[] = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error('Error cargando facturas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(filters);
  }, [filters]);

  return (
    <section className="p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📄 Saldos Pendientes</h1>
        <div className="flex gap-2">
          {/*Botón para ir al historial de pagos */}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push('/payments')}
          >
            <CreditCardIcon className="w-4 h-4" />
            Historial de Pagos
          </Button>

          {/*refresca tabla al crear factura*/}
          <InvoiceForm onCreated={() => fetchInvoices(filters)} />
        </div>
      </div>

      {/* Barra de filtros */}
      <Filters onFilterChange={(newFilters) => setFilters(newFilters)} />

      {/*Tabla de facturas */}
      <PendingBalancesTable
        balances={invoices}
        onPay={(id) => setSelectedInvoiceForPayment(id)}
        onViewDetails={(id) => setSelectedInvoiceId(id)}
        isLoading={isLoading}
      />

      {/*Modal para subir comprobante */}
      {selectedInvoiceForPayment && (
        <ReceiptUploadDialog
          facturaId={selectedInvoiceForPayment}
          open={!!selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          onUploaded={() => fetchInvoices(filters)} 
        />
      )}

      {/* Modal de detalles */}
      {selectedInvoiceId && (
        <InvoiceDetailsDialog
          id={selectedInvoiceId}
          open={!!selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </section>
  );
}
