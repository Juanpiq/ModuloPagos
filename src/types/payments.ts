export interface PaymentResponse {
  id: number;
  facturaId: number;
  monto: number;
  fecha: string;
  estado: string;
  metodoPago: string;
  cliente: string;
  archivoNombre: string;
}
