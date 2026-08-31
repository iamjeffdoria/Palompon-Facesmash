import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Camera, Flame } from "lucide-react";
import { getCroppedImg } from "../lib/cropImage";

export default function UploadPhotoModal({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (file: File, includeInSmashOrPass: boolean) => Promise<void>;
}) {
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawPreview, setRawPreview] = useState<string | null>(null);
  const [finalFile, setFinalFile] = useState<File | null>(null);
  const [finalPreview, setFinalPreview] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [includeSmash, setIncludeSmash] = useState(true);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setRawFile(f);
    setRawPreview(URL.createObjectURL(f));
    setFinalFile(f);
    setFinalPreview(URL.createObjectURL(f));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirmCrop() {
    if (!rawPreview || !croppedAreaPixels || !rawFile) return;
    try {
      const blob = await getCroppedImg(rawPreview, croppedAreaPixels);
      const cropped = new File([blob], rawFile.name, { type: blob.type });
      setFinalFile(cropped);
      setFinalPreview(URL.createObjectURL(blob));
      setCropping(false);
    } catch (err) {
      setError("Couldn't crop that photo. Try again.");
      console.error(err);
    }
  }

  function handleUseWhole() {
    if (!rawFile || !rawPreview) return;
    setFinalFile(rawFile);
    setFinalPreview(rawPreview);
    setCropping(false);
  }

  async function handleSubmit() {
    if (!finalFile) {
      setError("Pick a photo first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onUpload(finalFile, includeSmash);
      onClose();
    } catch (err) {
      setError("Upload didn't go through. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center px-6 z-50" onClick={onClose}>
      <div className="bg-sand max-w-sm w-full p-8 border border-ink/15" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-2xl mb-3">Post your photo</h3>

        {cropping && rawPreview ? (
          <>
            <div className="relative w-full h-64 bg-ink/10 mb-3">
              <Cropper
                image={rawPreview}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full mb-4 accent-coral"
            />
            <button
              onClick={handleConfirmCrop}
              className="w-full bg-coral text-sand py-3 font-medium hover:bg-ink transition-colors mb-2"
            >
              Use this crop
            </button>
            <button
              onClick={handleUseWhole}
              className="w-full text-sm text-ink/50 hover:text-ink py-2 transition-colors"
            >
              Skip cropping, use whole photo
            </button>
          </>
        ) : (
          <>
            <label className="block mb-4 cursor-pointer">
              <div className="w-full max-w-[200px] mx-auto aspect-[3/4] border border-dashed border-ink/25 flex items-center justify-center overflow-hidden mb-2">
                {finalPreview ? (
                  <img src={finalPreview} alt="" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-ink/40 px-4 text-center">
                    <Camera size={28} strokeWidth={1.5} />
                    <span className="text-sm">Tap to choose a photo</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            {rawPreview && (
              <button
                onClick={() => setCropping(true)}
                className="w-full text-sm text-coral hover:text-ink transition-colors mb-3"
              >
                Adjust crop
              </button>
            )}

            <label className="flex items-start gap-3 mb-4 p-3 border border-ink/15 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSmash}
                onChange={(e) => setIncludeSmash(e.target.checked)}
                className="mt-0.5 accent-coral"
              />
              <span className="text-sm">
                <span className="font-medium flex items-center gap-1.5">
                  <Flame size={14} className="text-coral" />
                  Also add to Smash or Pass
                </span>
                <span className="text-ink/50 block mt-0.5">
                  Your photo shows up in the swipe deck too, separate from your VS matchup.
                </span>
              </span>
            </label>

            {error && <p className="text-xs text-coral mb-3">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-coral text-sand py-3 font-medium hover:bg-ink transition-colors mb-3 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post to the board"}
            </button>
            <button onClick={onClose} className="w-full text-sm text-ink/50 hover:text-ink py-2 transition-colors">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}