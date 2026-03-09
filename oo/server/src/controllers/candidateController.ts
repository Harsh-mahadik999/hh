import { Request, Response } from 'express';
import Candidate, { POSITION_LIST } from '../models/Candidate';

// Get all candidates grouped by position
export const getAllCandidates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const candidates = await Candidate.find().sort({ position: 1, name: 1 });
    const grouped: Record<string, typeof candidates> = {};
    for (const pos of POSITION_LIST) {
      grouped[pos] = candidates.filter((c) => c.position === pos);
    }
    res.status(200).json({ success: true, candidates, grouped, positions: POSITION_LIST });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get positions list
export const getPositions = (_req: Request, res: Response): void => {
  res.status(200).json({ success: true, positions: POSITION_LIST });
};

// Add candidate (admin only)
export const addCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, position, branch, description, imageUrl } = req.body;
    if (!name || !position) {
      res.status(400).json({ success: false, message: 'Name and position are required' });
      return;
    }
    if (!POSITION_LIST.includes(position)) {
      res.status(400).json({ success: false, message: 'Invalid position' });
      return;
    }
    const candidate = await Candidate.create({ name, position, branch, description, imageUrl });
    res.status(201).json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Update candidate (admin only)
export const updateCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!candidate) {
      res.status(404).json({ success: false, message: 'Candidate not found' });
      return;
    }
    res.status(200).json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Delete candidate (admin only)
export const deleteCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      res.status(404).json({ success: false, message: 'Candidate not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
