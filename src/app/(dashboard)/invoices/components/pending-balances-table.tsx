'use client';

import { EyeIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { InvoiceResponse } from '@/types/invoices';

interface PendingBalancesTableProps {
  balances: InvoiceResponse[];
  onPay: (id: number) => void;
  onViewDetails: (id: number) => void;
  isLoading?: boolean;
}

export default function PendingBalancesTable({
  balances,
  onPay,
  onViewDetails,
  isLoading = false,
}: PendingBalancesTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-gray-500">Cargando facturas...</p>
      </div>
    );
  }

  if (!balances || balances.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-gray-500">No hay facturas registradas.</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-full max-w-6xl mx-auto">
        {/*desktop*/}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full border-collapse text-sm text-gray-800">
            <thead className="bg-gray-100">
              <tr className="text-center">
                <th className="p-3 w-20">#Factura</th>
                <th className="p-3 w-28">Cliente ID</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Actividad</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Fecha</th>
                <th className="p-3 w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => {
                const isPaid =
                  b.estado?.toLowerCase() === 'pagado' ||
                  b.estado?.toLowerCase() === 'completado';

                return (
                  <tr
                    key={b.id}
                    className="text-center border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">{b.id}</td>
                    <td className="p-3">{b.clienteId}</td>
                    <td className="p-3">{b.cliente}</td>
                    <td className="p-3">{b.actividad}</td>
                    <td className="p-3 font-medium">${b.balanceRestante.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          b.estado === 'Pagado'
                            ? 'bg-green-100 text-green-700'
                            : b.estado === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {b.estado}
                      </span>
                    </td>
                    <td className="p-3">
                      {b.fecha
                        ? new Date(b.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onViewDetails(b.id)}
                              aria-label={`Ver detalles de factura ${b.id}`}
                            >
                              <EyeIcon className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            Ver detalles de la factura
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => !isPaid && onPay(b.id)}
                              aria-label={`Adjuntar boleta para factura ${b.id}`}
                              disabled={isPaid}
                            >
                              <PaperClipIcon
                                className={`h-5 w-5 ${
                                  isPaid
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-gray-800'
                                }`}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {isPaid
                              ? 'Factura ya pagada'
                              : 'Adjuntar boleta de pago'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {balances.map((b) => {
            const isPaid =
              b.estado?.toLowerCase() === 'pagado' ||
              b.estado?.toLowerCase() === 'completado';

            return (
              <div
                key={b.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-800">Factura #{b.id}</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      b.estado === 'Pagado'
                        ? 'bg-green-100 text-green-700'
                        : b.estado === 'Pendiente'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {b.estado}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  Cliente: <span className="font-medium">{b.cliente}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Actividad: <span className="font-medium">{b.actividad}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Balance:{' '}
                  <span className="font-medium">${b.balanceRestante.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Fecha:{' '}
                  <span className="font-medium">
                    {b.fecha
                      ? new Date(b.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </span>
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onViewDetails(b.id)}
                        aria-label={`Ver detalles de factura ${b.id}`}
                      >
                        <EyeIcon className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Ver detalles de la factura
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => !isPaid && onPay(b.id)}
                        aria-label={`Adjuntar boleta para factura ${b.id}`}
                        disabled={isPaid}
                      >
                        <PaperClipIcon
                          className={`h-5 w-5 ${
                            isPaid
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {isPaid
                        ? 'Factura ya pagada'
                        : 'Adjuntar boleta de pago'}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
