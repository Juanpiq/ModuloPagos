'use client';

import { useEffect, useState } from 'react';
import type { PaymentResponse } from '@/types/payments';
import { PaymentsFilters } from './components/payments-filters';
import PaymentsTable from './components/payments-table';
import PaymentDetailsDialog from './components/payment-details-dialog';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string | null>>({});
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  const fetchPayments = async (filtersParam?: Record<string, string | null>) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      Object.entries(filtersParam ?? filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/payments?${params.toString()}`);
      if (!res.ok) throw new Error('Error al obtener pagos');
      const data: PaymentResponse[] = await res.json();
      setPayments(data);
    } catch (err) {
      console.error('Error cargando pagos:', err);
      toast.error('Error al cargar pagos');
    } finally {
      setIsLoading(false);
    }
  };

  // Llamado al cambiar filtros
  useEffect(() => {
    fetchPayments(filters);
  }, [filters]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/payments/status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? 'Error actualizando estado');
      }

      toast.success('Estado actualizado');
      await fetchPayments(filters);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Error al actualizar estado');
    }
  };

  return (
    <section className="p-6 space-y-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">💰 Historial de Pagos</h1>

      <PaymentsFilters onFilterChange={(newFilters) => setFilters(newFilters)} />

      <PaymentsTable
        payments={payments}
        isLoading={isLoading}
        onViewDetails={(id) => setSelectedPaymentId(id)}
        onStatusChange={handleStatusChange}
      />

      {selectedPaymentId && (
        <PaymentDetailsDialog
          id={selectedPaymentId}
          open={!!selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
        />
      )}
    </section>
  );
}
