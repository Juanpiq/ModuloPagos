'use client';

import { EyeIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InvoiceResponse } from '@/types/invoices';

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
  isLoading,
}: PendingBalancesTableProps) {
  if (isLoading) {
    return <p className="text-center py-8 text-gray-500">Cargando balances...</p>;
  }

  if (!balances || balances.length === 0) {
    return (
      <p className="text-center py-8 text-gray-500">
        No hay facturas registradas aún.
      </p>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-[85%] rounded-lg shadow-sm border border-gray-200 bg-white">
        {/* Tabla desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table
            className="w-full border-collapse text-sm text-gray-700 table-fixed"
            aria-label="Tabla de saldos pendientes"
          >
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-center font-semibold w-[8%]">#Factura</th>
                <th className="p-3 text-center font-semibold w-[10%]">Cliente ID</th>
                <th className="p-3 text-center font-semibold w-[25%]">Cliente</th>
                <th className="p-3 text-center font-semibold w-[20%]">Balance</th>
                <th className="p-3 text-center font-semibold w-[20%]">Estado</th>
                <th className="p-3 text-center font-semibold w-[15%]">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {balances.map((f) => (
                <tr
                  key={f.id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-center">{f.id}</td>
                  <td className="p-3 text-center">{f.clienteId}</td>
                  <td className="p-3 text-center">{f.cliente}</td>
                  <td className="p-3 text-center font-medium tabular-nums">
                    ${f.balanceRestante.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        f.estado === 'Pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : f.estado === 'En Proceso'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {f.estado}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onViewDetails(f.id)}
                        aria-label={`Ver detalles de factura ${f.id}`}
                        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onPay(f.id)}
                        aria-label={`Adjuntar boleta a factura ${f.id}`}
                        className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <PaperClipIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards mobile */}
        <div className="grid gap-3 md:hidden mt-4 p-3">
          {balances.map((f) => (
            <Card
              key={f.id}
              className="p-4 flex flex-col gap-2 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between text-sm text-gray-500">
                <span>#Factura</span>
                <span className="font-semibold text-gray-800">{f.id}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>ID Cliente</span>
                <span>{f.clienteId}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Cliente</span>
                <span>{f.cliente}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Balance</span>
                <span className="font-semibold text-gray-800">
                  ${f.balanceRestante.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Estado</span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    f.estado === 'Pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : f.estado === 'En Proceso'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {f.estado}
                </span>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onViewDetails(f.id)}
                >
                  <EyeIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPay(f.id)}
                >
                  <PaperClipIcon className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
