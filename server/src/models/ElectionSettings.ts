import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IElectionSettings extends Document {
  votingStartTime: Date | null;
  votingEndTime: Date | null;
  isVotingActive: boolean;
  adminUsername: string;
  adminPassword: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const ElectionSettingsSchema: Schema = new Schema(
  {
    votingStartTime: { type: Date, default: null },
    votingEndTime: { type: Date, default: null },
    isVotingActive: { type: Boolean, default: false },
    adminUsername: { type: String, required: true },
    adminPassword: { type: String, required: true },
  },
  { timestamps: true }
);

ElectionSettingsSchema.pre<IElectionSettings>('save', async function (next) {
  if (!this.isModified('adminPassword')) return next();
  const salt = await bcrypt.genSalt(10);
  this.adminPassword = await bcrypt.hash(this.adminPassword, salt);
  next();
});

ElectionSettingsSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.adminPassword);
};

export default mongoose.model<IElectionSettings>('ElectionSettings', ElectionSettingsSchema);
