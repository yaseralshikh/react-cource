import { useEffect, useMemo, useState } from "react";
import type { User } from "../services/userService";
import { BiPencil, BiTrash, BiUser, BiSortAlt2, BiChevronUp, BiChevronDown } from "react-icons/bi";

type Props = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  emptyText?: string;
};

export default function UserTable({ users, onEdit, onDelete, emptyText = "No users" }: Props) {
  // Sorting
  const [sortKey, setSortKey] = useState<keyof User | "#">("#");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(key: keyof User | "#") {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    const list = [...users];
    if (sortKey === "#") return list;
    return list.sort((a, b) => {
      const av = (a[sortKey] ?? "").toString().toLowerCase();
      const bv = (b[sortKey] ?? "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, sortKey, sortDir]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [users, pageSize, sortKey, sortDir]);
  const start = (page - 1) * pageSize;
  const current = sorted.slice(start, start + pageSize);

  const headerSortIcon = (key: keyof User | "#") => {
    if (sortKey !== key) return <BiSortAlt2 className="ms-1 opacity-50" />;
    return sortDir === "asc" ? <BiChevronUp className="ms-1" /> : <BiChevronDown className="ms-1" />;
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped align-middle">
        <thead className="position-sticky top-0 bg-body">
          <tr>
            <th style={{ width: 80 }}>
              <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={() => toggleSort("#")}># {headerSortIcon("#")}</button>
            </th>
            <th>
              <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={() => toggleSort("name")}>Name {headerSortIcon("name")}</button>
            </th>
            <th>
              <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={() => toggleSort("email")}>Email {headerSortIcon("email")}</button>
            </th>
            <th style={{ width: 120 }}>
              <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={() => toggleSort("gender")}>Gender {headerSortIcon("gender")}</button>
            </th>
            <th style={{ width: 140 }} className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {current.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted py-5">
                <div className="d-flex flex-column align-items-center gap-2">
                  <BiUser size={28} />
                  <div>{emptyText}</div>
                </div>
              </td>
            </tr>
          )}
          {current.map((u, idx) => (
            <tr key={u.id}>
              <td>{start + idx + 1}</td>
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

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="text-muted small">Showing {sorted.length ? start + 1 : 0}–{Math.min(start + pageSize, sorted.length)} of {sorted.length}</div>
        <div className="d-flex align-items-center gap-2">
          <div className="input-group input-group-sm" style={{ width: 140 }}>
            <span className="input-group-text">Rows</span>
            <select className="form-select" value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value) || 5)}>
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="btn-group btn-group-sm" role="group">
            <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <button className="btn btn-outline-secondary" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
