export interface Constituent {
  name: string;
  weight: number;
  latest_close_price: number;
  holding_size: number;
}

export interface ETFAnalysisData {
  // Key = Date(YYYY-MM-DD), Value = reconstructed price
  reconstructed_history: Record<string, number>;
  all_constituents: Constituent[];
  top_5_holdings: Constituent[];
}

export interface ETFAnalysisResponse {
  status: 'success';
  data: ETFAnalysisData;
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  error_type: 'INVALID_FILE_ERROR' | 'VALIDATION_ERROR' | 'DATA_NOT_FOUND_ERROR' | 'INTERNAL_SERVER_ERROR';
}