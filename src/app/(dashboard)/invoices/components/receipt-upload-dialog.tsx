'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

type Props = {
  facturaId: number | null;
  open: boolean;
  onClose: () => void;
  onUploaded?: () => void; // opcional: callback para refrescar listas
};

export default function ReceiptUploadDialog({ facturaId, open, onClose, onUploaded }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [monto, setMonto] = useState<string>('');
  const [estadoPagoId, setEstadoPagoId] = useState<string>(''); // '1' En Proceso, '2' Completado, '3' Anulado
  const [metodoPagoId, setMetodoPagoId] = useState<string>(''); // '1' Efectivo, '2' Transferencia, '3' Tarjeta, '4' Cheque
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoNombre, setArchivoNombre] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar balance cada vez que se abre el modal
  useEffect(() => {
    setError(null);
    setArchivo(null);
    setArchivoNombre('');
    setMonto('');
    setEstadoPagoId('');
    setMetodoPagoId('');
    setBalance(null);

    if (!open || !facturaId) return;

    (async () => {
      try {
        const res = await fetch(`/api/invoices?id=${facturaId}`);
        if (!res.ok) throw new Error('No se pudo obtener la factura');
        const data = await res.json();
        // data.balanceRestante debe venir como número
        setBalance(typeof data.balanceRestante === 'number' ? data.balanceRestante : Number(data.balanceRestante));
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el balance de la factura.');
      }
    })();
  }, [open, facturaId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setArchivo(null);
      setArchivoNombre('');
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo PDF, JPG o PNG.');
      setArchivo(null);
      setArchivoNombre('');
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setError('El archivo supera el tamaño permitido de 10MB.');
      setArchivo(null);
      setArchivoNombre('');
      return;
    }

    setArchivo(file);
    setArchivoNombre(file.name);
  };

  const validateBeforeSubmit = () => {
    setError(null);

    if (!facturaId) {
      setError('Factura inválida.');
      return false;
    }

    const m = Number(monto);
    if (isNaN(m) || m <= 0) {
      setError('El monto debe ser mayor a 0.');
      return false;
    }

    if (!estadoPagoId) {
      setError('Seleccione un estado del pago.');
      return false;
    }

    if (!metodoPagoId) {
      setError('Seleccione un método de pago.');
      return false;
    }

    if (!archivo) {
      setError('Adjunte un archivo (PDF/JPG/PNG).');
      return false;
    }

    // Si el pago no es "Anulado", validar que no exceda el balance disponible (si está disponible)
    if (balance !== null && estadoPagoId !== '3') {
      if (m > balance) {
        setError(`El monto no puede ser mayor al balance restante ($${balance.toFixed(2)}).`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;
    if (!facturaId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('monto', monto);
      formData.append('estadoPagoId', estadoPagoId);
      formData.append('metodoPagoId', metodoPagoId);
      if (archivo) formData.append('archivo', archivo);

      const res = await fetch(`/api/payments/${facturaId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.message ?? 'Error al subir la boleta';
        throw new Error(msg);
      }

      // éxito
      onClose();
      if (onUploaded) onUploaded();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Error al subir la boleta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjuntar boleta de pago</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-2 text-sm text-red-700 bg-red-100 p-2 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Balance actual */}
          <div>
            <Label className="font-medium">Balance restante</Label>
            <div className="mt-1">
              <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {balance === null ? 'Cargando...' : `$${balance.toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Monto a pagar */}
          <div>
            <Label htmlFor="monto">Monto a pagar</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej: 50.00"
              required
              className="mt-1"
            />
          </div>

          {/* Metodo de pago */}
          <div>
            <Label>Método de pago</Label>
            <Select onValueChange={setMetodoPagoId} value={metodoPagoId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                {/* Si quieres cargar dinámicamente, reemplaza estos items por datos de la API */}
                <SelectItem value="1">Efectivo</SelectItem>
                <SelectItem value="2">Transferencia</SelectItem>
                <SelectItem value="3">Tarjeta</SelectItem>
                <SelectItem value="4">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estado del pago */}
          <div>
            <Label>Estado del pago</Label>
            <Select onValueChange={setEstadoPagoId} value={estadoPagoId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">En Proceso</SelectItem>
                <SelectItem value="2">Completado</SelectItem>
                <SelectItem value="3">Anulado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Archivo */}
          <div>
            <Label htmlFor="archivo">Boleta (PDF/JPG/PNG) — máximo 10MB</Label>
            <Input
              id="archivo"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="mt-1"
              required
            />
            {archivoNombre && (
              <p className="text-sm text-gray-600 mt-1">
                Archivo seleccionado: <span className="font-medium">{archivoNombre}</span>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Subiendo...' : 'Subir boleta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
