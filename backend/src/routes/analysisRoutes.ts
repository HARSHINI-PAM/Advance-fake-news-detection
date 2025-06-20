import express from 'express';
import { textAnalyzer } from '../services/textAnalyzer';
import { setupLogger } from '../utils/logger';
import { AnalysisResult } from '../types/analysis';

const router = express.Router();
const logger = setupLogger();

// POST /api/analysis/text
router.post('/text', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await textAnalyzer.analyzeText(text);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

// GET /api/analysis/stats
router.get('/stats', async (req, res) => {
  try {
    // TODO: Implement analysis statistics from database
    res.json({
      totalAnalyses: 0,
      averageProcessingTime: 0,
      accuracyScore: 0
    });
  } catch (error) {
    logger.error('Error fetching analysis stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router; 