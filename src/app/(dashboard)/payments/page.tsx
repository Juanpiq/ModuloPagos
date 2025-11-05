'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileTextIcon } from 'lucide-react';
import PaymentsTable from './components/payments-table';
import { PaymentsFilters } from './components/payments-filters';
import type { PaymentResponse } from '@/types/payments';
import PaymentDetailsDialog from './components/payment-details-dialog';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [filters, setFilters] = useState<Record<string, string | null>>({});

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(filters);
  }, [filters]);

  const estadoNombreToId = (nombre: string): number => {
    switch (nombre) {
      case 'En Proceso':
        return 1;
      case 'Completado':
        return 2;
      case 'Anulado':
        return 3;
      default:
        return 1;
    }
  };

  //Función para actualizar estado del pago
  const handleStatusChange = async (id: number, newEstado: string) => {
    try {
      const res = await fetch(`/api/payments/status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoPagoId: estadoNombreToId(newEstado) }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Error al cambiar estado');
        return;
      }

      toast.success('Estado actualizado correctamente');
      fetchPayments(filters);
    } catch (err) {
      console.error('Error actualizando estado:', err);
      toast.error('Error de conexión al actualizar el estado');
    }
  };

  return (
    <section className="p-6 space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">💳 Historial de Pagos</h1>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => router.push('/invoices')}
        >
          <FileTextIcon className="w-4 h-4" />
          Ver Facturas
        </Button>
      </div>

      {/* Barra de filtros */}
      <PaymentsFilters onFilterChange={(newFilters) => setFilters(newFilters)} />

      {/* Tabla */}
      <PaymentsTable
        payments={payments}
        onViewDetails={(id) => setSelectedPaymentId(id)}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
      />

      {/* Modal de detalles */}
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
