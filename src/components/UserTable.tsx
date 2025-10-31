import type { User } from "../services/userService";
import { BiPencil, BiTrash, BiUser } from "react-icons/bi";

type Props = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  emptyText?: string;
};

export default function UserTable({ users, onEdit, onDelete, emptyText = "No users" }: Props) {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-modern align-middle">
        <thead>
          <tr>
            <th style={{ width: 80 }}>#</th>
            <th>Name</th>
            <th>Email</th>
            <th style={{ width: 120 }}>Gender</th>
            <th style={{ width: 140 }} className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted py-5">
                <div className="d-flex flex-column align-items-center gap-2">
                  <BiUser size={28} />
                  <div>{emptyText}</div>
                </div>
              </td>
            </tr>
          )}
          {users.map((u, idx) => (
            <tr key={u.id}>
              <td>{idx + 1}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                {u.gender ? (
                  <span className={`badge ${u.gender === 'male' ? 'badge-male' : 'badge-female'}`}>
                    {u.gender === 'male' ? 'Male' : 'Female'}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="text-end">
                <div className="btn-group">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(u)} title="Edit">
                    <BiPencil />
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(u)} title="Delete">
                    <BiTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
