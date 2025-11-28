export default function CreatorDashboard() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="heading-1 mb-2">Creator Dashboard</h1>
          <p className="text-gray-600">Manage your AI agents and content</p>
        </div>
        <button className="btn-primary">+ Create New Agent</button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="small-text text-gray-600">Total Agents</span>
            <span className="text-2xl">🤖</span>
          </div>
          <p className="text-3xl font-bold text-brand-purple-600">8</p>
          <p className="text-xs text-gray-500 mt-1">+2 this month</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="small-text text-gray-600">Active Users</span>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-brand-teal-500">342</p>
          <p className="text-xs text-gray-500 mt-1">+56 this week</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="small-text text-gray-600">Total Sessions</span>
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">1,248</p>
          <p className="text-xs text-gray-500 mt-1">+124 today</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="small-text text-gray-600">Revenue</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-brand-purple-600">$2,450</p>
          <p className="text-xs text-gray-500 mt-1">+$340 this month</p>
        </div>
      </div>

      {/* My Agents */}
      <div className="card mb-8">
        <h2 className="heading-2 mb-6">My Agents</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border-light hover:border-brand-purple-300 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-purple-400 to-brand-teal-400 flex items-center justify-center text-white text-xl">
                  🤖
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Python Tutor Pro
                  </h3>
                  <p className="small-text text-gray-600 mb-2">
                    Expert in Python programming and best practices
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>156 users</span>
                    <span>•</span>
                    <span>4.8★</span>
                    <span>•</span>
                    <span className="text-brand-teal-600 font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="heading-2 mb-6">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-2 h-2 rounded-full bg-brand-teal-400"></div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Student #234</span> started a
                session with{" "}
                <span className="font-medium">Python Tutor Pro</span>
              </p>
              <span className="text-xs text-gray-500 ml-auto">5m ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
