'use client';

import { useEffect, useState } from 'react';
import DreamComponent from './DreamComponent';
import Loading from './Loading';
import { DreamInfos } from '@/actions/interfaces/DreamInfos';
import { ProcessDreamAction } from '@/actions/process-dream-action';

interface Props {
  dreamInfos: DreamInfos;
}

export default function DreamPage({ dreamInfos }: Props) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generate() {
      const res = await ProcessDreamAction(dreamInfos);
      setResult(res);
      setLoading(false);
    }
    generate();
  }, [dreamInfos]);

  if (loading) return <Loading />;

  return <DreamComponent dreamResult={result} />;
}
