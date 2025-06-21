import express from 'express';
// @ts-ignore
import multer from 'multer';
import { MediaAnalyzer } from '../services/mediaAnalysis';
import { setupLogger } from '../utils/logger';

const router = express.Router();
const logger = setupLogger();
const mediaAnalyzer = new MediaAnalyzer();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Initialize media analyzer
mediaAnalyzer.initialize().catch(error => {
  logger.error('Failed to initialize media analyzer:', error);
});

// POST /api/media/analyze/image
router.post('/analyze/image', async (req: any, res: any) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    const analysis = await mediaAnalyzer.analyzeImage(imageUrl);
    res.json({
      success: true,
      result: analysis
    });
  } catch (error: unknown) {
    logger.error('Image analysis failed:', error);
    res.status(500).json({
      error: 'Image analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/media/analyze/video
router.post('/analyze/video', async (req: any, res: any) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }
    const analysis = await mediaAnalyzer.analyzeVideo(videoUrl);
    res.json({
      success: true,
      result: analysis
    });
  } catch (error: unknown) {
    logger.error('Video analysis failed:', error);
    res.status(500).json({
      error: 'Video analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/media/stats
router.get('/stats', async (req, res) => {
  try {
    // TODO: Implement media analysis statistics from database
    res.json({
      totalAnalyses: 0,
      imageAnalyses: 0,
      videoAnalyses: 0,
      averageProcessingTime: 0,
      detectionRate: 0
    });
  } catch (error) {
    logger.error('Error fetching media stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router; 