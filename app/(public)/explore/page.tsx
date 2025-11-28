export default function ExplorePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="heading-1 mb-6">Explore Agents</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-hover">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-purple-400 to-brand-teal-400 flex items-center justify-center text-white text-2xl mb-4">
              🤖
            </div>
            <h3 className="heading-3 mb-2">AI Tutor {i}</h3>
            <p className="small-text mb-4">
              Expert in helping students learn complex topics with ease.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>4.8★</span>
              <span>•</span>
              <span>1.2k users</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
