// استيراد المكونات والأدوات اللازمة من مكتبة react-router-dom
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
// استيراد المكونات الخاصة بالتطبيق
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
// استيراد سياق المصادقة
import { useAuth } from "./context/AuthContext";

// مكون لحماية المسارات التي تتطلب تسجيل الدخول
function ProtectedRoute() {
  // استخراج حالة المصادقة من السياق
  const { isAuthenticated } = useAuth();
  // إذا لم يكن المستخدم مسجل الدخول، يتم توجيهه إلى صفحة تسجيل الدخول
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // إذا كان مسجل الدخول، يتم عرض المحتوى المحمي
  return <Outlet />;
}

// المكون الرئيسي للتطبيق
export default function App() {
  return (
    // إعداد التوجيه في التطبيق
    <BrowserRouter>
      {/* شريط التنقل الثابت في أعلى الصفحة */}
      <Navbar />
      {/* تعريف المسارات المتاحة في التطبيق */}
      <Routes>
        {/* توجيه الصفحة الرئيسية إلى لوحة التحكم */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* مسار صفحة تسجيل الدخول */}
        <Route path="/login" element={<Login />} />
        {/* مسار صفحة إنشاء حساب جديد */}
        <Route path="/register" element={<Register />} />
        {/* المسارات المحمية التي تتطلب تسجيل الدخول */}
        <Route element={<ProtectedRoute />}>
          {/* مسار لوحة التحكم */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        {/* توجيه أي مسار غير معروف إلى الصفحة الرئيسية */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
