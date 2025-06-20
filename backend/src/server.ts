import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { setupLogger } from './utils/logger';
import { textAnalyzer } from './services/textAnalyzer';
import { MediaAnalyzer } from './services/mediaAnalyzer';
import multer, { FileFilterCallback } from 'multer';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const app = express();
const port = process.env.PORT || 3000;
const logger = setupLogger();
const mediaAnalyzer = new MediaAnalyzer();

// Initialize media analyzer
mediaAnalyzer.initialize()
  .then(() => logger.info('Media analyzer initialized'))
  .catch(err => logger.error('Failed to initialize media analyzer:', err));

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // allow any localhost origin
        if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            logger.warn(`CORS: Origin ${origin} not allowed`);
            callback(new Error('Not allowed by CORS'))
        }
    }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Text analysis endpoint
app.post('/api/analyze/text', async (req: Request, res: Response) => {
  try {
    const { text, title, source } = req.body;
    
    if (!text) {
      logger.error('Missing text content in request');
      return res.status(400).json({ error: 'Text content is required' });
    }

    logger.info('Analyzing text:', { title, source, textLength: text.length });
    const result = await textAnalyzer.analyzeText(text);
    logger.info('Analysis complete:', { prediction: result.prediction, confidence: result.confidence });
    
    res.json(result);
  } catch (error: any) {
    logger.error('Text analysis failed:', error);
    res.status(500).json({ error: 'Analysis failed', details: error?.message || 'Unknown error' });
  }
});

// Media analysis endpoints
app.post('/api/media/analyze/image', upload.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    logger.info('Analyzing image...', {
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const result = await mediaAnalyzer.analyzeImage(req.file.buffer);
    res.json(result);
  } catch (error: any) {
    logger.error('Image analysis failed:', error);
    res.status(500).json({ 
      error: 'Image analysis failed', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

app.post('/api/media/analyze/video', upload.single('video'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    logger.info('Analyzing video...', {
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const result = await mediaAnalyzer.analyzeVideo(req.file.buffer);
    res.json(result);
  } catch (error: any) {
    logger.error('Video analysis failed:', error);
    res.status(500).json({ 
      error: 'Video analysis failed', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err?.message || 'Unknown error' });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
}); 