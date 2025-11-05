'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { PaymentResponse } from '@/types/payments';

type Props = {
  id: number;
  open: boolean;
  onClose: () => void;
};

export default function PaymentDetailsDialog({ id, open, onClose }: Props) {
  const [data, setData] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/payments?id=${id}`);
        if (!res.ok) throw new Error('No se pudo cargar el pago');
        const pagos = await res.json();
        const pago = Array.isArray(pagos) ? pagos.find((p: any) => p.id === id) : pagos;
        setData(pago ?? null);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, id]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles del Pago</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>Cargando...</p>
        ) : data ? (
          <div className="space-y-3 text-sm">
            <p><Label className="font-medium">Pago ID:</Label> {data.id}</p>
            <p><Label className="font-medium">Factura ID:</Label> {data.facturaId}</p>
            <p><Label className="font-medium">Cliente:</Label> {data.cliente}</p>
            <p><Label className="font-medium">Monto:</Label> ${data.monto.toFixed(2)}</p>
            <p><Label className="font-medium">Método:</Label> {data.metodoPago}</p>
            <p><Label className="font-medium">Estado:</Label> {data.estado}</p>
            <p><Label className="font-medium">Fecha:</Label> {data.fecha ? new Date(data.fecha).toLocaleString('es-ES') : '—'}</p>
            {data.archivoNombre && (
              <p>
                <Label className="font-medium">Archivo:</Label>{' '}
                <a href={`/api/payments/download/${data.id}/attachment`} target="_blank" className="text-blue-600 hover:underline">
                  {data.archivoNombre}
                </a>
              </p>
            )}
          </div>
        ) : (
          <p>No se encontró el pago.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
