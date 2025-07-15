// Server-side utility functions for token estimation and cost calculation

// Utility function to estimate token count (rough approximation)
export const estimateTokenCount = (text: string): number => {
  // Rough estimation: ~4 characters per token for English text
  // This is an approximation - actual tokenization may vary
  return Math.ceil(text.length / 4);
};

// Gemini 2.0 Flash Exp pricing (what it would cost on paid tier)
export const GEMINI_PRICING = {
  inputPrice: 0.10, // $0.10 per 1M tokens
  outputPrice: 0.40, // $0.40 per 1M tokens (including thinking tokens)
};

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface CostCalculation {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export const calculateTokenCost = (tokenUsage: TokenUsage): CostCalculation => {
  // Calculate costs (per 1M tokens) using Gemini pricing
  const inputCost = (tokenUsage.inputTokens / 1_000_000) * GEMINI_PRICING.inputPrice;
  const outputCost = (tokenUsage.outputTokens / 1_000_000) * GEMINI_PRICING.outputPrice;
  const totalCost = inputCost + outputCost;

  return {
    inputCost,
    outputCost,
    totalCost
  };
};

export const logTokenCostAnalysis = (tokenUsage: TokenUsage) => {
  const cost = calculateTokenCost(tokenUsage);
  
  console.log('💰 API Cost Analysis:');
  console.log(`📥 Input tokens: ${tokenUsage.inputTokens.toLocaleString()} | Cost: $${cost.inputCost.toFixed(6)}`);
  console.log(`📤 Output tokens: ${tokenUsage.outputTokens.toLocaleString()} | Cost: $${cost.outputCost.toFixed(6)}`);
  console.log(`💵 Total cost for processing: $${cost.totalCost.toFixed(6)}`);
  console.log('ℹ️  Note: Currently on free tier, but showing what it would cost on paid tier');
  
  return cost;
};