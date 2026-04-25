import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  color: string;
  label: string;
  owner: string;
  dueDate?: Date;
  reminder?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#f5d4d4',
  },
  label: {
    type: String,
    default: '',
  },
  dueDate: {
    type: Date,
  },
  reminder: {
    type: Date,
  },
  owner: {
    type: String,
    required: true,
    default: 'anonymous@kurripu.local',
  },
}, { timestamps: true });

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
export default Note;
