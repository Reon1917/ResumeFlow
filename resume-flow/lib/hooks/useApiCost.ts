"use client"
import { useState, useCallback } from 'react';
import { TokenUsage, CostCalculation, calculateTokenCost } from '../utils/tokenUtils';

export const useApiCost = () => {
  const [totalSessionCost, setTotalSessionCost] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  const calculateCost = useCallback((tokenUsage: TokenUsage): CostCalculation => {
    return calculateTokenCost(tokenUsage);
  }, []);

  const logCostAnalysis = useCallback((tokenUsage: TokenUsage) => {
    const cost = calculateCost(tokenUsage);
    
    console.log('💰 API Cost Analysis:');
    console.log(`📥 Input tokens: ${tokenUsage.inputTokens.toLocaleString()} | Cost: $${cost.inputCost.toFixed(6)}`);
    console.log(`📤 Output tokens: ${tokenUsage.outputTokens.toLocaleString()} | Cost: $${cost.outputCost.toFixed(6)}`);
    console.log(`💵 Total cost for processing: $${cost.totalCost.toFixed(6)}`);
    console.log('ℹ️  Note: Currently on free tier, but showing what it would cost on paid tier');
    
    // Update session totals
    setTotalSessionCost(prev => prev + cost.totalCost);
    setRequestCount(prev => prev + 1);
    
    return cost;
  }, [calculateCost]);

  const getSessionSummary = useCallback(() => {
    console.log('📊 Session Summary:');
    console.log(`🔢 Total requests: ${requestCount}`);
    console.log(`💰 Total session cost: $${totalSessionCost.toFixed(6)}`);
    console.log(`� Avesrage cost per request: $${requestCount > 0 ? (totalSessionCost / requestCount).toFixed(6) : '0.000000'}`);
  }, [totalSessionCost, requestCount]);

  const resetSession = useCallback(() => {
    setTotalSessionCost(0);
    setRequestCount(0);
    console.log('🔄 API cost tracking reset');
  }, []);

  return {
    calculateCost,
    logCostAnalysis,
    getSessionSummary,
    resetSession,
    totalSessionCost,
    requestCount
  };
};