import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useShop } from "../context/ShopContext";
import { ShieldAlert, Users, Calendar, Loader2, Clock } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

function formatTime(seconds: number) {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function AdminDashboard() {
  const { user, isAuthLoading } = useShop();
  const [users, setUsers] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [avgTimeSpent, setAvgTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Define admin email here - matching our firestore rules.
  // We can just rely on the rules returning a permission denied error, but we'll show UI as well.
  const isAdmin = user?.email === "investorshyam99@gmail.com";

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || user.email !== "investorshyam99@gmail.com") {
      setLoading(false);
      return;
    }

    let unsubscribeUsers: () => void;
    let unsubscribeVisitors: () => void;

    try {
      unsubscribeUsers = onSnapshot(
        collection(db, "users"),
        (snapshot) => {
          const usersData = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort((a: any, b: any) => {
              const timeA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
              const timeB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
              return timeB - timeA;
            });
          setUsers(usersData);
        },
        (err) => {
          console.error("Error fetching users:", err);
          setError("Failed to fetch users. " + err.message);
        },
      );

      unsubscribeVisitors = onSnapshot(
        collection(db, "visitors"),
        (snapshot) => {
          const visitorsData = snapshot.docs
            .map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                }) as any,
            )
            .sort((a: any, b: any) => {
              const timeA = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
              const timeB = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
              return timeB - timeA;
            });

          setVisitors(visitorsData);

          const visitorsWithTime = visitorsData.filter(
            (v) => typeof v.timeSpent === "number" && v.timeSpent > 0,
          );
          if (visitorsWithTime.length > 0) {
            const totalTime = visitorsWithTime.reduce(
              (acc, v) => acc + v.timeSpent,
              0,
            );
            setAvgTimeSpent(totalTime / visitorsWithTime.length);
          } else {
            setAvgTimeSpent(0);
          }
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching visitors:", err);
          setError("Failed to fetch visitors. " + err.message);
          setLoading(false);
        },
      );
    } catch (err: any) {
      console.error("Error setting up listeners:", err);
      setError("Failed to fetch data. " + err.message);
      setLoading(false);
    }

    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeVisitors) unsubscribeVisitors();
    };
  }, [user, isAuthLoading]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#722F37] uppercase tracking-wider">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Manage your store and customers
          </p>
        </div>

        {isAuthLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
          </div>
        ) : !user ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
            <p className="text-gray-500 font-medium">
              Please log in to view the admin dashboard.
            </p>
          </div>
        ) : !isAdmin ? (
          <div className="bg-red-50 p-8 rounded-2xl shadow-sm text-center border border-red-100 max-w-lg mx-auto">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-red-800 mb-2">
              Access Denied
            </h2>
            <p className="text-sm text-red-600 font-medium">
              You do not have permission to view the admin dashboard. This area
              is restricted to administrators.
            </p>
            <p className="text-xs text-red-500 font-medium mt-4">
              Current user: {user.email}
            </p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-[#722F37]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500">
                  <Users className="w-24 h-24" />
                </div>
                <Users className="w-8 h-8 text-[#722F37] mb-4" />
                <h3 className="text-gray-500 font-medium text-sm">
                  Total Logged-in Users
                </h3>
                <p className="text-4xl font-black text-[#1B1B1B] mt-2">
                  {users.length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500">
                  <Calendar className="w-24 h-24" />
                </div>
                <Calendar className="w-8 h-8 text-indigo-600 mb-4" />
                <h3 className="text-gray-500 font-medium text-sm">
                  Total Website Visitors
                </h3>
                <p className="text-4xl font-black text-[#1B1B1B] mt-2">
                  {visitors.length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:-translate-y-2 group-hover:scale-110 transition-transform duration-500">
                  <Clock className="w-24 h-24" />
                </div>
                <Clock className="w-8 h-8 text-amber-500 mb-4" />
                <h3 className="text-gray-500 font-medium text-sm">
                  Avg Time Spent
                </h3>
                <p className="text-4xl font-black text-[#1B1B1B] mt-2">
                  {formatTime(avgTimeSpent)}
                </p>
              </div>
            </div>

            {/* Visitors List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1B1B1B]">
                  Recent Website Visitors
                </h3>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                  {visitors.length} Unique Devices
                </span>
              </div>
              <div className="overflow-x-auto h-64">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 sticky top-0">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Device ID
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Language
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Browser/OS
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Time Spent
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Last Visit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visitors.slice(0, 100).map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                          {v.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1B1B1B]">
                          {v.language}
                        </td>
                        <td
                          className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate"
                          title={v.userAgent}
                        >
                          {v.userAgent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-amber-600">
                          {formatTime(v.timeSpent || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {v.lastVisit
                            ? new Date(v.lastVisit).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                    {visitors.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-500 font-medium"
                        >
                          No visitors tracked yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1B1B1B]">
                  Registered Users
                </h3>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                  {users.length} Users
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1B1B1B]">
                          {u.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                          {u.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.lastLogin
                            ? new Date(u.lastLogin).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-gray-500 font-medium"
                        >
                          No users found in the system.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
