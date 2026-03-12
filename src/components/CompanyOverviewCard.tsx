import { Building2, MapPin, Users, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent } from "./ui/card.tsx";

interface CompanyOverviewCardProps {
  companyData: any;
  totalEmployees: number;
}

export function CompanyOverviewCard({ companyData, totalEmployees }: CompanyOverviewCardProps) {
  if (!companyData) return null;

  const stats = [
    {
      icon: Building2,
      label: "Company Type",
      value: companyData.companyType || "Not Set",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: MapPin,
      label: "Office Locations",
      value: companyData.locations?.length || 0,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: Users,
      label: "Total Employees",
      value: totalEmployees.toLocaleString(),
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: Calendar,
      label: "Pay Frequency",
      value: companyData.payFrequency || "Not Set",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      icon: DollarSign,
      label: "Currency",
      value: companyData.currency || "USD",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
