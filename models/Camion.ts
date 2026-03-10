import mongoose, { Document, Schema } from 'mongoose';

export interface ICamion extends Document {
  _id: string;
  placa: string;
  marca: string;
  costo: string;
  capacidad: string;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
}

const CamionSchema = new Schema<ICamion>({
  placa: { type: String, required: true },
  marca: { type: String, required: true },
  costo: { type: String, required: true },
  capacidad: { type: String, required: true },
  estado: { type: String, required: true },
}, { timestamps: true });

export const Camion = mongoose.models.Camion || mongoose.model<ICamion>('Camion', CamionSchema);
