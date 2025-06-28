import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function NavBar() {
  const [location] = useLocation();
  const { user, signOut, openAuthModal } = useAuth();

  const navItems = [
    { path: "/creative-flow", label: "Creative Flow" },
    { path: "/craft-soul-hug", label: "Craft" },
    { path: "/audio-hug", label: "Audio Hug" },
    { path: "/my-hugs", label: "My Hugs" }
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

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <Button 
                  onClick={signOut} 
                  variant="outline"
                  size="sm"
                  className="text-slate-600 border-slate-300 hover:bg-slate-50"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                onClick={openAuthModal}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}