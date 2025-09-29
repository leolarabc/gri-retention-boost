import { useState, useEffect } from 'react';
import { getRiskMetrics, getMembers, getActionItems, syncPactoData, calculateRiskScores, generateActionItems } from '@/lib/api';

export function useRiskMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    const result = await getRiskMetrics();
    if (result.error) {
      setError(result.error);
    } else {
      setMetrics(result.data);
      setError(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, isLoading, error, refetch: fetchMetrics };
}

export function useMembers() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    setIsLoading(true);
    const result = await getMembers();
    if (result.error) {
      setError(result.error);
    } else {
      setMembers(result.data || []);
      setError(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return { members, isLoading, error, refetch: fetchMembers };
}

export function useActionItems() {
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = async () => {
    setIsLoading(true);
    const result = await getActionItems();
    if (result.error) {
      setError(result.error);
    } else {
      setActions(result.data || []);
      setError(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchActions();
  }, []);

  return { actions, isLoading, error, refetch: fetchActions };
}

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const syncData = async (type: 'members' | 'checkins' | 'stats') => {
    setIsSyncing(true);
    try {
      const result = await syncPactoData(type);
      if (result.error) {
        throw new Error(result.error);
      }
      setLastSync(new Date());
      return result.data;
    } finally {
      setIsSyncing(false);
    }
  };

  const calculateRisk = async () => {
    setIsSyncing(true);
    try {
      const result = await calculateRiskScores();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    } finally {
      setIsSyncing(false);
    }
  };

  const generateActions = async () => {
    setIsSyncing(true);
    try {
      const result = await generateActionItems();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    lastSync,
    syncData,
    calculateRisk,
    generateActions
  };
}