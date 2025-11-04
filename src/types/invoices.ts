export interface InvoiceRequest {
  clienteId: number;
  montoTotal: number;
  actividad: string;
}

export interface InvoiceResponse {
  id: number;
  clienteId: number;
  cliente: string;
  montoTotal: number;
  balanceRestante: number;
  estado?: string;
  actividad: string;
}
