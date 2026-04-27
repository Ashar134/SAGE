import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { isAuthenticated, loading, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(false);

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoadingBtn(true);
    setError("");
    const res = login(username.trim(), password);
    if (res.success) {
      navigate("/", { replace: true });
    } else {
      setError(res.error || "Login failed");
    }
    setLoadingBtn(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-width-sm max-w-md rounded-xl border bg-white shadow-sm p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">Sign in</h1>
          <p className="text-sm text-gray-500">HR dashboard access</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loadingBtn}
            className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60"
          >
            {loadingBtn ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
