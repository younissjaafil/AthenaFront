export default function DesignSystemPage() {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-12">
        <h1 className="heading-1 mb-2">Design System</h1>
        <p className="text-gray-600">
          Athena&apos;s component library - Notion × Figma × Stripe aesthetic
        </p>
      </div>

      {/* Color Palette */}
      <section className="mb-16">
        <h2 className="heading-2 mb-6">Color Palette</h2>
        <div className="space-y-6">
          <div>
            <h3 className="heading-3 mb-4">Brand Purple</h3>
            <div className="grid grid-cols-6 gap-3">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                (shade) => (
                  <div key={shade} className="space-y-2">
                    <div
                      className={`h-20 rounded-xl bg-brand-purple-${shade} border border-border-light`}
                    ></div>
                    <p className="text-xs text-gray-600">{shade}</p>
                  </div>
                )
              )}
            </div>
          </div>
          <div>
            <h3 className="heading-3 mb-4">Brand Teal</h3>
            <div className="grid grid-cols-6 gap-3">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                (shade) => (
                  <div key={shade} className="space-y-2">
                    <div
                      className={`h-20 rounded-xl bg-brand-teal-${shade} border border-border-light`}
                    ></div>
                    <p className="text-xs text-gray-600">{shade}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="mb-16">
        <h2 className="heading-2 mb-6">Typography</h2>
        <div className="card space-y-6">
          <div>
            <h1 className="heading-1">Heading 1 - 40px Bold</h1>
            <p className="text-xs text-gray-500 mt-2">
              Use for main page titles
            </p>
          </div>
          <div>
            <h2 className="heading-2">Heading 2 - 28px Semibold</h2>
            <p className="text-xs text-gray-500 mt-2">
              Use for section headers
            </p>
          </div>
          <div>
            <h3 className="heading-3">Heading 3 - 20px Semibold</h3>
            <p className="text-xs text-gray-500 mt-2">
              Use for card titles and subsections
            </p>
          </div>
          <div>
            <p className="body-text">
              Body text - 16px Regular. Use for main content and paragraphs.
              This is the default text style for most content.
            </p>
            <p className="text-xs text-gray-500 mt-2">Use for body content</p>
          </div>
          <div>
            <p className="small-text">
              Small text - 14px Regular. Use for supporting text and captions.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Use for supporting information
            </p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-16">
        <h2 className="heading-2 mb-6">Buttons</h2>
        <div className="card">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="heading-3 mb-4">Primary</h3>
              <div className="space-y-3">
                <button className="btn-primary">Primary Button</button>
                <button className="btn-primary" disabled>
                  Disabled
                </button>
              </div>
            </div>
            <div>
              <h3 className="heading-3 mb-4">Secondary</h3>
              <div className="space-y-3">
                <button className="btn-secondary">Secondary Button</button>
                <button className="btn-secondary" disabled>
                  Disabled
                </button>
              </div>
            </div>
            <div>
              <h3 className="heading-3 mb-4">Outline</h3>
              <div className="space-y-3">
                <button className="btn-outline">Outline Button</button>
                <button className="btn-outline" disabled>
                  Disabled
                </button>
              </div>
            </div>
            <div>
              <h3 className="heading-3 mb-4">Ghost</h3>
              <div className="space-y-3">
                <button className="btn-ghost">Ghost Button</button>
                <button className="btn-ghost" disabled>
                  Disabled
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="heading-3 mb-4">Sizes</h3>
            <div className="flex items-center gap-3">
              <button className="btn-primary text-sm px-3 py-1.5">Small</button>
              <button className="btn-primary">Medium</button>
              <button className="btn-primary text-lg px-6 py-3">Large</button>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="mb-16">
        <h2 className="heading-2 mb-6">Cards</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="heading-3 mb-2">Basic Card</h3>
            <p className="body-text">
              Standard card with rounded-2xl corners, subtle shadow, and border.
            </p>
          </div>
          <div className="card-hover">
            <h3 className="heading-3 mb-2">Hoverable Card</h3>
            <p className="body-text">
              Card with hover effect - shadow increases on hover for interactive
              elements.
            </p>
          </div>
          <div className="card bg-gradient-to-br from-brand-purple-500 to-brand-teal-500 text-white">
            <h3 className="text-xl font-semibold mb-2">Gradient Card</h3>
            <p className="opacity-90">
              Use sparingly for CTAs and special highlights.
            </p>
          </div>
          <div className="card border-2 border-brand-purple-300 bg-brand-purple-50">
            <h3 className="heading-3 mb-2 text-brand-purple-700">
              Highlighted Card
            </h3>
            <p className="text-brand-purple-600">
              Use for featured content or important notices.
            </p>
          </div>
        </div>
      </section>

      {/* Forms */}
      <section className="mb-16">
        <h2 className="heading-2 mb-6">Form Elements</h2>
        <div className="card max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Input
              </label>
              <input
                type="text"
                placeholder="Enter text..."
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Input
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Textarea
              </label>
              <textarea
                placeholder="Enter longer text..."
                className="input min-h-[100px]"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-brand-purple-600 focus:ring-brand-purple-500"
                />
                <span className="text-sm text-gray-700">
                  Checkbox with label
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing & Layout */}
      <section className="mb-16">
        <h2 className="heading-2 mb-6">Spacing & Layout</h2>
        <div className="card">
          <h3 className="heading-3 mb-4">Whitespace Philosophy</h3>
          <ul className="space-y-2 body-text list-disc list-inside">
            <li>Use generous whitespace - let content breathe</li>
            <li>
              Card padding:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">p-6</code> (24px)
            </li>
            <li>
              Section spacing:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">mb-8</code> or{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">mb-16</code>
            </li>
            <li>
              Element gaps:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">gap-3</code>,{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">gap-4</code>,{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">gap-6</code>
            </li>
          </ul>
        </div>
      </section>

      {/* Icons & Emojis */}
      <section className="mb-16">
        <h2 className="heading-2 mb-6">Icons</h2>
        <div className="card">
          <p className="body-text mb-4">
            Using emojis for now - clean and simple. Can be replaced with icon
            library later.
          </p>
          <div className="flex gap-4 text-3xl">
            <span>🎯</span>
            <span>💬</span>
            <span>🤖</span>
            <span>📊</span>
            <span>📄</span>
            <span>📅</span>
            <span>⚙️</span>
            <span>👥</span>
            <span>📈</span>
            <span>✨</span>
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="mb-16">
        <h2 className="heading-2 mb-6">Design Principles</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="heading-3 mb-2">🎨 Clean & Minimal</h3>
            <p className="small-text">
              Off-white backgrounds, subtle borders, no gradients unless needed
              for emphasis.
            </p>
          </div>
          <div className="card">
            <h3 className="heading-3 mb-2">🎯 Purposeful Color</h3>
            <p className="small-text">
              Purple for primary actions, Teal for secondary/accents. Use
              sparingly.
            </p>
          </div>
          <div className="card">
            <h3 className="heading-3 mb-2">📐 Consistent Spacing</h3>
            <p className="small-text">
              Generous whitespace, card-based layouts, rounded-2xl corners
              everywhere.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
