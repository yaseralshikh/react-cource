import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { User } from "../services/userService";

type Props = {
  initial?: Partial<User>;
  onSubmit: (data: Omit<User, "id">) => Promise<void> | void;
  onCancel?: () => void;
};

export default function UserForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [gender, setGender] = useState<User["gender"]>(initial?.gender ?? undefined);

  useEffect(() => {
    setName(initial?.name ?? "");
    setEmail(initial?.email ?? "");
  }, [initial?.name, initial?.email]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, email, gender });
  };

  return (
    <form onSubmit={handleSubmit} className="vstack gap-3">
      <div>
        <label className="form-label">Name</label>
        <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="form-label">Email</label>
        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="form-label">Gender</label>
        <select className="form-select" value={gender ?? ""} onChange={(e) => setGender((e.target.value || undefined) as any)}>
          <option value="">Not specified</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit">Save</button>
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
