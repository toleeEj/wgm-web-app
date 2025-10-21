import { Navigate } from "react-router-dom";
import { useUserRole } from "../hooks/useUserRole";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { role, loading } = useUserRole();

  if (loading) return <p>Loading...</p>;
  if (!role) return <Navigate to="/auth" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return children;
}
