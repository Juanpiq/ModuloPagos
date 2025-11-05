'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, FunnelIcon, XCircleIcon } from 'lucide-react';

type Props = { onFilterChange: (f: Record<string, string | null>) => void };

export function PaymentsFilters({ onFilterChange }: Props) {
  const [invoiceId, setInvoiceId] = useState<string>('');
  const [estado, setEstado] = useState<string>('all');
  const [range, setRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });

  //Aplica filtros
  const apply = () => {
    onFilterChange({
      facturaId: invoiceId || null,
      estado: estado === 'all' ? null : estado,
      from: range.from ? range.from.toISOString().split('T')[0] : null,
      to: range.to ? range.to.toISOString().split('T')[0] : null,
    });
  };

  //Limpia filtros
  const clear = () => {
    setInvoiceId('');
    setEstado('all');
    setRange({ from: null, to: null });
    onFilterChange({ facturaId: null, estado: null, from: null, to: null });
  };

  return (
    <div className="flex flex-wrap items-end gap-3 border p-3 rounded-lg bg-white shadow-sm">
      {/*ID Factura */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600">ID Factura</label>
        <Input
          placeholder="ID factura"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          className="w-40"
        />
      </div>

      {/*Estado */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600">Estado</label>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="En Proceso">En Proceso</SelectItem>
            <SelectItem value="Completado">Completado</SelectItem>
            <SelectItem value="Anulado">Anulado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/*Rango de fechas */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600">Fecha</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {range.from && range.to
                ? `${format(range.from, 'dd MMM yyyy', { locale: es })} - ${format(range.to, 'dd MMM yyyy', { locale: es })}`
                : 'Seleccionar rango'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="range"
              selected={range as any}
              onSelect={(v) => setRange({ from: v?.from ?? null, to: v?.to ?? null })}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Botones */}
      <div className="flex gap-2 ml-auto">
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={apply}>
          <FunnelIcon className="w-4 h-4 mr-2" /> Aplicar
        </Button>
        <Button variant="outline" onClick={clear}>
          <XCircleIcon className="w-4 h-4 mr-2 text-gray-600" /> Limpiar
        </Button>
      </div>
    </div>
  );
}
