import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  maxSeats: number;
  program: string;
  /** When false, event is hidden from public pages and registration is blocked. Omitted on legacy documents (treated as active). */
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    maxSeats: {
      type: Number,
      required: true,
    },
    program: {
      type: String,
      default: 'No-AdultEd',
      enum: ['AdultEd', 'No-AdultEd'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

/** Public listings: include active events and legacy docs without `isActive` set. */
export const activeEventFilter = { isActive: { $ne: false } as const };

export default Event;
