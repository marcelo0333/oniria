"use client";

import React from 'react'
import Button from '../ui/Button';
import { FormComponent } from '../ui/FormComponent';
import { Modal } from '../ui/Modal';
import { DreamInfos } from '@/actions/interfaces/DreamInfos';
import DreamPage from '../ui/DreamPage';
import Header from '../ui/Header';
import Footer from '../ui/Footer';
import DreamComponent from '../ui/DreamComponent';
import { title } from 'process';

interface Props {
  user: {
    id: string | undefined;
    name: string | undefined;
    email: string | undefined;
  } | undefined | null;
}

export default function Hero({ user }: Props) {

  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalDreamOpen, setModalDreamOpen] = React.useState(false);
  const [dreamInfos, setDreamInfos] = React.useState<DreamInfos | null>(null);
  const isLoggedIn = !!user;
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-linear-to-b from-white/50 to-purple-100/20 dark:from-black/50 dark:to-purple-900/20">
      <div className="flex min-h-screen min-w-screen z-10 max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-center sm:py-48 sm:px-8">
          <Header user={user}/>
           {user ? (
                <h1 className='text-4xl text-zinc-300'>Welcome back, {user.name}!</h1>
            ) : (
                <h1 className='text-4xl text-zinc-300'>Welcome to Oniria</h1>
            )}
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
            <DreamPage dreamInfos={dreamInfos} isLoggedIn={isLoggedIn} />
          </Modal>
        )}
        </div>
        <Footer />
    </main>

  )
}