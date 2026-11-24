import mongoose, { Schema, Document } from "mongoose";

export interface ICounter extends Document {
  name: string;
  sequence_value: number;
}

export const counterSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  sequence_value: {
    type: Number,
    default: 0,
  },
});

export const Counter = mongoose.model<ICounter>("Counter", counterSchema);

export const getNextSequenceValue = async (
  sequenceName: string
): Promise<number> => {
  const sequenceDocument = await Counter.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  return sequenceDocument.sequence_value;
};
