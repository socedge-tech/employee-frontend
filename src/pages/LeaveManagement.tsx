import { useState } from "react";
import { Calendar, Check, X, Filter, ChevronLeft, ChevronRight, Plus, Clock, Download, Edit, Trash2, Search, LogIn, LogOut, Users, TrendingUp, Eye } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/rbac";
import {
  applyLeave,
  getMyRequests,
  getPendingRequests,
  getLeaveHistory,
  handleLeaveAction,
  getMyLeaveBalance,
  getLeaveStatistics,
  getAllLeavePolicies,
  createLeavePolicy,
  updateLeavePolicy,
  deleteLeavePolicy
} from "../api/leaves";
import {
  checkIn,
  checkOut,
  getMyAttendanceLogs,
  getTeamAttendanceLogs,
  getAttendanceStats
} from "../api/attendance";
import { getEmployee } from "../api/employees";
import { toast } from "sonner";
import { useEffect } from "react";


const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);


const leaveTypeColors = {
  "Vacation": "bg-blue-500",
  "Annual Leave": "bg-blue-500",
  "Sick Leave": "bg-red-500",
  "Personal": "bg-purple-500",
  "Bereavement": "bg-gray-500",
  "Maternity": "bg-pink-500",
  "Paternity": "bg-indigo-500",
};

export function LeaveManagement() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.includes(UserRole.SUPER_ADMIN);
  const isAdmin = user?.roles?.includes(UserRole.ADMIN);
  const isManager = user?.roles?.includes(UserRole.MANAGER);
  const isEmployee = !isSuperAdmin && !isAdmin && !isManager;

  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [leaveStats, setLeaveStats] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("All Employees");
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);
  const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [leaveRequestData, setLeaveRequestData] = useState({
    leave_policy_id: "",
    start_date: "",
    end_date: "",
    reason: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        policiesRes,
        pendingRes,
        historyRes,
        statsRes,
        myAttendanceRes,
        balanceRes,
        attStatsRes
      ] = await Promise.allSettled([
        getAllLeavePolicies(),
        isEmployee ? getMyRequests() : getPendingRequests(),
        getLeaveHistory(),
        getLeaveStatistics(),
        getMyAttendanceLogs(),
        getMyLeaveBalance(),
        getAttendanceStats()
      ]);

      if (policiesRes.status === 'fulfilled') setPolicies(policiesRes.value.data || []);
      if (pendingRes.status === 'fulfilled') {
        let pendingData = pendingRes.value.data || [];

        // Fetch unique employee details for pending requests
        const userIds = [...new Set(pendingData.map((req: any) => req.user_id).filter(Boolean))];
        const employeeMap: Record<number, any> = {};

        await Promise.allSettled(
          userIds.map(async (uid: any) => {
            try {
              const emp = await getEmployee(uid);
              employeeMap[uid] = emp;
            } catch (e) {
              console.error(`Failed to fetch employee ${uid}`);
            }
          })
        );

        // Attach employee to each request
        pendingData = pendingData.map((req: any) => ({
          ...req,
          employee: employeeMap[req.user_id]?.details
        }));

        setRequests(pendingData);
      }
      if (historyRes.status === 'fulfilled') {
        const historyData = historyRes.value.data;
        let finalHistory = Array.isArray(historyData) ? historyData : (historyData?.data || []);
        
        const approverIds = [...new Set(finalHistory.map((req: any) => req.approved_by).filter(Boolean))];
        const approverMap: Record<number, any> = {};
        
        await Promise.allSettled(
          approverIds.map(async (uid: any) => {
            try {
              const emp = await getEmployee(uid);
              approverMap[uid] = emp;
            } catch (e) {
              console.error(`Failed to fetch approver ${uid}`);
            }
          })
        );

        finalHistory = finalHistory.map((req: any) => {
            const approverFull = approverMap[req.approved_by];
            const approverData = approverFull?.details;

            let approverName: string;
            if (!req.approved_by) {
              approverName = 'Pending';
            } else if (approverData?.first_name || approverData?.last_name) {
              approverName = `${approverData.first_name || ''} ${approverData.last_name || ''}`.trim();
            } else if (approverFull?.username) {
              approverName = approverFull.username;
            } else {
              approverName = `User #${req.approved_by}`;
            }

            const roleName = approverFull?.roles?.[0]?.name || approverFull?.roles?.[0]?.role_name;
            const approverDetails = roleName || approverData?.department?.department_name || approverData?.job_role || '';

            return {
              ...req,
              approverName,
              approverDetails
            };
        });

        setLeaveHistory(finalHistory);
      }
      if (statsRes.status === 'fulfilled') setLeaveStats(statsRes.value.data);
      if (balanceRes.status === 'fulfilled') setLeaveBalances(balanceRes.value.data || []);
      if (attStatsRes.status === 'fulfilled') setAttendanceStats(attStatsRes.value.data);

      if (isEmployee) {
        try {
          const res = await fetch("http://localhost:5000/leaves/my-requests", {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
            }
          });
          const result = await res.json();
          console.log("API:", result);

          let leavesData = result.data || [];

          // Fetch approver details
          const approverIds = [...new Set(leavesData.map((req: any) => req.approved_by).filter(Boolean))];
          const approverMap: Record<number, any> = {};

          await Promise.allSettled(
            approverIds.map(async (uid: any) => {
              try {
                const emp = await getEmployee(uid);
                approverMap[uid] = emp;
              } catch (e) {
                console.error(`Failed to fetch approver ${uid}`);
              }
            })
          );

          leavesData = leavesData.map((req: any) => {
            const approverFull = approverMap[req.approved_by];
            const approverData = approverFull?.details;

            let approverName: string;
            if (!req.approved_by) {
              approverName = 'Pending';
            } else if (approverData?.first_name || approverData?.last_name) {
              approverName = `${approverData.first_name || ''} ${approverData.last_name || ''}`.trim();
            } else if (approverFull?.username) {
              approverName = approverFull.username;
            } else {
              approverName = `User #${req.approved_by}`;
            }

            const roleName = approverFull?.roles?.[0]?.name || approverFull?.roles?.[0]?.role_name;
            const approverDetails = roleName || approverData?.department?.department_name || approverData?.job_role || '';

            return {
              ...req,
              approverName,
              approverDetails
            };
          });

          setLeaves(leavesData);
        } catch (e) {
          console.error("Failed to fetch leaves", e);
        }
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (isAdmin || isSuperAdmin || isManager) {
        const teamLogs = await getTeamAttendanceLogs({ date: todayStr });
        setAttendance(teamLogs.data || []);
      } else {
        if (myAttendanceRes.status === 'fulfilled') setAttendance(myAttendanceRes.value.data || []);
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);
      toast.error("Failed to load leave information. Please try again");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await handleLeaveAction(id, 'APPROVED');
      toast.success("Leave request approved");
      fetchData();
    } catch (error) {
      toast.error("Failed to approve leave request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await handleLeaveAction(id, 'REJECTED');
      toast.success("Leave request rejected");
      fetchData();
    } catch (error) {
      toast.error("Failed to reject leave request");
    }
  };

  const handleApplyLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await applyLeave({
        ...leaveRequestData,
        leave_policy_id: Number(leaveRequestData.leave_policy_id)
      });
      toast.success("Leave application submitted successfully");
      setShowLeaveRequestModal(false);
      setLeaveRequestData({
        leave_policy_id: "",
        start_date: "",
        end_date: "",
        reason: ""
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to submit leave application");
    }
  };

  const handlePolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      total_days: parseInt(formData.get('total_days') as string),
      carry_forward: parseInt(formData.get('carry_forward') as string) || 0,
      accrual_rate: formData.get('accrual_rate'),
      is_paid: formData.get('is_paid') === 'Paid',
      color: formData.get('color'),
      description: formData.get('description')
    };

    try {
      if (editingPolicy) {
        await updateLeavePolicy(editingPolicy.id, data);
        toast.success("Policy updated successfully");
      } else {
        await createLeavePolicy(data);
        toast.success("Policy created successfully");
      }
      setShowPolicyModal(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to save policy");
    }
  };

  const handleAttendanceAction = async (action: 'check-in' | 'check-out') => {
    try {
      if (action === 'check-in') {
        await checkIn({ location: 'Remote' });
        toast.success("Checked in successfully");
      } else {
        await checkOut({ location: 'Remote' });
        toast.success("Checked out successfully");
      }
      fetchData();
    } catch (error) {
      toast.error(`Failed to ${action}`);
    }
  };

  const getLeaveTypeColor = (type: string) => {
    return leaveTypeColors[type as keyof typeof leaveTypeColors] || "bg-gray-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present": return "bg-green-100 text-green-700";
      case "Late": return "bg-amber-100 text-amber-700";
      case "Half Day": return "bg-blue-100 text-blue-700";
      case "Absent": return "bg-red-100 text-red-700";
      case "Approved": return "bg-green-100 text-green-700";
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const tabs = [
    { id: "requests", label: isEmployee ? "My Requests" : "Leave Requests" },
    { id: "history", label: isEmployee ? "My Leave History" : "Leave History" },
    { id: "policies", label: "Leave Policies" },
    ...(!isEmployee ? [{ id: "statistics", label: "Statistics" }] : []),
    { id: "attendance", label: isEmployee ? "My Attendance" : "Attendance Tracking" },
  ];

  const filteredHistory = leaveHistory.filter(leave => {
    const fullName = `${leave.user?.details?.first_name || ''} ${leave.user?.details?.last_name || ''}`.trim() || leave.employeeName || 'N/A';
    const employeeId = leave.user?.details?.employee_id || leave.employeeId || "";

    const matchesEmployee = (selectedEmployee === "All Employees" || fullName === selectedEmployee);
    const matchesSearch = (fullName.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      employeeId.toLowerCase().includes(searchEmployee.toLowerCase()));
    const matchesPolicy = (selectedLeaveType === "All" || leave.leave_policy_id.toString() === selectedLeaveType);
    const matchesStatus = (selectedStatus === "All" || leave.status === selectedStatus);

    return matchesEmployee && matchesSearch && matchesPolicy && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Time & Attendance</h1>
          <p className="text-gray-500 mt-1">Manage leave requests, policies, and employee attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          {activeTab === "policies" && (isSuperAdmin || isAdmin) && (
            <Button className="gap-2" onClick={() => { setEditingPolicy(null); setShowPolicyModal(true); }}>
              <Plus className="w-4 h-4" />
              Add Policy
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Leave Requests Tab */}
      {activeTab === "requests" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leave Requests Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{isEmployee ? "My Leave Requests" : "Pending Leave Requests"}</CardTitle>
                  <span className="text-sm text-gray-500">{requests.length} requests</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((request) => {
                    const name = request.employee
                      ? `${request.employee.first_name || ""} ${request.employee.last_name || ""}`.trim()
                      : request.employee_name || "Unknown";

                    const empId =
                      request.employee?.employee_id ||
                      request.employee_id ||
                      "-";

                    const jobRole = request.employee?.job_role || "";

                    const leaveType = request.leave_policy?.leave_type || request.leave_policy?.name || request.leave_type || "-";

                    const profilePicRaw =
                      request.employee?.profile_picture ||
                      request.profile_picture ||
                      null;

                    const BASE_URL = "http://localhost:3000";

                    const profilePic = profilePicRaw
                      ? BASE_URL + profilePicRaw
                      : null;

                    const duration = request.duration || request.days || 0;

                    return (
                      <div key={request.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {profilePic ? (
                              <img src={profilePic} alt={name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                {name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "U"}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{name}</p>
                              <p className="text-xs text-gray-500">
                                {empId} {jobRole && `• ${jobRole}`}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${getLeaveTypeColor(leaveType)}`}>
                                  {leaveType}
                                </span>
                                <span className="text-xs text-gray-500">{duration} day{duration > 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Dates:</span>
                            <span className="font-medium">
                              {request.start_date ? new Date(request.start_date).toLocaleDateString() : "-"} -
                              {request.end_date ? new Date(request.end_date).toLocaleDateString() : "-"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Applied On:</span>
                            <span className="font-medium">{request.applied_at ? new Date(request.applied_at).toLocaleDateString() : "-"}</span>
                          </div>
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-gray-500">Reason:</span>
                            <span className="font-medium text-right max-w-xs">{request.reason || "-"}</span>
                          </div>
                        </div>

                        {!isEmployee && (
                          <div className="flex gap-2">
                            <Button className="flex-1 gap-2" size="sm" onClick={() => handleApprove(request.id)}>
                              <Check className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button variant="outline" className="flex-1 gap-2" size="sm" onClick={() => handleReject(request.id)}>
                              <X className="w-4 h-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Team Calendar View - Admin/Manager only */}
            {!isEmployee && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Team Calendar</CardTitle>
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-medium px-3">{currentMonth}</span>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Department Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option>All Departments</option>
                        <option>Engineering</option>
                        <option>Sales</option>
                        <option>Marketing</option>
                        <option>HR</option>
                      </select>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 pb-2">
                          {day}
                        </div>
                      ))}
                      {/* Start with offset for March 1, 2026 (Saturday) */}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square"></div>
                      ))}
                      {calendarDays.map((day: number) => (
                        <div
                          key={day}
                          className="aspect-square border border-gray-200 rounded-lg p-1 hover:bg-gray-50 transition-colors relative"
                        >
                          <span className="text-xs font-medium">{day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Leave Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const today = new Date();

                    // Filter pending requests
                    const pendingCount = requests.filter(r => r.status === 'PENDING').length;

                    // Filter approved this month
                    const currentMonth = today.getMonth();
                    const currentYear = today.getFullYear();

                    const approvedThisMonth = requests.filter(r => {
                      if (r.status !== 'APPROVED') return false;
                      const sd = new Date(r.start_date);
                      return sd.getMonth() === currentMonth && sd.getFullYear() === currentYear;
                    }).length;

                    // Check if out today
                    let outToday = 0;
                    requests.forEach(r => {
                      if (r.status === 'APPROVED') {
                        const sd = new Date(r.start_date);
                        const ed = new Date(r.end_date);
                        sd.setHours(0, 0, 0, 0);
                        ed.setHours(23, 59, 59, 999);
                        const t = new Date();
                        if (t >= sd && t <= ed) {
                          outToday = 1; // Since it's employee view, it's either 0 or 1
                        }
                      }
                    });

                    // For Admin/Manager fallbacks, if we still want to use leaveStats from API, we can do conditional:
                    const displayPending = isEmployee ? pendingCount : (leaveStats?.pending_requests || 0);
                    const displayApproved = isEmployee ? approvedThisMonth : (leaveStats?.approved_this_month || 0);
                    const displayOutToday = isEmployee ? outToday : (leaveStats?.out_today_count || 0);

                    return (
                      <>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Pending Requests</span>
                            <span className="font-semibold">{displayPending}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(100, displayPending * 5)}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Approved This Month</span>
                            <span className="font-semibold">{displayApproved}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, displayApproved * 25)}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Out Today</span>
                            <span className="font-semibold">{displayOutToday}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, displayOutToday * 100)}%` }}></div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Leaves */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Leaves</CardTitle>
              </CardHeader>
              <CardContent>
                {isEmployee ? (
                  <div className="space-y-4">
                    {(() => {
                      const today = new Date();

                      // Filter for upcoming APPROVED leaves only
                      const upcomingLeaves = (isEmployee ? leaves : requests).filter(
                        (item) => item.start_date && new Date(item.start_date) > today && item.status === 'APPROVED'
                      );

                      // Sort by nearest upcoming date
                      upcomingLeaves.sort(
                        (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
                      );

                      const formatDate = (date: any) =>
                        new Date(date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });

                      if (upcomingLeaves.length === 0) {
                        return (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No Upcoming Leaves
                          </p>
                        );
                      }

                      return upcomingLeaves.map((item: any, idx: number) => {
                        const leaveType = item.leave_policy?.leave_type || item.leave_policy?.name || item.leave_type || "-";

                        const sd = new Date(item.start_date);
                        const ed = new Date(item.end_date);

                        const dateDisplay = sd.getMonth() === ed.getMonth() && sd.getDate() !== ed.getDate()
                          ? `${formatDate(item.start_date)}–${ed.getDate()}`
                          : sd.getDate() === ed.getDate() && sd.getMonth() === ed.getMonth()
                            ? `${formatDate(item.start_date)}`
                            : `${formatDate(item.start_date)}–${formatDate(item.end_date)}`;

                        return (
                          <div key={idx} className="flex flex-col">
                            <span className="font-bold text-gray-900 text-sm">
                              {dateDisplay}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              {leaveType}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(leaveStats?.out_today_employees || []).slice(0, 3).map((emp: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                          {(emp.name || "N A").split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{emp.name}</p>
                          <p className="text-xs text-gray-500">Today</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          On Leave
                        </span>
                      </div>
                    ))}
                    {(!leaveStats?.out_today_employees || leaveStats.out_today_employees.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">No one on leave today</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Leave History Tab */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Filters */}
          {/* <Card>
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by employee name or ID..."
                      value={searchEmployee}
                      onChange={(e) => setSearchEmployee(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                 {(isSuperAdmin || isAdmin) && (
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>All Employees</option>
                    <option>Michael Chen</option>
                    <option>Emma Wilson</option>
                    <option>David Lee</option>
                    <option>Sarah Johnson</option>
                    <option>Lisa Park</option>
                  </select>
                )}
                <select 
                  value={selectedLeaveType}
                  onChange={(e) => setSelectedLeaveType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Leave Types</option>
                  {policies.map(p => (
                    <option key={p.id} value={p.id.toString()}>{p.name || p.policy_name}</option>
                  ))}
                </select>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </CardContent>
          </Card> */}

          {/* Leave History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leave History ({isEmployee ? leaves.length : filteredHistory.length} records)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {!isEmployee && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved By
                      </th>
                      {!isEmployee && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isEmployee ? (
                      leaves.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            <p>No records found</p>
                          </td>
                        </tr>
                      ) : (
                        leaves.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${getLeaveTypeColor(item.leave_policy?.leave_type || item.leave_policy?.name || item.leave_type)}`}>
                                {item.leave_policy?.leave_type || item.leave_policy?.name || item.leave_type || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{new Date(item.start_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{new Date(item.end_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{item.duration}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{item.approverName}</span>
                                {item.approverDetails && item.approverName !== 'Pending' && (
                                  <span className="text-xs text-gray-500">{item.approverDetails}</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      filteredHistory.map((leave: any) => (
                        <tr key={leave.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{leave.user?.full_name || leave.employeeName || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{leave.user?.employee_id || leave.employeeId || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${getLeaveTypeColor(leave.leave_policy?.name || leave.leaveType)}`}>
                              {leave.leave_policy?.name || leave.leaveType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{leave.start_date ? new Date(leave.start_date).toLocaleDateString() : leave.startDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{leave.end_date ? new Date(leave.end_date).toLocaleDateString() : leave.endDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{leave.duration || leave.days}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{leave.approverName}</span>
                              {leave.approverDetails && leave.approverName !== 'Pending' && (
                                <span className="text-xs text-gray-500">{leave.approverDetails}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Employee Leave Summary */}
          {(() => {
            const currentYear = new Date().getFullYear();
            const sourceData = isEmployee ? leaves : leaveHistory;
            
            // Total leaves taken this year (approved only)
            const thisYearLeaves = sourceData.filter((l: any) => {
              const year = l.start_date ? new Date(l.start_date).getFullYear() : null;
              return year === currentYear && l.status === 'APPROVED';
            });
            const totalLeavesTaken = thisYearLeaves.reduce((sum: number, l: any) => sum + (l.duration || l.days || 0), 0);

            // Avg days per employee (unique employees from approved records this year)
            const uniqueEmployees = new Set(thisYearLeaves.map((l: any) => l.user_id));
            const avgDays = uniqueEmployees.size > 0 ? (totalLeavesTaken / uniqueEmployees.size).toFixed(1) : '0';

            // Most common leave type across all records
            const typeCounts: Record<string, number> = {};
            sourceData.forEach((l: any) => {
              const type = l.leave_policy?.leave_type || l.leave_policy?.name || l.leave_type;
              if (type) typeCounts[type] = (typeCounts[type] || 0) + 1;
            });
            const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
            const totalRecords = sourceData.length;
            const mostCommonPct = mostCommonType && totalRecords > 0
              ? Math.round((mostCommonType[1] / totalRecords) * 100)
              : 0;

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Leaves Taken</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-indigo-600">{totalLeavesTaken}</p>
                    <p className="text-sm text-gray-500 mt-1">This year ({currentYear})</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Avg Days per Employee</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-600">{avgDays}</p>
                    <p className="text-sm text-gray-500 mt-1">Days taken</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Most Common Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-600">{mostCommonType ? mostCommonType[0] : '—'}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {mostCommonPct > 0 ? `${mostCommonPct}% of all leaves` : 'No data yet'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </div>
      )}

      {/* Leave Policies Tab */}
      {activeTab === "policies" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((policy: any) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${policy.leave_color || policy.color || 'blue'}-500`}></div>
                      <CardTitle className="text-lg">{policy.policy_name || policy.name}</CardTitle>
                    </div>
                    {(isSuperAdmin || isAdmin) && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingPolicy(policy);
                            setShowPolicyModal(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Delete this policy?')) {
                              await deleteLeavePolicy(policy.id);
                              toast.success("Policy deleted");
                              fetchData();
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const totalDays = Number(policy.days_per_year || policy.total_days || policy.totalDays || 0);
                      const usedDays = leaves
                             .filter((l: any) => l.status?.toUpperCase() === 'APPROVED' && l.leave_policy_id == policy.id)
                             .reduce((sum: number, l: any) => sum + Number(l.duration || l.days || 0), 0);
                      const balance = Math.max(0, totalDays - usedDays);
                      
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Limit:</span>
                            <span className="font-medium text-gray-900">{totalDays} days</span>
                          </div>
                          <div className="flex items-center justify-between bg-blue-50 -mx-4 px-4 py-2 rounded-sm border-y border-blue-100">
                            <span className="text-sm font-medium text-gray-900">Available Balance:</span>
                            <span className="font-bold text-indigo-600">{balance} days</span>
                          </div>
                        </>
                      );
                    })()}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Carry Forward:</span>
                      <span className="font-semibold">{policy.carry_forward_days !== undefined ? policy.carry_forward_days : (policy.carry_forward || policy.carryForward || 0)} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Accrual Rate:</span>
                      <span className="font-semibold">{policy.accrual_rate || policy.accrualRate || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${(policy.leave_category === 'paid' || policy.is_paid) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                        {(policy.leave_category === 'paid' || policy.is_paid) ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">{policy.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Policy Configuration Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Configuration Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Accrual-Based Policies</h4>
                  <p className="text-sm text-blue-700">Employees earn leave days gradually over time based on their tenure and work hours.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Carry Forward Rules</h4>
                  <p className="text-sm text-green-700">Define how many unused days can be transferred to the next year to prevent loss.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Eligibility Criteria</h4>
                  <p className="text-sm text-purple-700">Set conditions like probation period completion or employment type for leave access.</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">Paid vs Unpaid</h4>
                  <p className="text-sm text-amber-700">Specify whether the leave is paid or unpaid to manage payroll calculations.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === "statistics" && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Leave Days", value: "1,247", icon: Calendar, color: "indigo", change: "+12%" },
              { label: "Avg per Employee", value: "8.2", icon: Users, color: "green", change: "+5%" },
              { label: "Approval Rate", value: "94%", icon: Check, color: "blue", change: "+2%" },
              { label: "Utilization Rate", value: "68%", icon: TrendingUp, color: "purple", change: "+8%" },
            ].map((stat, idx) => (
              <Card key={idx}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-semibold mt-2">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last year
                    </p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Leave Distribution by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Distribution by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const distributionHistory = leaveHistory.filter((l: any) => l.status === 'APPROVED');
                  const distCounts: Record<string, number> = {};
                  distributionHistory.forEach((l: any) => {
                    const type = l.leave_policy?.name || l.leave_policy?.policy_name || l.leave_policy?.leave_type || l.leaveType || 'Other';
                    distCounts[type] = (distCounts[type] || 0) + (l.duration || l.days || 0);
                  });
                  
                  const totalDaysMapped = Object.values(distCounts).reduce((a, b) => a + b, 0);
                  const colors = ['blue', 'red', 'purple', 'pink', 'indigo', 'amber', 'green', 'teal'];
                  
                  const distributionArr = Object.entries(distCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count], idx) => ({
                      type,
                      count,
                      percentage: totalDaysMapped > 0 ? Math.round((count / totalDaysMapped) * 100) : 0,
                      color: colors[idx % colors.length]
                    }));

                  if (distributionArr.length === 0) {
                     return <p className="text-sm text-gray-500 text-center py-4">No data available</p>;
                  }

                  return distributionArr.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                          <span className="text-sm font-medium">{item.type}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{item.count} days</span>
                          <span className="text-xs text-gray-500 ml-2">({item.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-${item.color}-500 h-2 rounded-full transition-all`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Department-wise Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Leave Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg/Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { dept: "Engineering", employees: 450, total: 3825, avg: 8.5, pending: 12, util: 71 },
                      { dept: "Sales", employees: 320, total: 2688, avg: 8.4, pending: 8, util: 70 },
                      { dept: "Marketing", employees: 180, total: 1476, avg: 8.2, pending: 5, util: 68 },
                      { dept: "HR", employees: 120, total: 960, avg: 8.0, pending: 3, util: 67 },
                      { dept: "Finance", employees: 177, total: 1416, avg: 8.0, pending: 4, util: 67 },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{row.dept}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{row.employees}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{row.total}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{row.avg}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            {row.pending}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${row.util}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{row.util}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Leave Trends (2026)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { month: "January", leaves: 145, bar: 72 },
                  { month: "February", leaves: 132, bar: 66 },
                  { month: "March", leaves: 156, bar: 78 },
                  { month: "April", leaves: 178, bar: 89 },
                  { month: "May", leaves: 189, bar: 95 },
                  { month: "June", leaves: 201, bar: 100 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.month}</span>
                      <span className="text-sm font-semibold">{item.leaves} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${item.bar}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Tracking Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Attendance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Present Today", value: attendanceStats?.presentToday || 0, icon: Check, color: "green" },
              { label: "Late Arrivals", value: attendanceStats?.lateToday || 0, icon: Clock, color: "amber" },
              { label: "Half Days", value: 0, icon: Calendar, color: "blue" },
              { label: "Absent", value: attendanceStats?.absentToday || 0, icon: X, color: "red" },
            ].map((stat, idx) => (
              <Card key={idx}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-semibold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* My Leave Balance & Request - Only for Admin, Manager, Employee */}
          {user && user.role !== UserRole.SUPER_ADMIN && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leave Balance Cards */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Attendance Actions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <Button
                        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => handleAttendanceAction('check-in')}
                      >
                        <LogIn className="w-4 h-4" />
                        Check In
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 border-red-600 text-red-600 hover:bg-red-50"
                        onClick={() => handleAttendanceAction('check-out')}
                      >
                        <LogOut className="w-4 h-4" />
                        Check Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My Leave Balance</CardTitle>
                      <Button className="gap-2" onClick={() => setShowLeaveRequestModal(true)}>
                        <Plus className="w-4 h-4" />
                        Request Leave
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        // Calculate dynamic balances based on Policies and My Requests (leaves)
                        const dynamicBalances = policies.map((policy: any) => {
                           const totalDays = Number(policy.days_per_year || policy.total_days || 0);
                           
                           // Find all APPROVED leave requests for this exact policy for the employee
                           const usedDays = leaves
                             .filter((l: any) => l.status?.toUpperCase() === 'APPROVED' && l.leave_policy_id == policy.id)
                             .reduce((sum: number, l: any) => sum + Number(l.duration || l.days || 0), 0);
                             
                           const balance = Math.max(0, totalDays - usedDays);
                           
                           return {
                             policy_name: policy.policy_name || policy.name,
                             total_days: totalDays,
                             used: usedDays,
                             balance: balance,
                             color: policy.leave_color || policy.color || 'blue'
                           };
                        }).filter(b => b.total_days > 0); // Only show policies that actually grant days

                        if (dynamicBalances.length === 0) {
                          return <p className="text-sm text-gray-500 col-span-2">No leave policies assigned yet.</p>;
                        }

                        return dynamicBalances.map((leave, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">{leave.policy_name}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium bg-${leave.color}-100 text-${leave.color}-700`}>
                                {leave.balance} days left
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-medium">{leave.total_days} days</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Used:</span>
                                <span className="font-medium">{leave.used} days</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                  className={`bg-${leave.color}-500 h-2 rounded-full transition-all`}
                                  style={{ width: `${leave.total_days > 0 ? (leave.used / leave.total_days) * 100 : 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* My Recent Leaves */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Recent Leaves</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {leaveHistory.slice(0, 3).map((leave, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{leave.leave_policy?.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                              {leave.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{new Date(leave.start_date).toLocaleDateString()}</span>
                            <span>{leave.duration} days</span>
                          </div>
                        </div>
                      ))}
                      {leaveHistory.length === 0 && (
                        <p className="text-sm text-gray-500">No recent leave requests.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Attendance Filters */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employee..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <input
                  type="date"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue="2026-03-03"
                />
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Sales</option>
                  <option>Marketing</option>
                  <option>HR</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>All Status</option>
                  <option>Present</option>
                  <option>Late</option>
                  <option>Half Day</option>
                  <option>Absent</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {isEmployee ? "My Attendance Record" : "Attendance Records"} - {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Work Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.map((record: any) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{record.user?.full_name || record.employeeName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{record.user?.employee_id || record.employeeId || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {record.date ? new Date(record.date).toLocaleDateString() : record.date}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <LogIn className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">
                              {record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <LogOut className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium">
                              {record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-indigo-600">{record.work_hours || 0} hrs</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.location || 'N/A'}</td>
                      </tr>
                    ))}
                    {!loading && attendance.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No attendance records found for today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { day: "Monday", present: 1189, late: 18, absent: 10 },
                    { day: "Tuesday", present: 1195, late: 15, absent: 8 },
                    { day: "Wednesday", present: 1178, late: 23, absent: 12 },
                    { day: "Thursday", present: 1192, late: 19, absent: 9 },
                    { day: "Friday", present: 1165, late: 28, absent: 15 },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.day}</span>
                        <span className="text-sm text-gray-500">Total: {item.present + item.late + item.absent}</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 text-center p-2 bg-green-100 rounded">
                          <p className="text-xs text-green-700">Present</p>
                          <p className="text-sm font-semibold text-green-900">{item.present}</p>
                        </div>
                        <div className="flex-1 text-center p-2 bg-amber-100 rounded">
                          <p className="text-xs text-amber-700">Late</p>
                          <p className="text-sm font-semibold text-amber-900">{item.late}</p>
                        </div>
                        <div className="flex-1 text-center p-2 bg-red-100 rounded">
                          <p className="text-xs text-red-700">Absent</p>
                          <p className="text-sm font-semibold text-red-900">{item.absent}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-green-900">Excellent Attendance</h4>
                    </div>
                    <p className="text-sm text-green-700">Engineering department has 97% attendance rate this week</p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <h4 className="font-medium text-amber-900">Late Arrivals Peak</h4>
                    </div>
                    <p className="text-sm text-amber-700">Fridays show 65% more late arrivals than other weekdays</p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Remote Work Trend</h4>
                    </div>
                    <p className="text-sm text-blue-700">38% of employees work remotely on average this month</p>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <h4 className="font-medium text-purple-900">Avg Work Hours</h4>
                    </div>
                    <p className="text-sm text-purple-700">Employees average 8.3 hours per day, exceeding expectations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingPolicy ? "Edit Leave Policy" : "Add New Leave Policy"}</CardTitle>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handlePolicySubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Policy Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingPolicy?.name || editingPolicy?.policy_name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Annual Vacation"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Days per Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="total_days"
                      defaultValue={editingPolicy?.total_days || editingPolicy?.totalDays}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carry Forward Days
                    </label>
                    <input
                      type="number"
                      name="carry_forward"
                      defaultValue={editingPolicy?.carry_forward || editingPolicy?.carryForward || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accrual Rate
                    </label>
                    <input
                      type="text"
                      name="accrual_rate"
                      defaultValue={editingPolicy?.accrual_rate || editingPolicy?.accrualRate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="1.67 days/month"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="is_paid"
                      defaultValue={editingPolicy?.is_paid ? 'Paid' : 'Unpaid'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <select
                      name="color"
                      defaultValue={editingPolicy?.color || 'blue'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="blue">Blue</option>
                      <option value="red">Red</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                      <option value="indigo">Indigo</option>
                      <option value="pink">Pink</option>
                      <option value="gray">Gray</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={editingPolicy?.description}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Brief description of this leave policy..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowPolicyModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingPolicy ? "Update Policy" : "Create Policy"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leave Request Modal - Only for Admin, Manager, Employee */}
      {showLeaveRequestModal && user && user.role !== UserRole.SUPER_ADMIN && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Request Leave</CardTitle>
                <button
                  onClick={() => setShowLeaveRequestModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleApplyLeaveSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leave Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={leaveRequestData.leave_policy_id}
                      onChange={(e) => setLeaveRequestData({ ...leaveRequestData, leave_policy_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Leave Type</option>
                      {leaveBalances.map((b: any) => (
                        <option key={b.leave_policy_id} value={b.leave_policy_id}>
                          {b.policy_name} ({b.balance} days available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={leaveRequestData.start_date}
                      onChange={(e) => setLeaveRequestData({ ...leaveRequestData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={leaveRequestData.end_date}
                      onChange={(e) => setLeaveRequestData({ ...leaveRequestData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={leaveRequestData.reason}
                      onChange={(e) => setLeaveRequestData({ ...leaveRequestData, reason: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Please provide a reason for your leave request..."
                      required
                    />
                  </div>

                  <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> Your leave request will be sent to your manager for approval.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowLeaveRequestModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Submit Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
