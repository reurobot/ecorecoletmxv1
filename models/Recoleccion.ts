import mongoose, { Document, Schema } from 'mongoose';

export interface IRecoleccion extends Document {
  _id: string;
  choferId: string;
  choferNombre: string;
  camionId: string;
  localId: string;
  localNombre: string;
  contenedores: number;
  pago: boolean;
  formaPago?: string;
  cantidadCobrada?: number;
  status: 'pendiente' | 'en_proceso' | 'completado';
  fechaAsignacion: Date;
  fechaCompletado?: Date;
  creadoPor: string;
  qrConfirmadoPor?: string;
  qrConfirmadoEn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecoleccionSchema = new Schema<IRecoleccion>({
  choferId: { type: String, required: true },
  choferNombre: { type: String, required: true },
  camionId: { type: String, required: true },
  localId: { type: String, required: true },
  localNombre: { type: String, required: true },
  contenedores: { type: Number, required: true },
  pago: { type: Boolean, default: false },
  formaPago: { type: String, default: '' },
  cantidadCobrada: { type: Number, default: 0 },
  status: { type: String, enum: ['pendiente', 'en_proceso', 'completado'], default: 'completado' },
  fechaAsignacion: { type: Date, default: Date.now },
  fechaCompletado: { type: Date },
  creadoPor: { type: String, required: true },
  qrConfirmadoPor: { type: String, default: '' },
  qrConfirmadoEn: { type: Date },
}, { timestamps: true });

export const Recoleccion = mongoose.models.Recoleccion || mongoose.model<IRecoleccion>('Recoleccion', RecoleccionSchema);
