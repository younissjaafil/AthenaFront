export default function StudentDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-1 mb-2">Welcome back!</h1>
        <p className="text-gray-600">Continue your learning journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="small-text text-gray-600">Active Chats</span>
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-3xl font-bold text-brand-purple-600">5</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="small-text text-gray-600">Hours Learned</span>
            <span className="text-2xl">⏱️</span>
          </div>
          <p className="text-3xl font-bold text-brand-teal-500">24</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="small-text text-gray-600">Agents Used</span>
            <span className="text-2xl">🤖</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">12</p>
        </div>
      </div>

      {/* Recent Chats */}
      <div className="card">
        <h2 className="heading-2 mb-6">Recent Chats</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border-light hover:border-brand-purple-300 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Python Fundamentals
                  </h3>
                  <p className="small-text text-gray-600">
                    Last message: Can you explain list comprehension?
                  </p>
                </div>
                <span className="text-xs text-gray-500">2h ago</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
