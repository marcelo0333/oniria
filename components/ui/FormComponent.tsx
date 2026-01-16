import React, { useEffect } from "react";
import Button from "./Button";
import { param, tr } from "framer-motion/client";
import Select from "./Select";
import { Slider } from "./Slider";
import { DreamInfos } from "@/actions/interfaces/DreamInfos";
import { type } from '../../.next/dev/types/routes';

interface Props {
    onSubmit: (infos: DreamInfos) => void;
}

export function FormComponent({ onSubmit }: Props) {

    const [openSelect, setOpenSelect] = React.useState<string>("");

      function openSelectFunction(type: boolean, selected: boolean) {
        type = true;
        if (!type && selected) {
            setOpenSelect("");
        }
    }
    const [intensity] = React.useState(5);
    const [infos, setInfos] = React.useState<DreamInfos>({
        type: "",
        description: "",
        emotion: "",
        scenerie: "",
        intensity: intensity,
    });
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(infos);
    }
    return (
        <form className="flex flex-col" onSubmit={handleSubmit}>
            <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium text-gray-700 dark:text-gray-300">Description</span>
                <textarea
                    className="rounded-2xl px-3 py-2 border border-gray-300 p-2 mb-2"
                    value={infos.description}
                    onChange={(e) => setInfos({ ...infos, description: e.target.value })}
                    placeholder="Describe your dream in detail"
                />
            </label>
            <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium text-gray-700 dark:text-gray-300">Type Dream</span>
                <Select
                id="type"
                label="Select dream type"
                options={[
                    { label: "Lucid", value: "lucid" },
                    { label: "Adventure", value: "adventure" },
                    { label: "Fantasy", value: "fantasy" },
                    { label: "Nightmare", value: "nightmare" },
                ]}
                onChange={(value) => {
                    setInfos({ ...infos, type: value });
                    openSelectFunction(false, openSelect === "type");
                }}
                isOpen={openSelect === "type"}
                onToggle={() => setOpenSelect(openSelect === "type" ? "" : "type")}

                />
            </label>
            <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium text-gray-700 dark:text-gray-300">Emotion</span>
                <Select
                id="emotion"
                label="Select emotion"
                options={[
                    { label: "Calm", value: "calm" },
                    { label: "Happy", value: "happy" },
                    { label: "Intense", value: "intense" },
                    { label: "Confortable", value: "confortable" },
                    { label: "Hopelles", value: "hopelles" },
                    { label: "Anxious", value: "anxious" },
                ]}
                onChange={(value) => {
                    setInfos({ ...infos, emotion: value });
                    openSelectFunction(false, openSelect === "emotion");
                }}
                isOpen={openSelect === "emotion"}
                onToggle={() => setOpenSelect(openSelect === "emotion" ? "" : "emotion")}
                />
            </label>
            <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium text-gray-700 dark:text-gray-300 ">Scenerie</span>
                <textarea
                    className="rounded-2xl px-3 py-2 border border-gray-300 p-2  mb-2"
                    value={infos.scenerie}
                    onChange={(e) => setInfos({ ...infos, scenerie: e.target.value })}
                    placeholder="Describe your dream scenerie in detail e.g., a forest, a bustling city, a serene beach."
                />
            </label>
            <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium text-gray-700 dark:text-gray-300">Surrealism</span>
                <Slider label="Surrealism" value={infos.intensity} min={0} max={10} step={1} onChange={(value) => setInfos({ ...infos, intensity: value })} />
            </label>
            <div className="flex justify-center mt-2">
                <Button title="Submit" type="submit" />
            </div>
        </form>
    );
}