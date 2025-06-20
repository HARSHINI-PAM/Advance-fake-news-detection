import * as tf from '@tensorflow/tfjs-node';
import { MediaAnalysisResult } from '../types/analysis';
import { setupLogger } from '../utils/logger';
import sharp from 'sharp';
import path from 'path';

const logger = setupLogger();

export class MediaAnalyzer {
  private imageModel: tf.GraphModel | null = null;
  private deepfakeModel: tf.GraphModel | null = null;
  private faceDetectionModel: tf.GraphModel | null = null;
  private readonly MODEL_PATH = process.env.MODEL_PATH || './models';

  async initialize() {
    try {
      // Load image manipulation detection model
      this.imageModel = await tf.loadGraphModel(
        `file://${path.join(this.MODEL_PATH, 'image_manipulation/model.json')}`
      );

      // Load deepfake detection model
      this.deepfakeModel = await tf.loadGraphModel(
        `file://${path.join(this.MODEL_PATH, 'deepfake_detection/model.json')}`
      );

      // Load face detection model
      this.faceDetectionModel = await tf.loadGraphModel(
        `file://${path.join(this.MODEL_PATH, 'face_detection/model.json')}`
      );

      logger.info('Media analysis models loaded successfully');
    } catch (error) {
      logger.error('Error loading media analysis models:', error);
      throw error;
    }
  }

  async analyzeImage(imageUrl: string): Promise<MediaAnalysisResult> {
    try {
      // Download and process image
      const response = await fetch(imageUrl);
      const imageBuffer = await response.arrayBuffer();
      
      // Process image with sharp for metadata and basic analysis
      const image = sharp(Buffer.from(imageBuffer));
      const metadata = await image.metadata();

      // Convert image to tensor
      const tensor = tf.node.decodeImage(Buffer.from(imageBuffer));
      const preprocessed = this.preprocessImage(tensor as tf.Tensor3D);

      // Run manipulation detection
      const predictions = await this.detectImageManipulation(preprocessed);

      // Error Level Analysis (ELA)
      const elaScore = await this.performELA(Buffer.from(imageBuffer));

      // Object detection for context verification
      const detectedObjects = await this.detectObjects(preprocessed);

      // Face analysis
      const faceAnalysis = await this.analyzeFaces(preprocessed);

      // Metadata analysis
      const metadataAnalysis = await this.analyzeMetadata(metadata);

      tensor.dispose();
      preprocessed.dispose();

      // Calculate final manipulation score with weighted factors
      const finalManipulationScore = this.calculateFinalManipulationScore({
        modelScore: predictions.manipulationScore,
        elaScore,
        faceAnalysis,
        metadataAnalysis
      });

      return {
        type: 'image',
        isManipulated: finalManipulationScore > 0.7,
        manipulationScore: finalManipulationScore,
        detectedObjects,
        metadata: {
          ...metadata,
          analyzedAt: new Date().toISOString()
        },
        errorLevel: elaScore,
        confidence: predictions.confidence,
        faceAnalysis,
        warnings: [],
        verificationStatus: finalManipulationScore > 0.7 ? 'manipulated' : 'verified'
      };
    } catch (error) {
      logger.error('Image analysis failed:', error);
      throw error;
    }
  }

  async analyzeVideo(videoUrl: string): Promise<MediaAnalysisResult> {
    try {
      // Download video
      const response = await fetch(videoUrl);
      const videoBuffer = await response.arrayBuffer();
      
      // Extract frames from video
      const frames = await this.extractVideoFrames(Buffer.from(videoBuffer));
      
      // Analyze each frame for inconsistencies
      const frameAnalysis = await Promise.all(
        frames.map(frame => this.analyzeVideoFrame(frame))
      );

      // Detect face inconsistencies across frames
      const faceAnalysis = await this.analyzeFaceConsistency(frames);

      // Analyze audio if present
      const audioAnalysis = await this.analyzeAudio(Buffer.from(videoBuffer));

      // Analyze video metadata
      const metadataAnalysis = await this.analyzeVideoMetadata(Buffer.from(videoBuffer));

      // Aggregate results with improved confidence calculation
      const inconsistentFrames = frameAnalysis
        .map((analysis, index) => analysis.manipulationScore > 0.7 ? index : -1)
        .filter(index => index !== -1);

      const confidence = this.calculateVideoConfidence({
        frameAnalysis,
        faceAnalysis,
        audioAnalysis,
        metadataAnalysis
      });

      return {
        type: 'video',
        isManipulated: confidence > 0.8,
        isDeepfake: confidence > 0.8,
        manipulationScore: confidence,
        confidence,
        inconsistentFrames,
        faceAnalysis,
        metadata: {
          totalFrames: frames.length,
          analyzedFrames: frameAnalysis.length,
          analyzedAt: new Date().toISOString()
        },
        warnings: [],
        verificationStatus: confidence > 0.8 ? 'manipulated' : 'verified'
      };
    } catch (error) {
      logger.error('Video analysis failed:', error);
      throw error;
    }
  }

  private preprocessImage(tensor: tf.Tensor3D): tf.Tensor3D {
    // Implement image preprocessing
    return tensor;
  }

  private async detectImageManipulation(tensor: tf.Tensor3D) {
    if (!this.imageModel) {
      throw new Error('Image manipulation model not initialized');
    }

    const prediction = await this.imageModel.predict(
      tensor.expandDims(0)
    ) as tf.Tensor;

    const score = await prediction.data();
    prediction.dispose();

    return {
      manipulationScore: score[0],
      confidence: Math.max(...Array.from(score))
    };
  }

  private async analyzeVideoFrame(frame: tf.Tensor3D) {
    return this.detectImageManipulation(frame);
  }

  private async analyzeFaceConsistency(frames: tf.Tensor3D[]) {
    return {
      detected: false,
      anomalies: []
    };
  }

  private calculateVideoConfidence({
    frameAnalysis,
    faceAnalysis,
    audioAnalysis,
    metadataAnalysis
  }: {
    frameAnalysis: any[];
    faceAnalysis: any;
    audioAnalysis: any;
    metadataAnalysis: any;
  }): number {
    const weights = {
      frames: 0.4,
      faces: 0.3,
      audio: 0.2,
      metadata: 0.1
    };

    const frameScore = frameAnalysis.reduce((sum, analysis) => 
      sum + analysis.confidence, 0) / frameAnalysis.length;

    const faceScore = faceAnalysis.anomalies.length > 0 ? 0.8 : 0.2;
    const audioScore = audioAnalysis.suspicious ? 0.7 : 0.3;
    const metadataScore = metadataAnalysis.suspicious ? 0.7 : 0.3;

    return (
      weights.frames * frameScore +
      weights.faces * faceScore +
      weights.audio * audioScore +
      weights.metadata * metadataScore
    );
  }

  private async analyzeMetadata(metadata: any) {
    return {
      suspicious: false
    };
  }

  private async analyzeAudio(videoBuffer: Buffer) {
    return {
      suspicious: false
    };
  }

  private async analyzeVideoMetadata(videoBuffer: Buffer) {
    return {
      suspicious: false
    };
  }

  private async extractVideoFrames(videoBuffer: Buffer): Promise<tf.Tensor3D[]> {
    // Implement video frame extraction
    return [];
  }

  private async detectObjects(tensor: tf.Tensor3D): Promise<string[]> {
    // Implement object detection
    return [];
  }

  private async performELA(imageBuffer: Buffer): Promise<number> {
    // Implement Error Level Analysis
    return 0;
  }

  private calculateFinalManipulationScore({
    modelScore,
    elaScore,
    faceAnalysis,
    metadataAnalysis
  }: {
    modelScore: number;
    elaScore: number;
    faceAnalysis: any;
    metadataAnalysis: any;
  }): number {
    const weights = {
      model: 0.4,
      ela: 0.2,
      face: 0.25,
      metadata: 0.15
    };

    const faceScore = faceAnalysis.anomalies.length > 0 ? 0.8 : 0.2;
    const metadataScore = metadataAnalysis.suspicious ? 0.7 : 0.3;

    return (
      weights.model * modelScore +
      weights.ela * elaScore +
      weights.face * faceScore +
      weights.metadata * metadataScore
    );
  }

  private async analyzeFaces(tensor: tf.Tensor3D) {
    if (!this.faceDetectionModel) {
      throw new Error('Face detection model not initialized');
    }

    const prediction = await this.faceDetectionModel.predict(
      tensor.expandDims(0)
    ) as tf.Tensor;

    const faceData = await prediction.data();
    prediction.dispose();

    const anomalies: string[] = [];
    
    if (this.hasUnrealisticProportions(new Float32Array(faceData))) {
      anomalies.push('Unrealistic face proportions detected');
    }
    
    if (this.hasInconsistentLighting(new Float32Array(faceData))) {
      anomalies.push('Inconsistent lighting detected');
    }
    
    if (this.hasUnnaturalSkinTexture(new Float32Array(faceData))) {
      anomalies.push('Unnatural skin texture detected');
    }

    return {
      detected: faceData.length > 0,
      anomalies
    };
  }

  private hasUnrealisticProportions(faceData: Float32Array): boolean {
    // Implement logic to check for unrealistic face proportions
    return false;
  }

  private hasInconsistentLighting(faceData: Float32Array): boolean {
    // Implement logic to check for inconsistent lighting
    return false;
  }

  private hasUnnaturalSkinTexture(faceData: Float32Array): boolean {
    // Implement logic to check for unnatural skin texture
    return false;
  }
} 