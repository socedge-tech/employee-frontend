import { useState, useEffect } from "react";
import { Search, Filter, Loader2, Calendar, User, Info } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { getActivityLogs, type ActivityLog } from "../../api/settings.ts";
import { toast } from "sonner";

export function ActivityLogsSection() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    module: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await getActivityLogs(filters);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch activity logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Activity Logs</CardTitle>
        <div className="flex items-center gap-3">
          <select 
            value={filters.module} 
            onChange={(e) => setFilters({...filters, module: e.target.value})}
            className="text-xs border rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Modules</option>
            <option value="employee">Employee</option>
            <option value="role">Role</option>
            <option value="leave">Leave</option>
          </select>
          <select 
            value={filters.action} 
            onChange={(e) => setFilters({...filters, action: e.target.value})}
            className="text-xs border rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No activity logs found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    log.action === 'CREATE' ? 'bg-green-50 text-green-600' :
                    log.action === 'DELETE' ? 'bg-red-50 text-red-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">{log.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" /> {log.user?.details?.first_name} {log.user?.details?.last_name}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {log.module}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
