import { useEffect, useState } from "react";
import { CheckCircle2, LogOut, X } from "lucide-react";

export interface ToastData {
  message: string;
  type?: "success" | "info";
}

export default function Toast({
  toast,
  onClose,
}: {
  toast: ToastData | null;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const dismissTimer = setTimeout(() => setVisible(false), 3000);
    const removeTimer = setTimeout(onClose, 3300);
    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(removeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  if (!toast) return null;

  const Icon = toast.type === "info" ? LogOut : CheckCircle2;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <div className="flex items-start gap-2.5 bg-ink text-sand pl-4 pr-3 py-3 shadow-lg max-w-[90vw]">
        <Icon size={18} className="text-teal shrink-0 mt-0.5" />
        <span className="text-sm font-medium">{toast.message}</span>
        <button
          onClick={() => setVisible(false)}
          aria-label="Dismiss"
          className="text-sand/50 hover:text-sand transition-colors shrink-0 ml-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}