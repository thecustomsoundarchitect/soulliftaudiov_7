import { Link, useLocation } from "wouter";

export default function NavBar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/define", label: "Define" },
    { path: "/gather", label: "Gather" },
    { path: "/craft", label: "Craft" },
    { path: "/audio-hug", label: "Audio Hug" }
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Home Link */}
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SoulLift
          </Link>

          {/* Main Navigation */}
          <ul className="flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path} 
                    className={`text-lg font-medium transition-colors duration-200 ${
                      isActive 
                        ? 'text-purple-600 border-b-2 border-purple-600 pb-1' 
                        : 'text-slate-600 hover:text-purple-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Home Link */}
          <Link 
            href="/" 
            className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </nav>
  );
}