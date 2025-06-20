import axios from 'axios';
import { setupLogger } from '../utils/logger';

const logger = setupLogger();

const API_KEY = process.env.FACT_CHECK_API_KEY;
const API_URL = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';

export interface FactCheckClaim {
  text: string;
  claimant: string;
  claimDate: string;
  claimReview: {
    publisher: {
      name: string;
      site: string;
    };
    url: string;
    title: string;
    reviewDate: string;
    textualRating: string;
    languageCode: string;
  }[];
}

export interface FactCheckResponse {
  claims: FactCheckClaim[];
  nextPageToken?: string;
}

export interface FactCheckResult {
  isVerifiable: boolean;
  rating: string | null;
  claims: FactCheckClaim[];
  error?: string;
}

class FactCheckService {
  async verifyClaim(query: string): Promise<FactCheckResult> {
    if (!API_KEY) {
      logger.warn('FACT_CHECK_API_KEY is not set. Skipping fact check.');
      return {
        isVerifiable: false,
        rating: 'Not Available',
        claims: [],
        error: 'API key not configured'
      };
    }

    try {
      const response = await axios.get<FactCheckResponse>(API_URL, {
        params: {
          query,
          key: API_KEY,
          languageCode: 'en-US',
          pageSize: 5
        }
      });

      const { claims } = response.data;

      if (!claims || claims.length === 0) {
        return { isVerifiable: false, rating: 'No results', claims: [] };
      }

      // Simple rating logic: use the rating of the first result
      const topRating = claims[0].claimReview[0]?.textualRating || 'Unrated';

      return {
        isVerifiable: true,
        rating: topRating,
        claims
      };
    } catch (error: any) {
      logger.error('Error calling Fact Check API:', error.response?.data || error.message);
      return {
        isVerifiable: false,
        rating: 'Error',
        claims: [],
        error: 'Failed to communicate with Fact Check API'
      };
    }
  }
}

export const factCheckService = new FactCheckService(); 