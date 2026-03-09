import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  studentId: string;
  candidateId: mongoose.Types.ObjectId;
  position: string;
  timestamp: Date;
}

const VoteSchema: Schema = new Schema(
  {
    studentId: { type: String, required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    position: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate votes per student per position
VoteSchema.index({ studentId: 1, position: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema);
