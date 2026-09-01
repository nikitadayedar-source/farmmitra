"use client";

import React, { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminRole } from "@prisma/client";

interface Admin {
  id: string;
  username: string;
  role: AdminRole;
  createdAt: string;
}
interface CurrentAdmin {
  id: string;
  role: AdminRole;
}

export default function ManageAdminsPage() {
  const router = useRouter();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>(AdminRole.ADMIN);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/manage");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/admin/login");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch admins");
      }
      setAdmins(await response.json());
    } catch (err) {
      setError((err as Error).message);
    }
  }, [router]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const meResponse = await fetch("/api/admin/me");
        if (!meResponse.ok) {
          if (meResponse.status === 401) {
            router.push("/admin/login");
            return;
          }
          throw new Error("Failed to fetch current admin data");
        }
        setCurrentAdmin(await meResponse.json());
        await fetchAdmins();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [router, fetchAdmins]);

  const handleAddAdmin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newRole,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add admin");
      }
      alert("Admin added successfully!");
      setNewUsername("");
      setNewPassword("");
      await fetchAdmins();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      setError(null);
      try {
        const response = await fetch(`/api/admin/manage/${adminId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete admin");
        }
        alert("Admin deleted successfully!");
        await fetchAdmins();
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  if (isLoading)
    return <div className="p-8 text-center text-white">Loading...</div>;

  const isSuperAdmin = currentAdmin?.role === AdminRole.SUPER_ADMIN;

  return (
    <div className="p-6 md:p-8 text-white">
      <h1 className="text-3xl font-bold">Manage Admins</h1>
      <p className="mt-2 text-gray-400">
        View, add, or remove administrator accounts.
      </p>
      {error && (
        <div className="mt-4 p-4 text-center text-red-400 bg-red-900 bg-opacity-50 rounded-lg">
          {error}
        </div>
      )}

      {isSuperAdmin && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Add New Admin</h2>
          <form
            onSubmit={handleAddAdmin}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">Username</label>
              <input
                type="text"
                placeholder="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                className="form-input w-full"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="form-input w-full"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as AdminRole)}
                className="form-input w-full"
              >
                <option value={AdminRole.ADMIN}>Admin</option>
                <option value={AdminRole.SUPER_ADMIN}>Super Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500 w-full md:w-auto"
            >
              {isSubmitting ? "Adding..." : "Add Admin"}
            </button>
          </form>
        </div>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                  >
                    Username
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                  >
                    Created At
                  </th>
                  {isSuperAdmin && (
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                      {admin.username}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      {admin.role}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    {isSuperAdmin && (
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        {currentAdmin?.id !== admin.id ? (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-gray-500">
                            Cannot Delete Self
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style jsx>{`
        .form-input {
          background-color: #374151;
          border: 1px solid #4b5563;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          color: white;
        }
        .form-input:focus {
          outline: none;
          border-color: #34d399;
          box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.5);
        }
      `}</style>
    </div>
  );
}
