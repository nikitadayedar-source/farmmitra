"use client";

import React, { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminRole, PaymentStatus } from "@prisma/client";

interface User {
  id: string;
  name: string;
  farmerId: string;
  district: string;
  paymentStatus: PaymentStatus;
}
interface LandDetail {
  village: string;
  taluka: string;
  district: string;
  state: string;
  groupNumber: string;
  area: number;
}
interface Payment {
  razorpayOrderId: string;
  status: string;
  createdAt: string;
}
interface FullUserDetails {
  id: string;
  farmerId: string;
  nameEnglish: string;
  nameMarathi: string;
  mobileNumber: string;
  address: string;
  landDetails: LandDetail[];
  payments: Payment[];
}
interface CurrentAdmin {
  id: string;
  role: AdminRole;
}

const UserDetailsModal = ({
  user,
  onClose,
  onDelete,
  onGenerateCard,
  currentAdmin,
}: {
  user: FullUserDetails;
  onClose: () => void;
  onDelete: (userId: string) => void;
  onGenerateCard: (userId: string) => void;
  currentAdmin: CurrentAdmin | null;
}) => {
  const handleDeleteClick = () => {
    if (
      window.confirm(
        `Are you sure you want to delete user ${user.nameEnglish}? This action cannot be undone.`
      )
    ) {
      onDelete(user.id);
    }
  };
  const hasSuccessfulPayment = user.payments.some(
    (p) => p.status === "SUCCESS"
  );
  const isSuperAdmin = currentAdmin?.role === AdminRole.SUPER_ADMIN;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 text-white w-full max-w-2xl p-6 rounded-lg shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-600 pb-3 mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-green-400">
            User Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl"
          >
            &times;
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Name (English)</p>
              <p>{user.nameEnglish}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Name (Marathi)</p>
              <p>{user.nameMarathi}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Farmer ID</p>
              <p>{user.farmerId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Mobile Number</p>
              <p>{user.mobileNumber}</p>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <p className="text-sm text-gray-400">Address</p>
              <p>{user.address}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mt-4 border-t border-gray-600 pt-4">
              Land Details
            </h3>
            {user.landDetails.map((land, index) => (
              <div key={index} className="mt-2 p-3 bg-gray-700 rounded-md">
                <p>
                  <strong>Land {index + 1}:</strong> {land.village},{" "}
                  {land.taluka}, {land.district}, {land.state}
                </p>
                <p className="text-sm text-gray-300">
                  Gat: {land.groupNumber} | Area: {land.area} Hectare
                </p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-lg font-semibold mt-4 border-t border-gray-600 pt-4">
              Payment History
            </h3>
            {user.payments.length > 0 ? (
              <ul className="list-disc list-inside mt-2 space-y-1">
                {user.payments.map((payment, index) => (
                  <li key={index}>
                    Order ID: {payment.razorpayOrderId} -
                    <span
                      className={`font-bold ${
                        payment.status === "SUCCESS"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {payment.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      {" "}
                      on {new Date(payment.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 mt-2">No payment records found.</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="flex gap-4">
            <button
              onClick={handleDeleteClick}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              Delete User
            </button>
            {!hasSuccessfulPayment && isSuperAdmin && (
              <button
                onClick={() => onGenerateCard(user.id)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                Generate Card (Free)
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ViewUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<FullUserDetails | null>(
    null
  );
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = useCallback(
    async (query = "") => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/users?searchQuery=${query}`);
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/admin/login");
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch users");
        }
        setUsers(await response.json());
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

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
        await fetchUsers();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [router, fetchUsers]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };
  const handleClearSearch = () => {
    setSearchQuery("");
    fetchUsers("");
  };

  const handleViewUser = async (userId: string) => {
    setIsModalLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user details");
      }
      setSelectedUser(await response.json());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }
      setSelectedUser(null);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      alert("User deleted successfully.");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both a start and end date.");
      return;
    }
    setIsExporting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/users/export?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export data");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteByDate = async () => {
    if (!startDate || !endDate) {
      alert("Please select both a start and end date to delete.");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete all users registered between ${startDate} and ${endDate}? This action is irreversible.`
      )
    ) {
      setIsDeleting(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/admin/users/delete-by-date?startDate=${startDate}&endDate=${endDate}`,
          { method: "DELETE" }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete users");
        }
        const result = await response.json();
        alert(`${result.deletedCount} users have been deleted successfully.`);
        fetchUsers();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleGenerateFreeCard = async (userId: string) => {
    setError(null);
    try {
      const response = await fetch("/api/admin/create-card-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate free card");
      }
      alert("Free card generated successfully! Opening card in a new tab.");
      window.open(`/card/${userId}`, "_blank");
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (isLoading)
    return <div className="p-8 text-center text-white">Loading Users...</div>;

  return (
    <>
      <div className="p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">View All Users</h1>
            <p className="mt-2 text-gray-400">
              A list of all registered users in the database.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-800 p-3 rounded-lg">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white"
            />
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded-md disabled:bg-gray-500"
            >
              {isExporting ? "Exporting..." : "Export"}
            </button>
            <button
              onClick={handleDeleteByDate}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded-md disabled:bg-gray-500"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-4 text-center text-red-400 bg-red-900 bg-opacity-50 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSearch}
          className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <input
            type="text"
            placeholder="Search by Farmer ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/3 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClearSearch}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Farmer ID
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      District
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Payment Status
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                    >
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.length > 0 ? (
                    users.map((user) => {
                      const statusColor =
                        user.paymentStatus === "SUCCESS"
                          ? "text-green-400"
                          : "text-red-400";
                      return (
                        <tr key={user.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                            {user.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {user.farmerId}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {user.district}
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm font-semibold ${statusColor}`}
                          >
                            {user.paymentStatus}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <button
                              onClick={() => handleViewUser(user.id)}
                              className="text-green-400 hover:text-green-300"
                            >
                              View<span className="sr-only">, {user.name}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-gray-400"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {isModalLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <p className="text-white">Loading details...</p>
        </div>
      )}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDelete={handleDeleteUser}
          onGenerateCard={handleGenerateFreeCard}
          currentAdmin={currentAdmin}
        />
      )}
    </>
  );
}
