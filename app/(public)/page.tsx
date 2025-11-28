export default function PublicPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="heading-1 mb-6">
            Learn anything with
            <span className="text-brand-purple-600"> AI tutors</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Connect with specialized AI agents created by expert educators. Get
            personalized learning experiences that adapt to your pace.
          </p>
          <div className="flex gap-4">
            <button className="btn-primary text-lg px-8 py-3">
              Start Learning
            </button>
            <button className="btn-outline text-lg px-8 py-3">
              Explore Agents
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="heading-2 mb-12 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-purple-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="heading-3 mb-2">Find Your Agent</h3>
            <p className="body-text">
              Browse hundreds of specialized AI tutors created by expert
              educators.
            </p>
          </div>
          <div className="card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-teal-100 flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="heading-3 mb-2">Start Learning</h3>
            <p className="body-text">
              Have natural conversations and get personalized guidance.
            </p>
          </div>
          <div className="card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-purple-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="heading-3 mb-2">Track Progress</h3>
            <p className="body-text">
              Monitor your learning journey and unlock new concepts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="card bg-gradient-to-br from-brand-purple-600 to-brand-teal-500 text-white p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of learners already using Athena.
          </p>
          <button className="bg-white text-brand-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Create Free Account
          </button>
        </div>
      </section>
    </div>
  );
}
