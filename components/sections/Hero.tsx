"use client";

import React from 'react'
import Button from '../ui/Button';
import { FormComponent } from '../ui/FormComponent';
import { Modal } from '../ui/Modal';
import { DreamInfos } from '@/actions/interfaces/DreamInfos';
import DreamPage from '../ui/DreamPage';


export default function Hero() {

  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalDreamOpen, setModalDreamOpen] = React.useState(false);
  const [dreamInfos, setDreamInfos] = React.useState<DreamInfos | null>(null);

  return (
    <main className="flex min-h-screen w-full z-10 max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-center sm:py-48 sm:px-8">
        <h1 className=" text-5xl mb-4 text-zinc-900 dark:text-zinc-100 sm:text-6xl">
          Welcome to Oniria
        </h1>
        <Button title="Generate Dream" type="button" onClick={() => setModalOpen(true)} />
        <p className="mt-4 mb-4 text-zinc-600 dark:text-zinc-400 sm:text-lg">
          Your journey into the world of dreams starts here, explore and create!
        </p>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <FormComponent onSubmit={(infos) => {
             setDreamInfos(infos);
             setModalOpen(false);
             setModalDreamOpen(true);
             }} />
        </Modal>
        {dreamInfos && modalDreamOpen &&(
        <Modal open onClose={() => setModalDreamOpen(false)}>
          <DreamPage dreamInfos={dreamInfos} />
        </Modal>
      )}
    </main>
  )
}