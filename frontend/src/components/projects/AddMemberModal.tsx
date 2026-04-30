import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { api, unwrap } from "../../lib/api";

interface AddMemberModalContentProps {
  projectId: string;
  onSuccess: () => void;
}

export function AddMemberModalContent({
  projectId,
  onSuccess,
}: AddMemberModalContentProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      await unwrap(api.post(`/api/projects/${projectId}/members`, { email, role }));
      toast.success("Member added successfully");
      setEmail("");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Email Address</label>
        <input
          className="input"
          type="email"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Role</label>
        <div className="flex gap-2">
          {(["MEMBER", "ADMIN"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all border ${
                role === r
                  ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
                  : "bg-glass border-glass text-[var(--text-secondary)] hover:bg-glass-hover"
              }`}
            >
              {r === "ADMIN" ? "Admin" : "Member"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn">
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <UserPlus size={16} />
          )}
          Add Member
        </button>
      </div>
    </form>
  );
}
