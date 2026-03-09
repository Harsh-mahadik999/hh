/**
 * College Internal Voting System — Standalone Server
 * Node.js + Express only. No database. All data is in-memory.
 * Run: node server.js
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'college_voting_demo_secret';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

// ─────────────────────────────────────────────────────────────
//  IN-MEMORY DEMO DATA
// ─────────────────────────────────────────────────────────────

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

// Admin
const ADMIN = { username: 'admin', password: 'admin123' };

// Election settings (mutable)
let electionSettings = {
  isVotingActive: true,
  votingStartTime: new Date().toISOString(),
  votingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

// Students
const students = [
  { id: 's1', studentId: 'AIML001', name: 'Harsh Mahadik',     branch: 'AIML',             password: 'pass1234', votedPositions: [] },
  { id: 's2', studentId: 'AIML002', name: 'Kavya Nair',        branch: 'AIML',             password: 'pass1234', votedPositions: [] },
  { id: 's3', studentId: 'COMPS001',name: 'Aditya Sharma',     branch: 'COMPS',            password: 'pass1234', votedPositions: [] },
  { id: 's4', studentId: 'COMPS002',name: 'Priya Patel',       branch: 'COMPS',            password: 'pass1234', votedPositions: [] },
  { id: 's5', studentId: 'IT001',   name: 'Rahul Gupta',       branch: 'IT',               password: 'pass1234', votedPositions: [] },
  { id: 's6', studentId: 'IT002',   name: 'Sneha Mehta',       branch: 'IT',               password: 'pass1234', votedPositions: [] },
  { id: 's7', studentId: 'DE001',   name: 'Vikram Singh',      branch: 'Data Engineering', password: 'pass1234', votedPositions: [] },
  { id: 's8', studentId: 'AIML003', name: 'Riya Desai',        branch: 'AIML',             password: 'pass1234', votedPositions: [] },
  { id: 's9', studentId: 'IT003',   name: 'Arjun Malhotra',    branch: 'IT',               password: 'pass1234', votedPositions: [] },
  { id: 's10',studentId: 'COMPS003',name: 'Pooja Shetty',      branch: 'COMPS',            password: 'pass1234', votedPositions: [] },
];

// Candidates with pre-filled realistic demo votes
let candidates = [
  // President
  { _id: 'c1',  name: 'Arjun Verma',      position: 'President',                       branch: 'COMPS',            description: '3rd year, passionate about student welfare and campus growth.', votes: 14 },
  { _id: 'c2',  name: 'Meera Joshi',       position: 'President',                       branch: 'IT',               description: 'Tech enthusiast with strong leadership experience.', votes: 11 },
  { _id: 'c3',  name: 'Rohan Desai',       position: 'President',                       branch: 'AIML',             description: 'Innovative thinker and community builder with 2 years of event experience.', votes: 9 },
  // Vice President
  { _id: 'c4',  name: 'Simran Kapoor',     position: 'Vice President',                  branch: 'COMPS',            description: 'Dedicated to improving campus facilities and student experience.', votes: 18 },
  { _id: 'c5',  name: 'Nikhil Patil',      position: 'Vice President',                  branch: 'IT',               description: 'Active in college events, strong coordination skills.', votes: 13 },
  // Technical Head
  { _id: 'c6',  name: 'Ananya Singh',      position: 'Technical Head',                  branch: 'AIML',             description: 'Hackathon winner, coding club lead, full-stack developer.', votes: 21 },
  { _id: 'c7',  name: 'Devraj Kumar',      position: 'Technical Head',                  branch: 'Data Engineering', description: 'Open source contributor, 3 internships in top tech firms.', votes: 16 },
  // PR Head
  { _id: 'c8',  name: 'Pooja Rawat',       position: 'Public Relations Head',           branch: 'COMPS',            description: 'Great communicator, managed college newsletter for 2 years.', votes: 19 },
  { _id: 'c9',  name: 'Sameer Khan',       position: 'Public Relations Head',           branch: 'IT',               description: 'Digital marketing expert, grew college social media to 10K.', votes: 12 },
  // Event Head
  { _id: 'c10', name: 'Riddhi Shah',       position: 'Event Head',                      branch: 'AIML',             description: 'Organized 10+ inter-college events, excellent at logistics.', votes: 17 },
  { _id: 'c11', name: 'Kartik Mehta',      position: 'Event Head',                      branch: 'COMPS',            description: 'Energetic and creative, spearheaded Techfest 2025.', votes: 14 },
  // Hospitality Head
  { _id: 'c12', name: 'Neha Sharma',       position: 'Hospitality Head',                branch: 'IT',               description: 'Friendly and welcoming, managed guest coordination for all major fests.', votes: 22 },
  { _id: 'c13', name: 'Tanvi Rao',         position: 'Hospitality Head',                branch: 'AIML',             description: 'Experienced in food and accommodation management for college events.', votes: 10 },
  // Social Media Head
  { _id: 'c14', name: 'Priyanka Das',      position: 'Social Media Head',               branch: 'AIML',             description: 'Content creator with 8K followers, managed Instagram reels for college.', votes: 20 },
  { _id: 'c15', name: 'Akash Tiwari',      position: 'Social Media Head',               branch: 'COMPS',            description: 'Digital marketing pro, increased engagement by 300%.', votes: 11 },
  // Cultural Head
  { _id: 'c16', name: 'Shreya Iyer',       position: 'Cultural Head',                   branch: 'IT',               description: 'Classical dancer and event planner, organized Culturals 2025.', votes: 16 },
  { _id: 'c17', name: 'Varun Bose',        position: 'Cultural Head',                   branch: 'AIML',             description: 'Music and theatre enthusiast, led drama club for 2 years.', votes: 15 },
  // Executive Members
  { _id: 'c18', name: 'Tushar Ahuja',      position: 'Executive Member - COMPS',        branch: 'COMPS',            description: 'Class representative for 2 consecutive years, active in department activities.', votes: 13 },
  { _id: 'c19', name: 'Pallavi Reddy',     position: 'Executive Member - IT',           branch: 'IT',               description: 'Active volunteer, organized 5 department seminars.', votes: 15 },
  { _id: 'c20', name: 'Mohit Sinha',       position: 'Executive Member - Data Engineering', branch: 'Data Engineering', description: 'Department ambassador and placement coordinator.', votes: 12 },
  { _id: 'c21', name: 'Deepika Nair',      position: 'Executive Member - AIML',         branch: 'AIML',             description: 'Research enthusiast, published 2 papers in college journal.', votes: 18 },
];

// Votes log
const votes = [];

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access only' });
  }
  next();
}

function groupByPosition(candList) {
  const grouped = {};
  for (const pos of POSITIONS) {
    grouped[pos] = candList.filter(c => c.position === pos);
  }
  return grouped;
}

// ─────────────────────────────────────────────────────────────
//  AUTH ROUTES
// ─────────────────────────────────────────────────────────────

// Student login
app.post('/api/auth/student-login', (req, res) => {
  const { studentId, password } = req.body;
  if (!studentId || !password)
    return res.status(400).json({ success: false, message: 'Please provide Student ID and password' });

  const student = students.find(s => s.studentId === studentId.toUpperCase());
  if (!student || student.password !== password)
    return res.status(401).json({ success: false, message: 'Invalid Student ID or password' });

  const token = signToken({ id: student.id, role: 'student', studentId: student.studentId });
  res.json({
    success: true, token,
    student: { id: student.id, studentId: student.studentId, name: student.name, branch: student.branch, votedPositions: student.votedPositions },
  });
});

// Admin login
app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN.username || password !== ADMIN.password)
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

  const token = signToken({ id: 'admin', role: 'admin' });
  res.json({ success: true, token, admin: { username: ADMIN.username } });
});

// ─────────────────────────────────────────────────────────────
//  CANDIDATES ROUTES
// ─────────────────────────────────────────────────────────────

app.get('/api/candidates', (req, res) => {
  res.json({ success: true, candidates, grouped: groupByPosition(candidates), positions: POSITIONS });
});

app.get('/api/candidates/positions', (req, res) => {
  res.json({ success: true, positions: POSITIONS });
});

app.post('/api/candidates', verifyToken, adminOnly, (req, res) => {
  const { name, position, branch, description } = req.body;
  if (!name || !position)
    return res.status(400).json({ success: false, message: 'Name and position are required' });
  if (!POSITIONS.includes(position))
    return res.status(400).json({ success: false, message: 'Invalid position' });

  const newCandidate = {
    _id: 'c' + Date.now(),
    name, position,
    branch: branch || 'All',
    description: description || '',
    votes: 0,
  };
  candidates.push(newCandidate);
  res.status(201).json({ success: true, candidate: newCandidate });
});

app.delete('/api/candidates/:id', verifyToken, adminOnly, (req, res) => {
  const idx = candidates.findIndex(c => c._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Candidate not found' });
  candidates.splice(idx, 1);
  res.json({ success: true, message: 'Candidate deleted' });
});

// ─────────────────────────────────────────────────────────────
//  VOTE ROUTES
// ─────────────────────────────────────────────────────────────

app.get('/api/votes/public-settings', (req, res) => {
  res.json({ success: true, settings: electionSettings });
});

app.get('/api/votes/results', (req, res) => {
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  res.json({ success: true, candidates: sorted, settings: electionSettings });
});

app.get('/api/votes/my-votes', verifyToken, (req, res) => {
  const myVotes = votes.filter(v => v.studentId === req.user.studentId);
  res.json({ success: true, votes: myVotes });
});

app.post('/api/votes', verifyToken, (req, res) => {
  const { candidateId, position } = req.body;
  const studentId = req.user.studentId;

  if (!electionSettings.isVotingActive)
    return res.status(400).json({ success: false, message: 'Voting is not currently active' });

  const now = new Date();
  if (electionSettings.votingStartTime && now < new Date(electionSettings.votingStartTime))
    return res.status(400).json({ success: false, message: 'Voting has not started yet' });
  if (electionSettings.votingEndTime && now > new Date(electionSettings.votingEndTime))
    return res.status(400).json({ success: false, message: 'Voting period has ended' });

  // Check duplicate
  const alreadyVoted = votes.find(v => v.studentId === studentId && v.position === position);
  if (alreadyVoted)
    return res.status(400).json({ success: false, message: `You have already voted for ${position}` });

  const candidate = candidates.find(c => c._id === candidateId && c.position === position);
  if (!candidate)
    return res.status(400).json({ success: false, message: 'Invalid candidate' });

  // Record vote
  votes.push({ studentId, candidateId, position, timestamp: new Date().toISOString() });
  candidate.votes += 1;

  // Update student voted positions
  const student = students.find(s => s.studentId === studentId);
  if (student && !student.votedPositions.includes(position)) {
    student.votedPositions.push(position);
  }

  res.status(201).json({ success: true, message: `Vote submitted for ${position}` });
});

// ─────────────────────────────────────────────────────────────
//  ADMIN ROUTES
// ─────────────────────────────────────────────────────────────

app.get('/api/admin/settings', verifyToken, adminOnly, (req, res) => {
  res.json({ success: true, settings: electionSettings });
});

app.put('/api/admin/settings', verifyToken, adminOnly, (req, res) => {
  const { isVotingActive, votingStartTime, votingEndTime } = req.body;
  if (isVotingActive !== undefined) electionSettings.isVotingActive = isVotingActive;
  if (votingStartTime) electionSettings.votingStartTime = new Date(votingStartTime).toISOString();
  if (votingEndTime) electionSettings.votingEndTime = new Date(votingEndTime).toISOString();
  res.json({ success: true, settings: electionSettings });
});

app.get('/api/admin/stats', verifyToken, adminOnly, (req, res) => {
  const votedStudentIds = [...new Set(votes.map(v => v.studentId))];
  const participationRate = students.length > 0
    ? ((votedStudentIds.length / students.length) * 100).toFixed(1) : '0';

  const votesByPosition = {};
  const leaders = {};
  for (const pos of POSITIONS) {
    const posCands = candidates.filter(c => c.position === pos).sort((a, b) => b.votes - a.votes);
    votesByPosition[pos] = { totalVotes: posCands.reduce((a, c) => a + c.votes, 0), candidates: posCands };
    leaders[pos] = posCands.length > 0 && posCands[0].votes > 0
      ? { name: posCands[0].name, votes: posCands[0].votes } : null;
  }

  res.json({
    success: true,
    stats: {
      totalStudents: students.length,
      totalVotes: votes.length,
      votedStudents: votedStudentIds.length,
      participationRate,
      candidates: [...candidates].sort((a, b) => b.votes - a.votes),
      votesByPosition,
      leaders,
      settings: electionSettings,
    }
  });
});

app.get('/api/admin/students', verifyToken, adminOnly, (req, res) => {
  const safe = students.map(({ password, ...s }) => s);
  res.json({ success: true, students: safe });
});

app.post('/api/admin/students', verifyToken, adminOnly, (req, res) => {
  const { studentId, name, branch, password } = req.body;
  if (!studentId || !name || !branch || !password)
    return res.status(400).json({ success: false, message: 'All fields are required' });

  if (students.find(s => s.studentId === studentId.toUpperCase()))
    return res.status(400).json({ success: false, message: 'Student ID already exists' });

  const student = { id: 's' + Date.now(), studentId: studentId.toUpperCase(), name, branch, password, votedPositions: [] };
  students.push(student);
  const { password: _, ...safe } = student;
  res.status(201).json({ success: true, student: safe });
});

app.post('/api/admin/reset-votes', verifyToken, adminOnly, (req, res) => {
  votes.length = 0;
  candidates.forEach(c => { c.votes = 0; });
  students.forEach(s => { s.votedPositions = []; });
  res.json({ success: true, message: 'All votes reset successfully' });
});

// ─────────────────────────────────────────────────────────────
//  HEALTH & FALLBACK
// ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'College Voting System running!' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ─────────────────────────────────────────────');
  console.log(`   Server:   http://localhost:${PORT}`);
  console.log(`   Student:  http://localhost:${PORT}/index.html`);
  console.log(`   Admin:    http://localhost:${PORT}/admin-dashboard.html`);
  console.log(`   Results:  http://localhost:${PORT}/results.html`);
  console.log('   ───────────────────────────────────────────');
  console.log('   🔑 Admin:   admin / admin123');
  console.log('   👤 Student: AIML001 / pass1234   (or any below)');
  console.log('   👤 Students: COMPS001, IT001, DE001, AIML002 ... / pass1234');
  console.log('🚀 ─────────────────────────────────────────────');
  console.log('');
});
