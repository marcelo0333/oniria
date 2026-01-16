'use client';

import { useEffect, useState, useTransition } from 'react';
import DreamComponent from './DreamComponent';
import Loading from './Loading';
import { DreamInfos } from '@/actions/interfaces/DreamInfos';
import { ProcessDreamAction } from '@/actions/process-dream-action';
import { saveDreamAction } from '@/actions/save-dream-action';

interface Props {
  dreamInfos: DreamInfos;
  isLoggedIn?: boolean;
}

export default function DreamPage({ dreamInfos, isLoggedIn }: Props) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    async function generate() {
      const res = await ProcessDreamAction(dreamInfos);
      setResult(res);
      setLoading(false);
    }
    generate();
  }, [dreamInfos]);

  if (loading) return <Loading />;
  async function handleSave() {
    startTransition(async () => {
      await saveDreamAction(dreamInfos, result);
    });
  }
  return <DreamComponent dreamResult={result} onSave={handleSave}  isPending={isPending} isLoggedIn={isLoggedIn} />;
}


