import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IEventsRegistration extends Document {
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  position: string;
  ticketQuantity: number;
  eventId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventsRegistrationSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    school: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    ticketQuantity: {
      type: Number,
      default: 1,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create unique index on email and eventId combination
EventsRegistrationSchema.index({ email: 1, eventId: 1 }, { unique: true });

const EventsRegistration: Model<IEventsRegistration> =
  mongoose.models.EventsRegistration || mongoose.model<IEventsRegistration>('EventsRegistration', EventsRegistrationSchema);

export default EventsRegistration;
