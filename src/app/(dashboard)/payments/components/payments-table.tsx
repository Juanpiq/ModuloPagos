'use client';

import { EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { PaymentResponse } from '@/types/payments';

interface Props {
  payments: PaymentResponse[];
  isLoading?: boolean;
  onViewDetails: (id: number) => void;
  onStatusChange: (id: number, newStatus: string) => void;
}

export default function PaymentsTable({
  payments,
  isLoading = false,
  onViewDetails,
  onStatusChange,
}: Props) {
  const handleDownload = async (id: number, nombre: string) => {
    try {
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
      alert('Error al descargar archivo');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-gray-500">Cargando pagos...</p>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-gray-500">No hay pagos registrados.</p>
      </div>
    );
  }

  const estadoColor = (estado: string) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-700';
      case 'En Proceso':
        return 'bg-yellow-100 text-yellow-700';
      case 'Anulado':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full border-collapse text-sm text-gray-800">
          <thead className="bg-gray-100 text-center">
            <tr>
              <th className="p-3 w-20">#Pago</th>
              <th className="p-3">Factura</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Método de Pago</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Archivo</th>
              <th className="p-3 w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr
                key={p.id}
                className={`text-center border-b transition-colors ${
                  p.estado === 'Anulado' ? 'bg-gray-50 opacity-80' : 'hover:bg-gray-50'
                }`}
              >
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.facturaId}</td>
                <td className="p-3">{p.cliente}</td>
                <td className="p-3 font-medium">${p.monto.toFixed(2)}</td>
                <td className="p-3">{p.metodoPago}</td>
                <td className="p-3">
                  <div className="inline-block">
                    <Select value={p.estado} onValueChange={(v) => onStatusChange(p.id, v)}>
                      <SelectTrigger className={`text-xs font-semibold ${estadoColor(p.estado)} px-3 py-1 rounded-full`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="En Proceso">En Proceso</SelectItem>
                        <SelectItem value="Completado">Completado</SelectItem>
                        <SelectItem value="Anulado">Anulado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </td>
                <td className="p-3">
                  {p.archivoNombre ? (
                    <button
                      onClick={() => handleDownload(p.id, p.archivoNombre)}
                      className="text-blue-600 hover:underline"
                    >
                      {p.archivoNombre}
                    </button>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(p.id)}
                      aria-label={`Ver detalles del pago ${p.id}`}
                      title="Ver detalles del pago"
                    >
                      <EyeIcon className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {payments.map((p) => (
          <div
            key={p.id}
            className={`border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 ${
              p.estado === 'Anulado' ? 'bg-gray-50 opacity-80' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">Pago #{p.id}</p>
                <p className="text-sm text-gray-600">Factura: #{p.facturaId}</p>
                <p className="text-sm text-gray-600">Cliente: {p.cliente}</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-medium">${p.monto.toFixed(2)}</p>
                <div className={`mt-2 px-2 py-1 rounded-full text-xs font-semibold ${estadoColor(p.estado)}`}>
                  {p.estado}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">Método: {p.metodoPago}</p>

            <div className="flex items-center justify-between gap-2">
              {p.archivoNombre ? (
                <button
                  onClick={() => handleDownload(p.id, p.archivoNombre)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {p.archivoNombre}
                </button>
              ) : (
                <span className="text-sm text-gray-400">Sin archivo</span>
              )}

              <div className="flex items-center gap-2">
                <Select value={p.estado} onValueChange={(v) => onStatusChange(p.id, v)}>
                  <SelectTrigger className="text-xs px-3 py-1 rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Anulado">Anulado</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" onClick={() => onViewDetails(p.id)} aria-label={`Ver ${p.id}`}>
                  <EyeIcon className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
