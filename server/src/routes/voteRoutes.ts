import { Router, Request, Response } from 'express';
import { submitVote, getMyVotes, getResults } from '../controllers/voteController';
import { protect } from '../middleware/auth';
import ElectionSettings from '../models/ElectionSettings';

const router = Router();

router.post('/', protect, submitVote);
router.get('/my-votes', protect, getMyVotes);
router.get('/results', getResults);

// Public endpoint – returns only safe voting status info
router.get('/public-settings', async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await ElectionSettings.findOne().select('-adminPassword -adminUsername');
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

export default router;
