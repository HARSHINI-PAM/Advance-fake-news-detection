import { setupLogger } from '../utils/logger';
import { EventEmitter } from 'events';
import { SourceVerifier } from './sourceVerification';
import { MediaAnalyzer } from './mediaAnalysis';
import { analyzeText } from '../models/modelLoader';
import { AnalysisResult } from '../types/analysis';
// @ts-ignore
import WebSocket from 'ws';

const logger = setupLogger();

interface MonitoringSource {
  url: string;
  type: 'rss' | 'api' | 'websocket';
  updateInterval?: number;
  credentials?: {
    apiKey?: string;
    username?: string;
    password?: string;
  };
}

interface MonitoringAlert {
  source: string;
  content: string;
  analysisResult: AnalysisResult;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  type: 'fake_news' | 'manipulation' | 'misinformation';
}

export class LiveMonitor extends EventEmitter {
  private sources: Map<string, MonitoringSource>;
  private activeConnections: Map<string, WebSocket | NodeJS.Timeout>;
  private sourceVerifier: SourceVerifier;
  private mediaAnalyzer: MediaAnalyzer;
  private isMonitoring: boolean;

  constructor() {
    super();
    this.sources = new Map();
    this.activeConnections = new Map();
    this.sourceVerifier = new SourceVerifier();
    this.mediaAnalyzer = new MediaAnalyzer();
    this.isMonitoring = false;
  }

  async initialize(): Promise<void> {
    try {
      await this.mediaAnalyzer.initialize();
      logger.info('Live monitor initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize live monitor:', error);
      throw error;
    }
  }

  async addSource(source: MonitoringSource): Promise<void> {
    try {
      // Verify source before adding
      const verification = await this.sourceVerifier.verifySource(source.url);
      if (verification.credibilityScore < 0.3) {
        throw new Error('Source credibility too low');
      }

      this.sources.set(source.url, source);
      logger.info(`Added monitoring source: ${source.url}`);

      if (this.isMonitoring) {
        await this.connectToSource(source);
      }
    } catch (error) {
      logger.error(`Failed to add source ${source.url}:`, error);
      throw error;
    }
  }

  async startMonitoring(): Promise<void> {
    try {
      this.isMonitoring = true;
      logger.info('Starting live monitoring...');

      for (const source of this.sources.values()) {
        await this.connectToSource(source);
      }

      this.emit('monitoring_started');
    } catch (error) {
      logger.error('Failed to start monitoring:', error);
      throw error;
    }
  }

  async stopMonitoring(): Promise<void> {
    try {
      this.isMonitoring = false;
      logger.info('Stopping live monitoring...');

      for (const [url, connection] of this.activeConnections) {
        if (connection instanceof WebSocket) {
          connection.close();
        } else {
          clearInterval(connection);
        }
        this.activeConnections.delete(url);
      }

      this.emit('monitoring_stopped');
    } catch (error) {
      logger.error('Failed to stop monitoring:', error);
      throw error;
    }
  }

  private async connectToSource(source: MonitoringSource): Promise<void> {
    try {
      switch (source.type) {
        case 'websocket':
          await this.setupWebSocketConnection(source);
          break;
        case 'rss':
          await this.setupRSSPolling(source);
          break;
        case 'api':
          await this.setupAPIPolling(source);
          break;
        default:
          throw new Error(`Unsupported source type: ${source.type}`);
      }
    } catch (error) {
      logger.error(`Failed to connect to source ${source.url}:`, error);
      throw error;
    }
  }

  private async setupWebSocketConnection(source: MonitoringSource): Promise<void> {
    const ws = new WebSocket(source.url);

    ws.on('message', async (data: WebSocket.Data) => {
      try {
        const content = this.parseWebSocketMessage(data);
        await this.analyzeContent(source.url, content);
      } catch (error) {
        logger.error(`Error processing WebSocket message from ${source.url}:`, error);
      }
    });

    ws.on('error', (error: any) => {
      logger.error(`WebSocket error for ${source.url}:`, error);
      this.emit('source_error', { source: source.url, error });
    });

    this.activeConnections.set(source.url, ws);
  }

  private async setupRSSPolling(source: MonitoringSource): Promise<void> {
    const interval = setInterval(async () => {
      try {
        const feed = await this.fetchRSSFeed(source.url);
        for (const item of feed) {
          await this.analyzeContent(source.url, item);
        }
      } catch (error) {
        logger.error(`Error polling RSS feed ${source.url}:`, error);
      }
    }, source.updateInterval || 300000); // Default: 5 minutes

    this.activeConnections.set(source.url, interval);
  }

  private async setupAPIPolling(source: MonitoringSource): Promise<void> {
    const interval = setInterval(async () => {
      try {
        const data = await this.fetchAPIData(source);
        await this.analyzeContent(source.url, data);
      } catch (error) {
        logger.error(`Error polling API ${source.url}:`, error);
      }
    }, source.updateInterval || 60000); // Default: 1 minute

    this.activeConnections.set(source.url, interval);
  }

  private async analyzeContent(sourceUrl: string, content: any): Promise<void> {
    try {
      // Analyze text content
      const textAnalysis = await analyzeText(content.text);

      // Check for media content
      if (content.media) {
        const mediaAnalysis = await this.mediaAnalyzer.analyzeImage(content.media);
        if (mediaAnalysis.isManipulated) {
          this.emitAlert({
            source: sourceUrl,
            content: content.text,
            analysisResult: textAnalysis,
            timestamp: new Date().toISOString(),
            severity: 'high',
            type: 'manipulation'
          });
        }
      }

      // Check text analysis results
      if (textAnalysis.confidence > 0.8 && textAnalysis.prediction === 'FAKE') {
        this.emitAlert({
          source: sourceUrl,
          content: content.text,
          analysisResult: textAnalysis,
          timestamp: new Date().toISOString(),
          severity: 'high',
          type: 'fake_news'
        });
      }
    } catch (error) {
      logger.error(`Error analyzing content from ${sourceUrl}:`, error);
    }
  }

  private emitAlert(alert: MonitoringAlert): void {
    this.emit('alert', alert);
    logger.warn('Alert detected:', alert);
  }

  private parseWebSocketMessage(data: WebSocket.Data): any {
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return data;
  }

  private async fetchRSSFeed(url: string): Promise<any[]> {
    // Implement RSS feed fetching
    return [];
  }

  private async fetchAPIData(source: MonitoringSource): Promise<any> {
    // Implement API data fetching
    return {};
  }
} 