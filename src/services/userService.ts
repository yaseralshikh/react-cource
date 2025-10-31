// تعريف نوع البيانات للمستخدم
export type User = {
  id: number; // معرف فريد للمستخدم
  name: string; // اسم المستخدم
  email: string; // البريد الإلكتروني للمستخدم
  gender?: "male" | "female"; // جنس المستخدم (اختياري)
};

// المفتاح المستخدم لتخزين المستخدمين في localStorage
const USERS_KEY = "users";

// دالة مساعدة لقراءة المستخدمين من التخزين المحلي
function readUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [];
}

// دالة مساعدة لكتابة المستخدمين إلى التخزين المحلي
function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// خدمة إدارة المستخدمين
export const userService = {
  // استرجاع قائمة جميع المستخدمين
  async list(): Promise<User[]> {
    return readUsers();
  },

  // إنشاء مستخدم جديد
  // @param payload - بيانات المستخدم الجديد (بدون معرف)
  async create(payload: Omit<User, "id">): Promise<User> {
    const users = readUsers();
    // توليد معرف جديد (أكبر معرف موجود + 1)
    const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser: User = { id, ...payload };
    users.push(newUser);
    writeUsers(users);
    return newUser;
  },

  // تحديث بيانات مستخدم موجود
  // @param id - معرف المستخدم المراد تحديثه
  // @param patch - البيانات الجديدة المراد تحديثها
  async update(id: number, patch: Partial<Omit<User, "id">>): Promise<User> {
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("User not found");
    users[idx] = { ...users[idx], ...patch };
    writeUsers(users);
    return users[idx];
  },

  // حذف مستخدم
  // @param id - معرف المستخدم المراد حذفه
  async remove(id: number): Promise<void> {
    const users = readUsers();
    const next = users.filter((u) => u.id !== id);
    writeUsers(next);
  },
};
