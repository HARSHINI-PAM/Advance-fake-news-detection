import express from 'express';
import { SourceVerifier } from '../services/sourceVerification';
import { setupLogger } from '../utils/logger';

const router = express.Router();
const logger = setupLogger();
const sourceVerifier = new SourceVerifier();

// Initialize source verifier
sourceVerifier.initialize().catch((error: any) => {
  logger.error('Failed to initialize source verifier:', error.message || error);
});

// POST /api/source/verify
router.post('/verify', async (req, res) => {
  try {
    const { url, content } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'Source URL is required'
      });
    }

    const verification = await sourceVerifier.verifySource(url, content);
    
    res.json({
      success: true,
      result: verification
    });
  } catch (error: any) {
    logger.error('Source verification failed:', error.message || error);
    res.status(500).json({
      error: 'Source verification failed',
      message: error.message || 'Unknown error'
    });
  }
});

// GET /api/source/trusted
router.get('/trusted', async (req, res) => {
  try {
    // TODO: Implement trusted sources list from database
    res.json({
      sources: [
        'reuters.com',
        'apnews.com',
        'bbc.com',
        'bbc.co.uk',
        'npr.org',
        'timesofindia.indiatimes.com',
        'thehindu.com'
      ]
    });
  } catch (error: any) {
    logger.error('Error fetching trusted sources:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch trusted sources' });
  }
});

// POST /api/source/batch-verify
router.post('/batch-verify', async (req, res) => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls)) {
      return res.status(400).json({
        error: 'Invalid request: urls must be an array'
      });
    }

    logger.info('Batch verifying sources:', urls.length);

    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const analysis = await sourceVerifier.verifySource(url);
          return {
            url,
            status: 'success',
            analysis
          };
        } catch (error: any) {
          return {
            url,
            status: 'error',
            error: error.message || error
          };
        }
      })
    );

    res.json({
      results,
      summary: {
        total: urls.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length
      }
    });
  } catch (error: any) {
    logger.error('Batch verification failed:', error.message || error);
    res.status(500).json({
      error: 'Batch verification failed',
      message: error.message || 'Unknown error'
    });
  }
});

// GET /api/source/stats
router.get('/stats', async (req, res) => {
  try {
    // TODO: Implement source verification statistics from database
    res.json({
      totalVerifications: 0,
      averageCredibilityScore: 0,
      trustedSourceHits: 0,
      unreliableSourceHits: 0
    });
  } catch (error: any) {
    logger.error('Error fetching source stats:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router; 