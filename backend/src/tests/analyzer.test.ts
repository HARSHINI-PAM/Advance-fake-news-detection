import { TransformerAnalyzer } from '../models/transformerAnalyzer';
import { MediaAnalyzer } from '../models/mediaAnalyzer';
import { setupLogger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const logger = setupLogger();

async function testTextAnalysis() {
  try {
    const analyzer = new TransformerAnalyzer();
    await analyzer.initialize();

    const testTexts = [
      'This is a legitimate news article about current events.',
      'BREAKING: Aliens have landed in New York City! Share this now!',
      'Scientists discover new species in the Amazon rainforest.'
    ];

    for (const text of testTexts) {
      const result = await analyzer.analyze(text);
      logger.info('Text Analysis Result:', {
        text: text.substring(0, 50) + '...',
        prediction: result.prediction,
        confidence: result.confidence,
        reasoning: result.reasoning,
        metrics: result.metrics
      });
    }
  } catch (error) {
    logger.error('Text analysis test failed:', error);
  }
}

async function testMediaAnalysis() {
  try {
    const analyzer = new MediaAnalyzer();
    await analyzer.initialize();

    // Create test directory if it doesn't exist
    const testDir = path.join(__dirname, 'test-media');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }

    // Create a simple test image if it doesn't exist
    const testImagePath = path.join(testDir, 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      // Create a simple colored rectangle
      await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 255, g: 0, b: 0 }
        }
      })
        .jpeg()
        .toFile(testImagePath);
    }

    const result = await analyzer.analyzeMedia(testImagePath, 'image');
    logger.info('Media Analysis Result:', {
      isManipulated: result.isManipulated,
      confidence: result.confidence,
      metadata: result.metadata,
      analysis: result.analysis
    });
  } catch (error) {
    logger.error('Media analysis test failed:', error);
  }
}

async function runTests() {
  try {
    logger.info('Starting analyzer tests...');
    await testTextAnalysis();
    await testMediaAnalysis();
    logger.info('All tests completed successfully');
  } catch (error) {
    logger.error('Test suite failed:', error);
  }
}

runTests(); 