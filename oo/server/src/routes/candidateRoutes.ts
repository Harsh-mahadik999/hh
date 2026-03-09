import { Router } from 'express';
import {
  getAllCandidates,
  getPositions,
  addCandidate,
  updateCandidate,
  deleteCandidate,
} from '../controllers/candidateController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getAllCandidates);
router.get('/positions', getPositions);
router.post('/', protect, adminOnly, addCandidate);
router.put('/:id', protect, adminOnly, updateCandidate);
router.delete('/:id', protect, adminOnly, deleteCandidate);

export default router;
