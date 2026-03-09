import 'dotenv/config';
import mongoose from 'mongoose';
import Student from './models/Student';
import Candidate from './models/Candidate';
import ElectionSettings from './models/ElectionSettings';

const candidates = [
  // President
  { name: 'Arjun Verma', position: 'President', branch: 'COMPS', description: '3rd year, passionate about student welfare' },
  { name: 'Meera Joshi', position: 'President', branch: 'IT', description: 'Tech enthusiast and leader' },
  { name: 'Rohan Desai', position: 'President', branch: 'AIML', description: 'Innovative thinker, community builder' },
  // Vice President
  { name: 'Simran Kapoor', position: 'Vice President', branch: 'COMPS', description: 'Dedicated to campus improvement' },
  { name: 'Nikhil Patil', position: 'Vice President', branch: 'IT', description: 'Active in college events' },
  // Technical Head
  { name: 'Ananya Singh', position: 'Technical Head', branch: 'AIML', description: 'Hackathon winner, coding club lead' },
  { name: 'Devraj Kumar', position: 'Technical Head', branch: 'Data Engineering', description: 'Full stack developer' },
  // PR Head
  { name: 'Pooja Rawat', position: 'Public Relations Head', branch: 'COMPS', description: 'Great communicator' },
  { name: 'Sameer Khan', position: 'Public Relations Head', branch: 'IT', description: 'Social media expert' },
  // Event Head
  { name: 'Riddhi Shah', position: 'Event Head', branch: 'AIML', description: 'Organized 10+ events' },
  { name: 'Kartik Mehta', position: 'Event Head', branch: 'COMPS', description: 'Energetic and creative' },
  // Hospitality Head
  { name: 'Neha Sharma', position: 'Hospitality Head', branch: 'IT', description: 'Friendly and welcoming' },
  // Social Media Head
  { name: 'Priyanka Das', position: 'Social Media Head', branch: 'AIML', description: 'Content creator with 5K followers' },
  { name: 'Akash Tiwari', position: 'Social Media Head', branch: 'COMPS', description: 'Digital marketing pro' },
  // Cultural Head
  { name: 'Shreya Iyer', position: 'Cultural Head', branch: 'IT', description: 'Classical dancer and event planner' },
  { name: 'Varun Bose', position: 'Cultural Head', branch: 'AIML', description: 'Music and theatre enthusiast' },
  // Executive Members
  { name: 'Tushar Ahuja', position: 'Executive Member - COMPS', branch: 'COMPS', description: 'Class representative 2 years' },
  { name: 'Pallavi Reddy', position: 'Executive Member - IT', branch: 'IT', description: 'Active volunteer' },
  { name: 'Mohit Sinha', position: 'Executive Member - Data Engineering', branch: 'Data Engineering', description: 'Department ambassador' },
  { name: 'Deepika Nair', position: 'Executive Member - AIML', branch: 'AIML', description: 'Research enthusiast' },
];

const students = [
  { studentId: 'COMPS001', name: 'Aditya Sharma', branch: 'COMPS', password: 'pass1234' },
  { studentId: 'COMPS002', name: 'Priya Patel', branch: 'COMPS', password: 'pass1234' },
  { studentId: 'IT001', name: 'Rahul Gupta', branch: 'IT', password: 'pass1234' },
  { studentId: 'IT002', name: 'Sneha Mehta', branch: 'IT', password: 'pass1234' },
  { studentId: 'DE001', name: 'Vikram Singh', branch: 'Data Engineering', password: 'pass1234' },
  { studentId: 'AIML001', name: 'Harsh Mahadik', branch: 'AIML', password: 'pass1234' },
  { studentId: 'AIML002', name: 'Kavya Nair', branch: 'AIML', password: 'pass1234' },
];

// Called from app.ts on startup — seeds only when DB is empty (safe to call every restart)
export const seedData = async (): Promise<void> => {
  const existing = await ElectionSettings.countDocuments();
  if (existing > 0) {
    console.log('ℹ️  Database already seeded — skipping');
    return;
  }
  console.log('🌱 Seeding database...');

  await ElectionSettings.create({
    adminUsername: 'admin',
    adminPassword: 'admin123',
    isVotingActive: true,
    votingStartTime: new Date(),
    votingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await Student.insertMany(students);
  await Candidate.insertMany(candidates);

  console.log('✅ Seeded: 1 admin, ' + students.length + ' students, ' + candidates.length + ' candidates');
};

// Called via `npm run seed` (standalone)
const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college-voting');
  await Student.deleteMany({});
  await Candidate.deleteMany({});
  await ElectionSettings.deleteMany({});
  await seedData();
  console.log('\n🎉 Database seeded! Admin: admin/admin123 | Student: AIML001/pass1234');
  process.exit(0);
};

if (require.main === module) {
  seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}

