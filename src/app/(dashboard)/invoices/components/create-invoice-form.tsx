'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// ✅ Esquema Zod (solo los 3 campos requeridos)
const invoiceSchema = z.object({
  clienteId: z.preprocess(
    (val) => Number(val),
    z.number().positive('Debe ser un número válido')
  ),
  montoTotal: z.preprocess(
    (val) => Number(val),
    z.number().positive('Debe ser mayor que 0')
  ),
  actividad: z.string().min(3, 'Debe tener al menos 3 caracteres'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function InvoiceForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      clienteId: undefined,
      montoTotal: undefined,
      actividad: '',
    },
  });

  const onSubmit = async (data: InvoiceFormData): Promise<void> => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Factura creada exitosamente ✅');
        reset();
        setOpen(false);
        onCreated();
      } else {
        const body = await res.json();
        toast.error(body.message || 'Error al crear factura ❌');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión con el servidor ⚠️');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          + Nueva Factura
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear nueva factura</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Cliente ID */}
          <div>
            <Label htmlFor="clienteId">ID del Cliente</Label>
            <Input
              id="clienteId"
              type="number"
              {...register('clienteId')}
              placeholder="Ej: 1"
            />
            {errors.clienteId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.clienteId.message}
              </p>
            )}
          </div>

          {/* Monto total */}
          <div>
            <Label htmlFor="montoTotal">Monto Total</Label>
            <Input
              id="montoTotal"
              type="number"
              step="0.01"
              {...register('montoTotal')}
              placeholder="Ej: 250.00"
            />
            {errors.montoTotal && (
              <p className="text-red-500 text-sm mt-1">
                {errors.montoTotal.message}
              </p>
            )}
          </div>

          {/* Actividad */}
          <div>
            <Label htmlFor="actividad">Actividad</Label>
            <Input
              id="actividad"
              {...register('actividad')}
              placeholder="Ej: Servicios, Suministros..."
            />
            {errors.actividad && (
              <p className="text-red-500 text-sm mt-1">
                {errors.actividad.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Creando...' : 'Crear Factura'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
