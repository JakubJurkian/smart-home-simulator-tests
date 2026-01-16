import { useState, useEffect, useCallback } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

// --- CONFIG & TYPES ---
const API_URL = "http://localhost:5187/api";

export interface Room {
  id: string;
  name: string;
  userId: string;
}

export interface MaintenanceLog {
  id: string;
  deviceId: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Device {
  id: string;
  name: string;
  roomId: string;
  room: Room;
  type: string;
  isOn?: boolean;
  currentTemperature?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface DeviceCardProps {
  device: Device;
  onDelete: (id: string) => void;
  onToggle: (id: string, action: "turn-on" | "turn-off") => void;
  onOpenLogs: (device: Device) => void;
  temp?: number;
}

// --- COMPONENTS ---

const UserProfile = ({
  user,
  onBack,
  onUpdateUser,
  onDeleteAccount, // <--- NEW PROP
}: {
  user: User;
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onDeleteAccount: () => void; // <--- Definition
}) => {
  const [username, setUsername] = useState(user.username);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (isChangingPass && newPassword !== confirmPassword) {
      setMsg({ text: "Passwords do not match!", type: "error" });
      return;
    }

    try {
      const body: { username: string; password?: string } = { username };
      if (isChangingPass && newPassword) {
        body.password = newPassword;
      }

      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update profile.");

      setMsg({ text: "Profile updated successfully!", type: "success" });
      onUpdateUser({ ...user, username });
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPass(false);
    } catch (err) {
      console.log(err);
      setMsg({ text: "Error updating profile.", type: "error" });
    }
  };

  // --- NEW: DELETE LOGIC ---
  const handleDeleteAccount = async () => {
    // 1. Confirmation Dialog
    if (
      !window.confirm(
        "ARE YOU SURE? This action cannot be undone. All your devices and data will be lost permanently."
      )
    ) {
      return;
    }

    try {
      // 2. Call API
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete account.");

      // 3. Logout / Cleanup on frontend
      alert("Account deleted. Goodbye!");
      onDeleteAccount(); // Trigger logout in parent
    } catch (err) {
      console.log(err);
      alert("Error deleting account.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">👤 User Profile</h2>
        <button
          onClick={onBack}
          className="cursor-pointer text-gray-500 hover:text-gray-800 px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 transition text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>

      {msg && (
        <div
          className={`p-3 rounded mb-4 text-center ${
            msg.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Update Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Email (read-only)
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          {!isChangingPass ? (
            <div className="flex gap-4 items-center">
              <input
                type="password"
                value="********"
                disabled
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-400"
              />
              <button
                type="button"
                onClick={() => setIsChangingPass(true)}
                className="whitespace-nowrap px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition cursor-pointer"
              >
                Change Password
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
              />
              <button
                type="button"
                onClick={() => setIsChangingPass(false)}
                className="text-sm text-red-500 hover:underline cursor-pointer"
              >
                Cancel Password Change
              </button>
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-transform active:scale-[0.99] cursor-pointer"
          >
            💾 Save Changes
          </button>
        </div>
      </form>

      {/* --- NEW: DANGER ZONE --- */}
      <div className="mt-12 pt-6 border-t-2 border-red-100">
        <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-red-800">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="whitespace-nowrap px-4 py-2 bg-white border border-red-300 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-bold transition shadow-sm cursor-pointer"
          >
            🗑️ Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

const AuthForm = ({
  onLoginSuccess,
}: {
  onLoginSuccess: (user: User) => void;
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const endpoint = isLoginMode ? "/users/login" : "/users/register";
    const body = isLoginMode
      ? { email, password }
      : { username, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (response.status >= 500) {
        throw new Error("Server is currently unavailable.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials.");
      }

      if (isLoginMode) {
        onLoginSuccess(data);
      } else {
        alert("Registration successful! Please log in.");
        setIsLoginMode(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === "Failed to fetch") {
          setError("Unable to connect to the server. Try again later.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong! Try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          {isLoginMode ? "🔐 Log In" : "📝 Register"}
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center font-medium border border-red-200">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLoginMode && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 border rounded-lg w-full"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-lg w-full"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border rounded-lg w-full"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`py-3 rounded-lg font-bold text-white transition-colors w-full ${
              isLoading
                ? "cursor-not-allowed bg-blue-400"
                : "cursor-pointer bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading
              ? "Connecting..."
              : isLoginMode
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-600">
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className={`${
              isLoading
                ? "cursor-not-allowed"
                : "cursor-pointer hover:underline"
            }  text-blue-600 font-semibold `}
            disabled={isLoading ? true : false}
          >
            {isLoginMode ? "Register here" : "Log in here"}
          </button>
        </p>
      </div>
    </div>
  );
};

const ActionButton = ({
  label,
  onClick,
  disabled,
  color,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  color: "green" | "red";
}) => {
  const baseClass =
    "flex-1 py-2 rounded-md text-sm font-medium transition-colors";
  const activeClass =
    color === "green"
      ? "cursor-pointer bg-green-500 hover:bg-green-600 text-white shadow-sm"
      : "cursor-pointer bg-red-500 hover:bg-red-600 text-white shadow-sm";
  const disabledClass =
    color === "green"
      ? "bg-green-200 text-green-800 cursor-not-allowed opacity-50"
      : "bg-red-200 text-red-800 cursor-not-allowed opacity-50";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${disabled ? disabledClass : activeClass}`}
    >
      {label}
    </button>
  );
};

const MaintenanceModal = ({
  deviceId,
  deviceName,
  onClose,
}: {
  deviceId: string;
  deviceName: string;
  onClose: () => void;
}) => {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // STATE FOR EDITING
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch logs on mount
  useEffect(() => {
    fetch(`${API_URL}/logs/${deviceId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => console.error("Error loading logs:", err));
  }, [deviceId]);

  // Handle Form Submit (Create OR Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) return;

    try {
      if (editingId) {
        const res = await fetch(`${API_URL}/logs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description: desc }),
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to update");

        // Update local list
        setLogs(
          logs.map((log) =>
            log.id === editingId ? { ...log, title, description: desc } : log
          )
        );

        // Exit edit mode
        setEditingId(null);
      } else {
        // --- CREATE LOGIC (POST) ---
        const res = await fetch(`${API_URL}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, title, description: desc }),
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to add");

        // Add to local list
        const newLog: MaintenanceLog = {
          id: Math.random().toString(), // temporary ID
          deviceId,
          title,
          description: desc,
          createdAt: new Date().toISOString(),
        };
        setLogs([newLog, ...logs]);
      }

      // Clear form
      setTitle("");
      setDesc("");
    } catch (err) {
      console.log(err);
      alert("Operation failed. Try again.");
    }
  };

  // Prepare form for editing
  const startEdit = (log: MaintenanceLog) => {
    setEditingId(log.id);
    setTitle(log.title);
    setDesc(log.description);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDesc("");
  };

  // Delete log
  const handleDeleteLog = async (id: string) => {
    if (!confirm("Remove this entry?")) return;
    try {
      await fetch(`${API_URL}/logs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setLogs(logs.filter((l) => l.id !== id));

      if (editingId === id) cancelEdit();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
            🛠️ Service History{" "}
            <span className="text-sm font-normal text-gray-500">
              for {deviceName}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading history...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-gray-400 italic">
              No service logs yet.
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border shadow-sm relative group transition-colors ${
                  editingId === log.id
                    ? "bg-blue-50 border-blue-300 ring-1 ring-blue-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start pr-16">
                  <h4 className="font-bold text-gray-800 text-sm">
                    {log.title}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
                  {log.description}
                </p>

                {/* ACTION BUTTONS */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(log)}
                    className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form (Footer) */}
        <form
          onSubmit={handleSubmit}
          className={`p-4 border-t ${editingId ? "bg-blue-50" : "bg-white"}`}
        >
          {editingId && (
            <div className="flex justify-between items-center mb-2 text-xs font-bold text-blue-600 uppercase tracking-wide">
              <span>Editing Entry</span>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="mb-2">
            <input
              placeholder="Log Title (e.g. Battery Change)"
              className="w-full p-2 border rounded text-sm mb-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Description..."
              className="w-full p-2 border rounded text-sm"
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded font-medium text-sm transition text-white cursor-pointer ${
              editingId
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {editingId ? "💾 Save Changes" : "➕ Add Entry"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- DEVICE CARD ---
const DeviceCard = ({
  device,
  onDelete,
  onToggle,
  temp,
  onOpenLogs,
}: DeviceCardProps) => {
  const isBulb = device.type === "LightBulb";
  const isSensor = device.type === "TemperatureSensor";
  const bgClass = device.isOn
    ? "bg-yellow-50 border-yellow-200"
    : "bg-white border-gray-200";

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(device.name);

  const handleSaveName = async () => {
    if (!editedName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/devices/${device.id}/name`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedName),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to rename");

      // Force page refresh or ideally update parent state.
      // For simplicity in this structure, we just exit edit mode and let SignalR or refresh handle it,
      // OR strictly speaking, we should have an 'onUpdate' prop from App.tsx.
      // BUT, to make it look responsive immediately:
      device.name = editedName; // Direct mutation for instant UI feedback (dirty but works for small apps)
      setIsEditing(false);
    } catch (err) {
      console.log(err);
      alert("Error renaming device");
    }
  };

  const handleCancel = () => {
    setEditedName(device.name);
    setIsEditing(false);
  };

  return (
    <div
      className={`relative p-5 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md ${bgClass}`}
    >
      <div className="flex justify-between items-start mb-2">
        {/* HEADER: NAME OR INPUT */}
        <div className="flex-1 pr-2">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full p-1 border border-blue-300 rounded text-sm font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="text-green-600 hover:bg-green-100 p-1 rounded cursor-pointer"
                title="Save"
              >
                ✓
              </button>
              <button
                onClick={handleCancel}
                className="text-red-500 hover:bg-red-100 p-1 rounded cursor-pointer"
                title="Cancel"
              >
                ✕
              </button>
            </div>
          ) : (
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 truncate group">
              <span>{isBulb ? "💡" : "🌡️"}</span>
              <span className="truncate" title={device.name}>
                {device.name}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity p-1 text-sm cursor-pointer"
                title="Rename"
              >
                ✏️
              </button>
            </h3>
          )}
        </div>

        <div className="flex gap-1 shrink-0 ml-2">
          <button
            onClick={() => onOpenLogs(device)}
            className="cursor-pointer text-gray-400 hover:text-blue-500 transition-colors p-1"
            title="Service Logs"
          >
            🛠️
          </button>
          <button
            onClick={() => onDelete(device.id)}
            className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-1 truncate">
        📍 {device.room?.name || "Unknown"}
      </p>
      <p className="text-xs text-gray-400 font-mono mb-4">
        ID: {device.id.slice(0, 8)}...
      </p>

      {isBulb && (
        <div className="flex gap-2 mt-4">
          <ActionButton
            label="Turn On"
            onClick={() => onToggle(device.id, "turn-on")}
            disabled={!!device.isOn}
            color="green"
          />
          <ActionButton
            label="Turn Off"
            onClick={() => onToggle(device.id, "turn-off")}
            disabled={!device.isOn}
            color="red"
          />
        </div>
      )}

      {isSensor && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">
            Temperature
          </span>
          <span className="text-3xl font-bold text-blue-600 tabular-nums">
            {temp?.toFixed(1) ?? device.currentTemperature?.toFixed(1) ?? "--"}{" "}
            <span className="text-lg text-gray-400">°C</span>
          </span>
        </div>
      )}
    </div>
  );
};

const RoomManager = ({
  rooms,
  onAdd,
  onDelete,
  onRename,
}: {
  rooms: Room[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}) => {
  const [newRoomName, setNewRoomName] = useState("");

  // Stan do edycji: trzymamy ID edytowanego pokoju i jego tymczasową nazwę
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onAdd(newRoomName);
    setNewRoomName("");
  };

  // Rozpoczęcie edycji (kliknięcie w nazwę lub ołówek)
  const startEditing = (room: Room) => {
    setEditingId(room.id);
    setEditName(room.name);
  };

  // Zapisanie edycji (Enter lub przycisk)
  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName);
      setEditingId(null);
    }
  };

  // Anulowanie (Esc)
  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        🏠 Manage Rooms
      </h3>

      <div className="flex flex-wrap gap-3 mb-6">
        {rooms.length === 0 && (
          <span className="text-gray-400 text-sm italic">
            No rooms created yet.
          </span>
        )}

        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-blue-100 shadow-sm transition-all hover:shadow-md"
          >
            {editingId === room.id ? (
              <div className="flex items-center gap-1">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="w-24 p-1 text-xs border border-blue-300 rounded bg-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className="text-green-600 hover:text-green-800 cursor-pointer"
                >
                  ✓
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <span
                  onDoubleClick={() => startEditing(room)}
                  className="cursor-pointer select-none"
                  title="Double click to edit"
                >
                  {room.name}
                </span>

                <button
                  onClick={() => startEditing(room)}
                  className="text-blue-300 hover:text-blue-600 cursor-pointer ml-1"
                >
                  ✏️
                </button>

                <span className="text-blue-200">|</span>

                <button
                  onClick={() => onDelete(room.id)}
                  className="text-red-300 hover:text-red-500 font-bold leading-none cursor-pointer text-lg"
                  title="Delete Room & All Devices inside"
                >
                  &times;
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleAddSubmit} className="flex gap-2 border-t pt-4">
        <input
          type="text"
          placeholder="New Room Name..."
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          Add Room
        </button>
      </form>
    </div>
  );
};

const DeviceForm = ({
  rooms,
  onAdd,
}: {
  rooms: Room[];
  onAdd: (name: string, roomId: string, type: string) => void;
}) => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [type, setType] = useState("LightBulb"); // Changed to match C# discriminator exact string just in case, or lowercase handling

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) {
      alert("Please select a room first!");
      return;
    }
    onAdd(name, roomId, type);
    setName("");
    // We keep the room selected for easier multiple additions
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        ➕ Add New Device
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        {/* Name Input */}
        <input
          placeholder="Device Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 p-2 border border-gray-300 rounded-lg w-full"
        />

        {/* Room Select (Dropdown) */}
        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
          className="flex-1 p-2 border border-gray-300 rounded-lg bg-white w-full"
        >
          <option value="" disabled>
            -- Select Room --
          </option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        {/* Type Select */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg bg-white w-full sm:w-auto"
        >
          <option value="LightBulb">💡 Light Bulb</option>
          <option value="TemperatureSensor">🌡️ Temp Sensor</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition-colors w-full sm:w-auto"
        >
          Add
        </button>
      </form>
    </div>
  );
};

// --- MAIN APP ---

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [temps, setTemps] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedDeviceForLogs, setSelectedDeviceForLogs] =
    useState<Device | null>(null);

  const [view, setView] = useState<"dashboard" | "profile">("dashboard");
  const lightbulbs = devices.filter((d) => d.type === "LightBulb");
  const sensors = devices.filter((d) => d.type === "TemperatureSensor");

  const showError = (message: string) => {
    setActionError(message);
    setTimeout(() => setActionError(null), 3000);
  };

  const fetchDevices = useCallback(() => {
    fetch(`${API_URL}/devices`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          setUser(null);
          throw new Error("Session expired.");
        }
        if (!res.ok) throw new Error("Failed to fetch devices");
        return res.json();
      })
      .then((data) => {
        setDevices(Array.isArray(data) ? data : []);
        setGlobalError(null);
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
        setGlobalError(
          err.message === "Failed to fetch"
            ? "🔌 Connection to server lost."
            : err.message
        );
      });
  }, []);

  const fetchRooms = useCallback(() => {
    fetch(`${API_URL}/rooms`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch rooms", err));
  }, []);

  useEffect(() => {
    if (user && view === "dashboard") {
      fetchDevices();
      fetchRooms();
    }
  }, [user, view, fetchDevices, fetchRooms]);

  const handleLoginSuccess = (userData: User) => setUser(userData);

  const handleLogout = () => {
    fetch(`${API_URL}/users/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(console.error);
    setUser(null);
    setDevices([]);
    setGlobalError(null);
    setActionError(null);
  };

  const handleAdd = (name: string, roomId: string, type: string) => {
    fetch(`${API_URL}/devices/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, roomId, type }),
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add device.");
        fetchDevices();
      })
      .catch((err) => showError(err.message));
  };

  const handleToggle = (id: string, action: "turn-on" | "turn-off") => {
    fetch(`${API_URL}/devices/${id}/${action}`, {
      method: "PUT",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Could not ${action.replace("-", " ")}.`);
      })
      .catch((err) => showError(err.message));
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this device?")) {
      fetch(`${API_URL}/devices/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Could not delete device.");
        })
        .catch((err) => showError(err.message));
    }
  };

  const handleAddRoom = (name: string) => {
    fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(name), // Backend expects bare string via [FromBody]
      credentials: "include",
    }).then((res) => {
      if (res.ok) fetchRooms(); // Refresh list
      else alert("Failed to add room");
    });
  };

  const handleRenameRoom = (id: string, newName: string) => {
    fetch(`${API_URL}/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newName),
      credentials: "include",
    }).then((res) => {
      if (res.ok) fetchRooms();
      else alert("Failed to rename room");
    });
  };

  const handleDeleteRoom = (id: string) => {
    // Zmieniony komunikat
    if (
      !confirm(
        "⚠️ WARNING: Deleting this room will also DELETE ALL DEVICES inside it.\n\nAre you sure?"
      )
    )
      return;

    fetch(`${API_URL}/rooms/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then(() => {
      fetchRooms();
      fetchDevices();
    });
  };
  useEffect(() => {
    if (!user) return;

    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5187/smarthomehub")
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection
      .start()
      .then(() => console.log("✅ Connected to SignalR Hub"))
      .catch((err) => console.error("❌ SignalR Connection Error:", err));

    connection.on("RefreshDevices", () => fetchDevices());
    connection.on("ReceiveTemperature", (deviceId: string, newTemp: number) => {
      setTemps((prev) => ({ ...prev, [deviceId]: newTemp }));
    });

    return () => {
      connection.stop();
    };
  }, [user, fetchDevices]);

  if (!user) return <AuthForm onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans text-gray-800 relative">
      {actionError && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-auto bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center justify-between gap-4 z-50 animate-bounce">
          <span className="font-medium">{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="ml-4 hover:text-gray-200 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sm:gap-0 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 flex items-center gap-2">
            🏠 Smart Home{" "}
            <span className="text-gray-400 text-lg font-normal">
              | {user.username}
            </span>
          </h1>

          <div className="flex gap-2 w-full sm:w-auto">
            {view === "dashboard" ? (
              <button
                onClick={() => setView("profile")}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition cursor-pointer"
              >
                👤 Profile
              </button>
            ) : (
              <button
                onClick={() => setView("dashboard")}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition cursor-pointer"
              >
                🏠 Dashboard
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition cursor-pointer"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {globalError && (
          <div
            className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6"
            role="alert"
          >
            <p className="font-bold">System Warning</p>
            <p>{globalError}</p>
          </div>
        )}

        {view === "profile" ? (
          <UserProfile
            user={user}
            onBack={() => setView("dashboard")}
            onUpdateUser={setUser}
            onDeleteAccount={handleLogout}
          />
        ) : (
          <>
            <RoomManager
              rooms={rooms}
              onAdd={handleAddRoom}
              onDelete={handleDeleteRoom}
              onRename={handleRenameRoom}
            />

            <DeviceForm onAdd={handleAdd} rooms={rooms} />

            {/* LIGHTING SECTION */}
            {lightbulbs.length > 0 && (
              <div className="mb-10 animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                  💡 Lighting{" "}
                  <span className="text-sm font-normal text-gray-400">
                    ({lightbulbs.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lightbulbs.map((device) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                      onOpenLogs={setSelectedDeviceForLogs}
                      temp={temps[device.id]}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SENSOR SECTION */}
            {sensors.length > 0 && (
              <div className="mb-10 animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                  🌡️ Temperature Sensors{" "}
                  <span className="text-sm font-normal text-gray-400">
                    ({sensors.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sensors.map((device) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                      onOpenLogs={setSelectedDeviceForLogs}
                      temp={temps[device.id]}
                    />
                  ))}
                </div>
              </div>
            )}

            {devices.length === 0 && !globalError && (
              <div className="text-center mt-10 p-10 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No devices found.</p>
                <p className="text-gray-400 text-sm">
                  Use the form above to add your first device.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- RENDER MODAL IF DEVICE SELECTED --- */}
      {selectedDeviceForLogs && (
        <MaintenanceModal
          deviceId={selectedDeviceForLogs.id}
          deviceName={selectedDeviceForLogs.name}
          onClose={() => setSelectedDeviceForLogs(null)}
        />
      )}
    </div>
  );
}

export default App;
