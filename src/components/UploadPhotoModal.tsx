import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Camera, Flame, Swords, Layers } from "lucide-react";
import { getCroppedImg } from "../lib/cropImage";
import { PALOMPON_BARANGAYS } from "../lib/barangays";

export type UploadDestination = "match" | "smash" | "both";

export default function UploadPhotoModal({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (file: File, destination: UploadDestination, barangay: string) => Promise<void>;
}) {
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawPreview, setRawPreview] = useState<string | null>(null);
  const [finalFile, setFinalFile] = useState<File | null>(null);
  const [finalPreview, setFinalPreview] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [destination, setDestination] = useState<UploadDestination>("both");
  const [barangay, setBarangay] = useState(() => localStorage.getItem("lastBarangay") ?? "");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError("");
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
    if (!barangay) {
      setError("Select your barangay.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onUpload(finalFile, destination, barangay);
      onClose();
    } catch (err) {
      setError("Upload didn't go through. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const destinations: { value: UploadDestination; label: string; icon: typeof Swords }[] = [
    { value: "match", label: "Match Card", icon: Swords },
    { value: "smash", label: "Smash or Pass", icon: Flame },
    { value: "both", label: "Both", icon: Layers },
  ];

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center px-4 z-50" onClick={onClose}>
      <div
        className="bg-sand max-w-lg w-full p-7 border border-ink/15"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl mb-4">Post your photo</h3>

        {cropping && rawPreview ? (
          <>
            <div className="relative w-full h-56 bg-ink/10 mb-3">
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
              className="w-full mb-3 accent-coral"
            />
            <button
              onClick={handleConfirmCrop}
              className="w-full bg-coral text-sand py-2.5 font-medium hover:bg-ink transition-colors mb-2"
            >
              Use this crop
            </button>
            <button
              onClick={handleUseWhole}
              className="w-full text-sm text-ink/50 hover:text-ink py-1.5 transition-colors"
            >
              Skip cropping, use whole photo
            </button>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Photo picker — matches the 3:4 crop aspect so preview shows the real result */}
            <label className="shrink-0 cursor-pointer mx-auto sm:mx-0 w-40 sm:w-32">
              <div className="w-40 h-[200px] sm:w-32 sm:h-[170px] border border-dashed border-ink/25 flex items-center justify-center overflow-hidden">
                {finalPreview ? (
                  <img src={finalPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-ink/40 px-2 text-center">
                    <Camera size={26} strokeWidth={1.5} />
                    <span className="text-xs leading-tight">Choose photo</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* Options */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              {rawPreview && (
                <button
                  onClick={() => setCropping(true)}
                  className="text-xs text-coral hover:text-ink transition-colors text-center sm:text-left -mt-1 sm:mt-0"
                >
                  Adjust crop
                </button>
              )}

              <div className="min-w-0">
                <label className="block text-xs text-ink/50 mb-1">Barangay</label>
                <select
                  value={barangay}
                  onChange={(e) => {
                    setBarangay(e.target.value);
                    localStorage.setItem("lastBarangay", e.target.value);
                  }}
                  className="w-full max-w-full border border-ink/20 bg-sand px-2.5 py-2.5 text-sm truncate focus:outline-none focus:border-coral transition-colors"
                >
                  <option value="">Select your barangay</option>
                  {PALOMPON_BARANGAYS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-ink/50 mb-1">Post to</label>
                <div className="grid grid-cols-3 gap-2">
                  {destinations.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDestination(value)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-1 text-[11px] font-medium border transition-colors ${
                        destination === value
                          ? "border-coral bg-coral/10 text-coral"
                          : "border-ink/15 text-ink/50 hover:border-ink/30"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="leading-tight text-center truncate w-full">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!cropping && (
          <>
            {error && <p className="text-xs text-coral mt-3">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-coral text-sand py-2.5 font-medium hover:bg-ink transition-colors mt-4 mb-2 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post to the board"}
            </button>
            <button onClick={onClose} className="w-full text-sm text-ink/50 hover:text-ink py-1.5 transition-colors">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}