"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminRole } from "@prisma/client";

interface DashboardStats {
  totalUsers: number;
  successfulPayments: number;
  helpRequests: number;
}
interface CurrentAdmin {
  id: string;
  role: AdminRole;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [statsResponse, meResponse] = await Promise.all([
          fetch("/api/admin/dashboard-stats"),
          fetch("/api/admin/me"),
        ]);

        if (!statsResponse.ok || !meResponse.ok) {
          if (statsResponse.status === 401 || meResponse.status === 401) {
            router.push("/admin/login");
            return;
          }
          throw new Error("Failed to fetch dashboard data");
        }

        const statsData: DashboardStats = await statsResponse.json();
        const meData: CurrentAdmin = await meResponse.json();

        setStats(statsData);
        setCurrentAdmin(meData);
      } catch (err) {
        const e = err as Error;
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-white">Loading Dashboard...</div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  const isSuperAdmin = currentAdmin?.role === AdminRole.SUPER_ADMIN;

  return (
    <div className="p-6 md:p-8 text-white">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Hello Boss</h1>
          <p className="mt-2 text-gray-400">
            Welcome to your dashboard. Here a summary of your application.
          </p>
        </div>
        {isSuperAdmin && (
          <div>
            <Link
              href="/admin/generate-card"
              className="w-full md:w-auto inline-block text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Generate New Card
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
          <p className="mt-2 text-3xl md:text-4xl font-bold text-green-400">
            {stats?.totalUsers ?? "0"}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-medium text-gray-400">
            Successful Payments
          </h3>
          <p className="mt-2 text-3xl md:text-4xl font-bold text-green-400">
            {stats?.successfulPayments ?? "0"}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-medium text-gray-400">Help Requests</h3>
          <p className="mt-2 text-3xl md:text-4xl font-bold text-green-400">
            {stats?.helpRequests ?? "0"}
          </p>
        </div>
      </div>
    </div>
  );
}
