'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, FunnelIcon } from 'lucide-react';

type FilterProps = {
  onFilterChange: (filters: Record<string, string | null>) => void;
};

export function Filters({ onFilterChange }: FilterProps) {
  const [clienteId, setClienteId] = useState('');
  const [estado, setEstado] = useState<string | null>(null);
  const [range, setRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  const applyFilters = () => {
    onFilterChange({
      clienteId: clienteId || null,
      estado: estado || null,
      from: range.from ? range.from.toISOString().split('T')[0] : null,
      to: range.to ? range.to.toISOString().split('T')[0] : null,
    });
  };

  const clearFilters = () => {
    setClienteId('');
    setEstado(null);
    setRange({ from: null, to: null });
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap items-end gap-4 bg-white border p-4 rounded-lg shadow-sm">
      {/* Cliente ID */}
      <div className="flex flex-col w-[160px]">
        <label htmlFor="clienteId" className="text-sm font-medium text-gray-600 mb-1">
          ID Cliente
        </label>
        <Input
          id="clienteId"
          type="number"
          placeholder="Ej: 1"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Estado */}
      <div className="flex flex-col w-[180px]">
        <label className="text-sm font-medium text-gray-600 mb-1">Estado</label>
        <Select onValueChange={setEstado} value={estado ?? ''}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="En Proceso">En Proceso</SelectItem>
            <SelectItem value="Pagado">Pagado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/*Rango de fechas */}
      <div className="flex flex-col w-[240px]">
        <label className="text-sm font-medium text-gray-600 mb-1">Rango de fechas</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal h-9"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range.from && range.to
                ? `${format(range.from, 'dd MMM yyyy', { locale: es })} - ${format(
                    range.to,
                    'dd MMM yyyy',
                    { locale: es }
                  )}`
                : 'Seleccionar rango'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range as any}
              onSelect={(value) =>
                setRange({
                  from: value?.from ?? null,
                  to: value?.to ?? null,
                })
              }
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Botones */}
      <div className="flex gap-2 ml-auto items-center">
        <Button variant="outline" onClick={clearFilters} className="h-9">
          Limpiar
        </Button>
        <Button
          onClick={applyFilters}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 h-9"
        >
          <FunnelIcon className="w-4 h-4" />
          Filtrar
        </Button>
      </div>
    </div>
  );
}
