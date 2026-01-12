'use client';

import { Suspense } from 'react';
import Loading from './Loading';
import { DreamInfos } from '@/actions/interfaces/DreamInfos';
import DreamPage from './DreamPage';

export default function DreamClient({ dreamInfos }: { dreamInfos: DreamInfos }) {
  return (
    <Suspense fallback={<Loading />}>
      <DreamPage dreamInfos={dreamInfos} />
    </Suspense>
  );
}
