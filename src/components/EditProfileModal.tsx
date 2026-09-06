import { useState } from "react";
import { X } from "lucide-react";

export default function EditProfileModal({
  initialFirstName,
  initialLastName,
  onClose,
  onSave,
}: {
  initialFirstName: string;
  initialLastName: string;
  onClose: () => void;
  onSave: (firstName: string, lastName: string) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSave(firstName.trim(), lastName.trim());
      onClose();
    } catch (err) {
      setError("Couldn't save. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center px-6 z-50" onClick={onClose}>
      <div
        className="bg-sand max-w-sm w-full p-7 border border-ink/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">Edit your name</h3>
          <button onClick={onClose} aria-label="Close" className="text-ink/50 hover:text-ink transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-ink/50 mb-4">
          This is the name shown on the leaderboard and in votes — it doesn't have to match your Google account.
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink/50 mb-1">First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-ink/20 bg-sand px-3 py-2.5 text-sm focus:outline-none focus:border-coral transition-colors"
              placeholder="Juan"
            />
          </div>
          <div>
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
          {loading ? "Saving..." : "Save name"}
        </button>
      </div>
    </div>
  );
}