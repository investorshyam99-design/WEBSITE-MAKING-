import { AdminOrdersDashboard } from "../components/AdminDashboard";
import React from "react";
import { useShop } from "../context/ShopContext";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function AdminDashboard() {
  const { user, isAuthLoading } = useShop();

  const isAdmin = user?.email === "investorshyam99@gmail.com" || user?.email === "jerseyunicornhelp@gmail.com";

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md text-center">
            <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1B1B1B] mb-2">Access Denied</h2>
            <p className="text-gray-500">Please log in to view the admin dashboard.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md text-center">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1B1B1B] mb-2">Restricted Area</h2>
            <p className="text-gray-500">
              You do not have permission to view the admin dashboard. This area
              is restricted to administrators.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#1B1B1B] uppercase tracking-wider">
              Control Panel
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Manage store operations.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <AdminOrdersDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
}
