import { Request, Response } from 'express';
import Student from '../models/Student';
import Candidate, { POSITION_LIST } from '../models/Candidate';
import Vote from '../models/Vote';
import ElectionSettings from '../models/ElectionSettings';

// Get admin dashboard stats
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const candidates = await Candidate.find().sort({ votes: -1 });
    const settings = await ElectionSettings.findOne().select('-adminPassword');

    // Voted students (unique students who voted)
    const votedStudents = await Vote.distinct('studentId');
    const participationRate =
      totalStudents > 0 ? ((votedStudents.length / totalStudents) * 100).toFixed(1) : '0';

    // Votes per position
    const votesByPosition: Record<string, { totalVotes: number; candidates: typeof candidates }> = {};
    for (const pos of POSITION_LIST) {
      votesByPosition[pos] = {
        totalVotes: candidates.filter((c) => c.position === pos).reduce((a, c) => a + c.votes, 0),
        candidates: candidates.filter((c) => c.position === pos),
      };
    }

    // Leaders per position
    const leaders: Record<string, { name: string; votes: number } | null> = {};
    for (const pos of POSITION_LIST) {
      const positionCandidates = candidates.filter((c) => c.position === pos);
      if (positionCandidates.length > 0) {
        leaders[pos] = { name: positionCandidates[0].name, votes: positionCandidates[0].votes };
      } else {
        leaders[pos] = null;
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalVotes,
        votedStudents: votedStudents.length,
        participationRate,
        candidates,
        votesByPosition,
        leaders,
        settings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Update election settings
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { votingStartTime, votingEndTime, isVotingActive } = req.body;
    const settings = await ElectionSettings.findOne();
    if (!settings) {
      res.status(404).json({ success: false, message: 'Settings not found' });
      return;
    }
    if (votingStartTime !== undefined) settings.votingStartTime = new Date(votingStartTime);
    if (votingEndTime !== undefined) settings.votingEndTime = new Date(votingEndTime);
    if (isVotingActive !== undefined) settings.isVotingActive = isVotingActive;
    await settings.save();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get settings
export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await ElectionSettings.findOne().select('-adminPassword');
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get all students
export const getAllStudents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const students = await Student.find().select('-password').sort({ studentId: 1 });
    res.status(200).json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Add student (admin)
export const addStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, name, branch, password } = req.body;
    if (!studentId || !name || !branch || !password) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }
    const existing = await Student.findOne({ studentId: studentId.toUpperCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Student ID already exists' });
      return;
    }
    const student = await Student.create({ studentId, name, branch, password });
    res.status(201).json({
      success: true,
      student: { id: student._id, studentId: student.studentId, name: student.name, branch: student.branch },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Reset all votes (admin)
export const resetVotes = async (_req: Request, res: Response): Promise<void> => {
  try {
    await Vote.deleteMany({});
    await Candidate.updateMany({}, { votes: 0 });
    await Student.updateMany({}, { votedPositions: [] });
    res.status(200).json({ success: true, message: 'All votes have been reset' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
