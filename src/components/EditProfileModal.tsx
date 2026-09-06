import { useState } from "react";
import { Camera, X } from "lucide-react";
import { uploadToCloudinary } from "../lib/uploadPhoto";
export default function EditProfileModal({
  initialFirstName,
  initialLastName,
  initialPhotoURL,
  onClose,
  onSave,
}: {
  initialFirstName: string;
  initialLastName: string;
  initialPhotoURL: string | null;
  onClose: () => void;
  onSave: (firstName: string, lastName: string, photoURL?: string) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoURL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError("");
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  }
  async function handleSubmit() {
    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let photoURL: string | undefined;
      if (photoFile) {
        photoURL = await uploadToCloudinary(photoFile);
      }
      await onSave(firstName.trim(), lastName.trim(), photoURL);
      onClose();
    } catch (err) {
      setError("Couldn't save. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center px-4 sm:px-6 z-50" onClick={onClose}>
      <div
        className="bg-sand max-w-sm w-full p-6 sm:p-7 border border-ink/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">Edit your profile</h3>
          <button onClick={onClose} aria-label="Close" className="text-ink/50 hover:text-ink transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex justify-center mb-5">
          <label className="relative cursor-pointer group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-ink/15 bg-ink/5 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-3xl text-ink/30">
                  {firstName?.[0] ?? "U"}
                </span>
              )}
              <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center rounded-full">
                <Camera size={20} className="text-sand opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
            <span className="absolute bottom-0 right-0 bg-coral text-sand rounded-full p-1.5 border-2 border-sand">
              <Camera size={12} />
            </span>
            <input type="file" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>
        <p className="text-xs text-ink/50 mb-4 text-center sm:text-left">
          This is the name and photo shown on the leaderboard and in votes — they don't have to match your Google account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-ink/50 mb-1">First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-ink/20 bg-sand px-3 py-2.5 text-sm focus:outline-none focus:border-coral transition-colors"
              placeholder="Juan"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-ink/50 mb-1">Last name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-ink/20 bg-sand px-3 py-2.5 text-sm focus:outline-none focus:border-coral transition-colors"
              placeholder="Dela Cruz"
            />
          </div>
        </div>
        {error && <p className="text-xs text-coral mt-3">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-coral text-sand py-2.5 font-medium hover:bg-ink transition-colors mt-4 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}