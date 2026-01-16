import React, { useEffect } from 'react'
import ImageFull from './ImageFull';
import { GenerateImage } from '@/actions/generate-image-get';
import Loading from './Loading';
import Loader from './Loader';
import { DownloadIcon, SaveIcon, ShareIcon } from 'lucide-react';
import ButtonAction from './ButtonAction';

interface Props {
    dreamResult: {
        title: string;
        interpretation: string;
        keySymbolism: string;
        warnings: string,
        luckNumbers: string,
        imagesPrompts: {
            finalSceneImageUrl: undefined;
            finalEmotionImageUrl: undefined;
};
    }
    onSave: () => Promise<void>;
    isPending?: boolean;
    isLoggedIn?: boolean;
}

export default function DreamComponent({ dreamResult, onSave, isPending, isLoggedIn }: Props  ) {

    const [openImage, setOpenImage] = React.useState<{img: string | undefined; title: string} | null>(null);


     return (
    <div className="flex w-full flex-col gap-5 animate-fade-in">
        <div className="flex justify-end gap-2 items-center">
        <ButtonAction mainColor="indigo" nameAction="save" onClick={onSave} disabled={isPending || !isLoggedIn} loggedIn={isLoggedIn}><SaveIcon /></ButtonAction>
        <ButtonAction mainColor="purple" nameAction="download" disabled={isPending || !isLoggedIn} loggedIn={isLoggedIn}><DownloadIcon /></ButtonAction>
        <ButtonAction mainColor="pink" nameAction="share" disabled={isPending || !isLoggedIn} loggedIn={isLoggedIn}><ShareIcon /></ButtonAction>
        </div>
        <div className="flex justify-center items-center">
            <h2 className="text-xl font-[var(--font-playfair)] text-zinc-100 ">Dream Interpretation</h2>
        </div>
        <div className="flex justify-center items-center">
            <h2 className="text-xl font-[var(--font-playfair)] text-zinc-100 ">{dreamResult?.title}</h2>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 shadow-lg">
            <p className="text-zinc-300">{dreamResult?.interpretation}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Dream Scene</h3>
          {dreamResult.imagesPrompts.finalSceneImageUrl ? (
                    <img
                        src={dreamResult.imagesPrompts.finalSceneImageUrl}
                        alt="Dream Scene"
                        className="rounded-lg shadow-md cursor-zoom-in hover:opacity-90 transition"
                        onClick={() => setOpenImage({
                            img: dreamResult.imagesPrompts.finalSceneImageUrl,
                            title: "Dream Scene",
                        })}
                    />
                ) : <Loader />}
            </div>
            <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">Emotional Abstract</h3>
                {dreamResult.imagesPrompts.finalEmotionImageUrl ? (
                            <img
                                src={dreamResult.imagesPrompts.finalEmotionImageUrl}
                                alt="Emotional Abstract"
                                className="rounded-lg shadow-md cursor-zoom-in hover:opacity-90 transition"
                                onClick={() => setOpenImage({
                                    img: dreamResult.imagesPrompts.finalEmotionImageUrl,
                                    title: "Emotional Abstract",
                                })}
                            />
                        ) : <Loader />}
                    </div>
                {openImage && (
                <ImageFull
                    img={openImage.img}
                    title={openImage.title}
                    onClose={() => setOpenImage(null)}
                />
                )}
        </div>
        <div className="flex justify-center items-center">
            <h2 className="text-xl font-[var(--font-playfair)] text-zinc-100 ">Simbolism</h2>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 shadow-lg">
            <p className="text-zinc-300"> {dreamResult?.keySymbolism} </p>
        </div>
         <div className="flex justify-center items-center">
            <h2 className="text-xl font-[var(--font-playfair)] text-zinc-100 ">Warnings</h2>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 shadow-lg">
            <p className="text-zinc-300"> {dreamResult?.warnings} </p>
        </div>
          <div className="flex justify-center items-center">
            <h2 className="text-xl font-[var(--font-playfair)] text-zinc-100 ">Luck Numbers</h2>
        </div>
           <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 shadow-lg">
            <p className="text-zinc-300"> {dreamResult?.luckNumbers} </p>
        </div>
    </div>
  )
}
