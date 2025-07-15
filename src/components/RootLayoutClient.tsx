"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileText,
  Users,
  CreditCard,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Building2,
  Package,
  LucideIcon,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Stock", href: "/stock", icon: Package },
  { name: "Sales", href: "/sales", icon: FileText },
  { name: "Invoices", href: "/invoices", icon: FileSpreadsheet },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Projects", href: "/projects", icon: Building2 },
  { name: "VAT Report", href: "/reports/vat", icon: DollarSign },
  { name: "Profit & Loss", href: "/reports/profit-loss", icon: TrendingUp },
  { name: "Pending Payments", href: "/reports/pending-payments", icon: AlertCircle },
];

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">Sigma Accounts</h1>
          <p className="text-sm text-gray-400 mt-1">Business Management</p>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.name}
                icon={item.icon}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 text-sm text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({ 
  href, 
  label, 
  icon: Icon, 
  isActive 
}: { 
  href: string; 
  label: string; 
  icon: LucideIcon; 
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-gray-800 text-white"
          : "text-gray-300 hover:text-white hover:bg-gray-800"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
} 