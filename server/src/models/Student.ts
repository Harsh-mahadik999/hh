import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudent extends Document {
  studentId: string;
  name: string;
  branch: 'COMPS' | 'IT' | 'Data Engineering' | 'AIML';
  password: string;
  votedPositions: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const StudentSchema: Schema = new Schema(
  {
    studentId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    branch: {
      type: String,
      required: true,
      enum: ['COMPS', 'IT', 'Data Engineering', 'AIML'],
    },
    password: { type: String, required: true, minlength: 6 },
    votedPositions: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Hash password before save
StudentSchema.pre<IStudent>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

StudentSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IStudent>('Student', StudentSchema);
