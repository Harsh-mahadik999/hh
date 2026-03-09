import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Student from '../models/Student';
import ElectionSettings from '../models/ElectionSettings';

const signToken = (id: string, role: 'student' | 'admin', studentId?: string): string => {
  return jwt.sign(
    { id, role, studentId },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
  );
};

// Student Login
export const studentLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, password } = req.body;
    if (!studentId || !password) {
      res.status(400).json({ success: false, message: 'Please provide student ID and password' });
      return;
    }
    const student = await Student.findOne({ studentId: studentId.toUpperCase() });
    if (!student || !(await student.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid student ID or password' });
      return;
    }
    const token = signToken(String(student._id), 'student', student.studentId);
    res.status(200).json({
      success: true,
      token,
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        branch: student.branch,
        votedPositions: student.votedPositions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Admin Login
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Please provide username and password' });
      return;
    }
    const settings = await ElectionSettings.findOne({ adminUsername: username });
    if (!settings || !(await settings.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid admin credentials' });
      return;
    }
    const token = signToken(String(settings._id), 'admin');
    res.status(200).json({ success: true, token, admin: { username: settings.adminUsername } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
