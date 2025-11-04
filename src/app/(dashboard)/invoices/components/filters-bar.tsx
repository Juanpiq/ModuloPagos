// /app/(dashboard)/payments/components/filters-bar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useState } from 'react';

interface FiltersBarProps {
  filters: Record<string, string | null>;
  onChange: (filters: Record<string, string | null>) => void;
  activities: string[];
}

export function FiltersBar({ filters, onChange, activities }: FiltersBarProps) {
  const [selectedActivity, setSelectedActivity] = useState(filters.activity || '');
  const [search, setSearch] = useState('');

  const applyFilters = () => {
    onChange({ ...filters, activity: selectedActivity, search });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedActivity('');
    onChange({});
  };

  return (
    <div
      className="flex flex-wrap gap-3 items-end border p-4 rounded-lg bg-white shadow-sm"
      role="search"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Actividad</label>
        <Select
          value={selectedActivity}
          onValueChange={(v) => setSelectedActivity(v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            {activities.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Buscar</label>
        <Input
          type="text"
          placeholder="Nombre o ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar facturas"
        />
      </div>

      <Button onClick={applyFilters} className="ml-auto">
        Aplicar
      </Button>
      <Button variant="outline" onClick={clearFilters}>
        Limpiar
      </Button>
    </div>
  );
}
