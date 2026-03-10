import mongoose, { Document, Schema } from 'mongoose';

export interface ILocal extends Document {
  _id: string;
  nombreNegocio: string;
  nombrePropietario: string;
  direccion: string;
  telefono: string;
  contenedores: string;
  qrUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocalSchema = new Schema<ILocal>({
  nombreNegocio: { type: String, required: true },
  nombrePropietario: { type: String, required: true },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
  contenedores: { type: String, required: true },
  qrUrl: { type: String, default: '' },
}, { timestamps: true });

export const Local = mongoose.models.Local || mongoose.model<ILocal>('Local', LocalSchema);
