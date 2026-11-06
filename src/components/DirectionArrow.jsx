import { FaRedo } from "react-icons/fa";

export default function DirectionArrow({ direction = 1 }) {
    const reversed = direction === -1;
    return (
        <div className="flex items-center gap-2 text-white text-sm" role="status">
            <FaRedo
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
                style={{
                    animationDuration: "6s",
                    animationDirection: reversed ? "reverse" : "normal",
                    color: reversed ? "#F59E0B" : "#056FA4",
                }}
            />
            <span>{reversed ? "Play reversed" : "Normal order"}</span>
        </div>
    );
}