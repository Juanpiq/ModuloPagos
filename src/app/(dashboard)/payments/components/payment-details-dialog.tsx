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
  const [downloading, setDownloading] = useState(false);

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

  const formatFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDownload = async (id: number, nombre: string) => {
    try {
      setDownloading(true);
      const res = await fetch(`/api/payments/download/${id}/attachment`);
      if (!res.ok) throw new Error('Error al descargar archivo');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', nombre);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error al descargar el archivo');
    } finally {
      setDownloading(false);
    }
  };

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
            <p>
              <Label className="font-medium">Fecha:</Label>{' '}
              {data.fecha ? formatFecha(data.fecha) : '—'}
            </p>

            {data.archivoNombre && (
              <p>
                <Label className="font-medium">Archivo:</Label>{' '}
                <button
                  onClick={() => handleDownload(data.id, data.archivoNombre)}
                  disabled={downloading}
                  className={`text-blue-600 hover:underline ${downloading ? 'opacity-60' : ''}`}
                >
                  {downloading ? 'Descargando...' : `${data.archivoNombre}`}
                </button>
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
