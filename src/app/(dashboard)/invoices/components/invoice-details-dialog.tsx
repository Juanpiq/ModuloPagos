'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import type { InvoiceResponse } from '@/types/invoices';

export default function InvoiceDetailsDialog({
  id,
  open,
  onClose,
}: {
  id: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && id) {
      setLoading(true);
      fetch(`/api/invoices?id=${id}`)
        .then((res) => res.json())
        .then((data) => setInvoice(data))
        .finally(() => setLoading(false));
    }
  }, [open, id]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles de Factura</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>Cargando...</p>
        ) : invoice ? (
          <div className="space-y-2 text-sm">
            <p><strong>ID:</strong> {invoice.id}</p>
            <p><strong>Cliente:</strong> {invoice.cliente}</p>
            <p><strong>Monto Total:</strong> ${invoice.montoTotal}</p>
            <p><strong>Balance Restante:</strong> ${invoice.balanceRestante}</p>
            <p><strong>Actividad:</strong> {invoice.actividad}</p>
            <p><strong>Estado:</strong> {invoice.estado}</p>
            <p>
              <strong>Fecha de creación:</strong>{' '}
              {invoice.fecha
                ? new Date(invoice.fecha).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        ) : (
          <p>No se encontró la factura.</p>
        )}

        <div className="flex justify-end pt-3">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
