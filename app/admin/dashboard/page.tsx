import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-1 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* System Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="small-text text-gray-600">Total Users</span>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-brand-purple-600">12,458</p>
          <p className="text-xs text-gray-500 mt-1">+234 this week</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="small-text text-gray-600">Active Agents</span>
            <span className="text-2xl">🤖</span>
          </div>
          <p className="text-3xl font-bold text-brand-teal-500">1,847</p>
          <p className="text-xs text-gray-500 mt-1">+89 this week</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="small-text text-gray-600">Sessions Today</span>
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">8,945</p>
          <p className="text-xs text-gray-500 mt-1">Peak: 12,340</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="small-text text-gray-600">System Health</span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-green-600">99.9%</p>
          <p className="text-xs text-gray-500 mt-1">All systems operational</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="heading-2 mb-6">Recent Users</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-brand-purple-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-brand-purple-700">
                    U
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    user_{i}@example.com
                  </p>
                  <p className="text-xs text-gray-500">Joined 2 hours ago</p>
                </div>
                <span className="text-xs text-brand-teal-600 font-medium">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="heading-2 mb-6">System Alerts</h2>
          <div className="space-y-3">
            {[
              {
                type: "info",
                msg: "Database backup completed",
                time: "10m ago",
              },
              {
                type: "warning",
                msg: "High API usage detected",
                time: "25m ago",
              },
              { type: "success", msg: "New agent published", time: "1h ago" },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-1.5",
                    alert.type === "info" && "bg-blue-500",
                    alert.type === "warning" && "bg-yellow-500",
                    alert.type === "success" && "bg-green-500"
                  )}
                ></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{alert.msg}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
