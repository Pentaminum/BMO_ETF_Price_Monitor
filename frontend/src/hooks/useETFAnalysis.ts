import { useMutation } from '@tanstack/react-query';
import apiClient, { ApiError } from '../api/apiClient';
import type { ETFAnalysisResponse } from '../types/etf_data';
import { logger } from '../utils/logger';

/*
Custom hook for ETF CSV Analysis
 */
export const useETFAnalysis = () => {
  return useMutation<ETFAnalysisResponse, ApiError, File>({
    // function to handle API call
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await apiClient.post<ETFAnalysisResponse>(
        'analyze_etf', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    },

    onMutate: (file: File) => {
      logger.info(`Starting analysis for: ${file.name}`);
    },

    onSuccess: (data: ETFAnalysisResponse) => {
      logger.info('ETF Analysis completed successfully', data.status);
    },

    onError: (error: ApiError) => {
      logger.error('ETF Analysis failed', error.message);
    },
  });
};