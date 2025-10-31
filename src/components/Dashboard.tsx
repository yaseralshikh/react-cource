import { useEffect, useMemo, useState } from "react";
import { userService, type User } from "../services/userService";
import UserTable from "./UserTable";
import UserForm from "./UserForm";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { BiSearch } from "react-icons/bi";

const MySwal = withReactContent(Swal);

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [q, setQ] = useState("");
  const [gender, setGender] = useState<"" | "male" | "female">("");


  const load = async () => {
    setLoading(true);
    const list = await userService.list();
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addUser = async (payload: Omit<User, "id">) => {
    await userService.create(payload);
    await load();
    MySwal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "User created",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  };

  const updateUser = async (payload: Omit<User, "id">) => {
    if (!editing) return;
    await userService.update(editing.id, payload);
    setEditing(null);
    setShowEdit(false);
    await load();
    MySwal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "User updated",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  };

  const removeUser = async (u: User) => {
    const result = await MySwal.fire({
      title: <p>Delete {u.name}?</p>,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    });
    if (!result.isConfirmed) return;
    await userService.remove(u.id);
    await load();
    MySwal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "User deleted",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = users.filter((u) =>
      term ? (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)) : true
    );
    return list.filter((u) => (gender ? u.gender === gender : true));
  }, [users, q, gender]);

  return (
    <div className="container py-4">
      <div className="app-hero rounded-3 p-4 mb-4 text-white">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
          <div>
            <h2 className="h4 mb-1">User Dashboard</h2>
            <p className="mb-0 opacity-75">Manage users with quick actions</p>
          </div>
          <div className="d-flex gap-2">
            <span className="chip">Total {users.length}</span>
            <span className="chip">Showing {filtered.length}</span>
          </div>
        </div>
      </div>

      <div className="row align-items-center g-3 mb-3">
        <div className="col-12 col-md-6 col-lg-5">
          <label className="form-label small text-muted">Search (name or email)</label>
          <div className="position-relative">
            <BiSearch className="search-icon" />
            <input
              className="form-control ps-5"
              placeholder="Type to filter..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="col-12 col-md-3 col-lg-3">
          <label className="form-label small text-muted">Gender</label>
          <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value as any)}>
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="col-12 col-md-auto ms-auto text-md-end">
          <button className="btn btn-gradient" onClick={() => setShowAdd(true)}>Add User</button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              {loading ? (
                <div className="text-muted">Loading...</div>
              ) : (
                <UserTable
                  users={filtered}
                  onEdit={(u) => { setEditing(u); setShowEdit(true); }}
                  onDelete={removeUser}
                  emptyText={users.length === 0 ? "No users yet" : "No results"}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add User</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAdd(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <UserForm onSubmit={async (p) => { await addUser(p); setShowAdd(false); }} />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {showEdit && editing && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit User</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => { setShowEdit(false); setEditing(null); }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <UserForm
                    initial={editing}
                    onSubmit={async (p) => { await updateUser(p); setShowEdit(false); }}
                    onCancel={() => { setShowEdit(false); setEditing(null); }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}
