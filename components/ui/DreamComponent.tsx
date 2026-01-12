import React, { useEffect } from 'react'
import ImageFull from './ImageFull';
import { GenerateImage } from '@/actions/generate-image-get';
import Loading from './Loading';

interface Props {
    dreamResult: {
        interpretation: string;
        keySymbolism: string;
        imagesPrompts: {
            finalSceneImageUrl: undefined;
            finalEmotionImageUrl: undefined;
};
    }
}

export default function DreamComponent({ dreamResult }: Props  ) {

    const [openImage, setOpenImage] = React.useState<{img: string | undefined; title: string} | null>(null);


     return (
    <div className="flex w-full flex-col gap-5 animate-fade-in">
        <div className="flex justify-center items-center">
            <h2 className="text-2xl font-[var(--font-playfair)] text-zinc-100 ">Your Dream Interpretation</h2>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 shadow-lg">
            <p className="text-zinc-300">{dreamResult?.interpretation}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Dream Scene</h3>
            {dreamResult.imagesPrompts.finalSceneImageUrl && (
                <img
                    src={dreamResult.imagesPrompts.finalSceneImageUrl || undefined}
                    alt="Dream Scene"
                    className="rounded-lg shadow-md cursor-zoom-in"
                    onClick={() =>
                    setOpenImage({
                        img: dreamResult.imagesPrompts.finalSceneImageUrl || undefined,
                        title: "Dream Scene",
                    })
                    }
                />
            )}
  
            </div>
            <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">Emotional Abstract</h3>
                {dreamResult.imagesPrompts.finalEmotionImageUrl && (
                    <img
                        src={dreamResult.imagesPrompts.finalEmotionImageUrl || undefined}
                        alt="Emotional Abstract"
                        className="rounded-lg shadow-md cursor-zoom-in"
                        onClick={() =>
                        setOpenImage({
                            img: dreamResult.imagesPrompts.finalEmotionImageUrl || undefined,
                            title: "Emotional Abstract",
                        })
                        }
                    />
                )}

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
            <h2 className="text-2xl font-[var(--font-playfair)] text-zinc-100 ">Simbolism</h2>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 shadow-lg">
            <p className="text-zinc-300"> {dreamResult?.keySymbolism} </p>
        </div>
    </div>
  )
}
