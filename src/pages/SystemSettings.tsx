import { useState } from "react";
import { 
  Shield, 
  Activity, 
  Database, 
  Share2 
} from "lucide-react";
import { RolesPermissionsTab } from "../components/settings/RolesPermissionsTab";
import { CustomFieldsTab } from "../components/settings/CustomFieldsTab";
import { IntegrationsTab } from "../components/settings/IntegrationsTab";
import { ActivityLogsSection } from "../components/settings/ActivityLogsSection";

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState<"roles" | "fields" | "integrations">("roles");

  const categories = [
    {
      id: "roles",
      title: "Roles & Permissions",
      description: "Manage access levels and permissions",
      icon: Shield,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      id: "fields",
      title: "Custom Fields",
      description: "Configure dynamic data fields",
      icon: Database,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Connect third-party services",
      icon: Share2,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-gray-500 font-medium">Platform configuration and administrative tools</p>
      </div>

      {/* Category Cards (Hub Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id as any)}
            className={`flex flex-col items-start p-6 rounded-2xl border-2 transition-all group text-left ${
              activeTab === cat.id 
                ? "bg-white border-indigo-600 shadow-lg ring-1 ring-indigo-600/5 ring-offset-4" 
                : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
            }`}
          >
            <div className={`p-3 rounded-xl mb-4 ${cat.bgColor} ${cat.color} group-hover:scale-110 transition-transform`}>
              <cat.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">{cat.title}</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{cat.description}</p>
          </button>
        ))}
      </div>

      {/* Main Content Area (Tabs) */}
      <div className="min-h-[400px]">
        {activeTab === "roles" && <RolesPermissionsTab />}
        {activeTab === "fields" && <CustomFieldsTab />}
        {activeTab === "integrations" && <IntegrationsTab />}
      </div>

      {/* Audit Trail Section */}
      <div className="pt-8 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">System Activity</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6 font-medium">Monitor all administrative actions and system updates</p>
        <ActivityLogsSection />
      </div>
    </div>
  );
}