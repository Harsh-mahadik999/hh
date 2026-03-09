import { Response } from 'express';
import Vote from '../models/Vote';
import Candidate from '../models/Candidate';
import Student from '../models/Student';
import ElectionSettings from '../models/ElectionSettings';
import { AuthRequest } from '../middleware/auth';

// Submit a vote
export const submitVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { candidateId, position } = req.body;
    const studentId = req.user?.studentId;

    if (!studentId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Check if voting is active
    const settings = await ElectionSettings.findOne();
    if (!settings || !settings.isVotingActive) {
      res.status(400).json({ success: false, message: 'Voting is not currently active' });
      return;
    }

    // Check time window
    const now = new Date();
    if (settings.votingStartTime && now < settings.votingStartTime) {
      res.status(400).json({ success: false, message: 'Voting has not started yet' });
      return;
    }
    if (settings.votingEndTime && now > settings.votingEndTime) {
      res.status(400).json({ success: false, message: 'Voting period has ended' });
      return;
    }

    // Check if already voted for this position
    const existingVote = await Vote.findOne({ studentId, position });
    if (existingVote) {
      res.status(400).json({ success: false, message: `You have already voted for ${position}` });
      return;
    }

    // Verify candidate exists and position matches
    const candidate = await Candidate.findById(candidateId);
    if (!candidate || candidate.position !== position) {
      res.status(400).json({ success: false, message: 'Invalid candidate or position mismatch' });
      return;
    }

    // Create vote
    await Vote.create({ studentId, candidateId, position });

    // Increment candidate vote count
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });

    // Track voted position for student
    await Student.findOneAndUpdate(
      { studentId },
      { $addToSet: { votedPositions: position } }
    );

    res.status(201).json({ success: true, message: `Vote submitted for ${position}` });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      res.status(400).json({ success: false, message: 'You have already voted for this position' });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
};

// Get my votes
export const getMyVotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    const votes = await Vote.find({ studentId }).populate('candidateId', 'name position');
    res.status(200).json({ success: true, votes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get public results
export const getResults = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const candidates = await Candidate.find().sort({ votes: -1 });
    const settings = await ElectionSettings.findOne().select('-adminPassword');
    res.status(200).json({ success: true, candidates, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
