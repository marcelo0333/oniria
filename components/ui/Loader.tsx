export default function Loader() {
    return (
        <div className="w-full gap-x-2 flex justify-center items-center">
            <div
                className="w-2 bg-[#d991c2] animate-pulse h-2 rounded-full animate-bounce"
            ></div>
            <div
                className="w-2 animate-pulse h-2 bg-[#9869b8] rounded-full animate-bounce"
            ></div>
            <div
                className="w-2 h-2 animate-pulse bg-[#6756cc] rounded-full animate-bounce"
            ></div>
        </div>
    );
}