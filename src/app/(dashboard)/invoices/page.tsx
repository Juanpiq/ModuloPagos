'use client';

import { useEffect, useState } from 'react';
import PendingBalancesTable from './components/pending-balances-table';
import InvoiceForm from './components/new-invoice-form'; // ✅ Import default, sin llaves
import type { InvoiceResponse } from '@/types/invoices';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener facturas desde la API
  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('Error al obtener facturas');
      const data: InvoiceResponse[] = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <section className="p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          📄 Saldos Pendientes
        </h1>

        {/* ✅ Usa el formulario directamente */}
        <InvoiceForm onCreated={fetchInvoices} />
      </div>

      {/* ✅ Tabla de facturas */}
      <PendingBalancesTable
        balances={invoices}
        onPay={(id) => alert(`Adjuntar boleta para factura ${id}`)}
        onViewDetails={(id) => alert(`Ver detalles de factura ${id}`)}
        isLoading={isLoading}
      />
    </section>
  );
}
