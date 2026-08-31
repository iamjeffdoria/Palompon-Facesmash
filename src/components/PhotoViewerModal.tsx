import { X } from "lucide-react";

export default function PhotoViewerModal({
  photoURL,
  name,
  barangay,
  onClose,
}: {
  photoURL: string;
  name: string;
  barangay: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-ink/80 flex items-center justify-center px-4 z-[60]"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-sand/80 hover:text-sand transition-colors bg-ink/40 hover:bg-ink/60 rounded-full p-2"
      >
        <X size={22} />
      </button>

      <div
        className="max-w-md w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photoURL}
          alt={name}
          className="w-full max-h-[75vh] object-contain border-2 border-sand/20 bg-ink/20"
        />
        <div className="mt-4 text-center">
          <p className="font-display italic text-xl text-sand">{name}</p>
          <p className="text-sm text-sand/60 mt-0.5">{barangay}</p>
        </div>
      </div>
    </div>
  );
}