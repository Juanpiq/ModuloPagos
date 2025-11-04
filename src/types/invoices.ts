export interface InvoiceRequest {
  clienteId: number;
  montoTotal: number;
  balanceRestante: number;
  estadoFacturaId?: number;
  actividad: string;
}

export interface InvoiceResponse {
  id: number;
  cliente: string;
  montoTotal: number;
  balanceRestante: number;
  estado?: string;
  actividad: string;
}