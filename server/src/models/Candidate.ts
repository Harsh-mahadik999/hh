import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidate extends Document {
  name: string;
  position: string;
  branch: string;
  description: string;
  imageUrl: string;
  votes: number;
}

const POSITIONS = [
  'President',
  'Vice President',
  'Technical Head',
  'Public Relations Head',
  'Event Head',
  'Hospitality Head',
  'Social Media Head',
  'Cultural Head',
  'Executive Member - COMPS',
  'Executive Member - IT',
  'Executive Member - Data Engineering',
  'Executive Member - AIML',
];

const CandidateSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, enum: POSITIONS },
    branch: {
      type: String,
      enum: ['COMPS', 'IT', 'Data Engineering', 'AIML', 'All'],
      default: 'All',
    },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    votes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const POSITION_LIST = POSITIONS;
export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
