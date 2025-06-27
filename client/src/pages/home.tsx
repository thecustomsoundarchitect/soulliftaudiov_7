import { useState, useEffect } from "react";
import { Link } from "wouter";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { getUserCredits, addUserCredits } from "@/services/creditService";
import AuthModal from "@/components/auth/AuthModal";
import { ArrowRight, Plus, Eye, Headphones, User, LogOut, Coins } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [credits, setCredits] = useState(0);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  // Fetch user credits when user changes
  useEffect(() => {
    async function fetchCredits() {
      if (user) {
        const c = await getUserCredits();
        setCredits(c);
      } else {
        setCredits(0);
      }
    }
    fetchCredits();
  }, [user]);

  const handleEarnCredits = async () => {
    await addUserCredits(2);
    const newCredits = await getUserCredits();
    setCredits(newCredits);
    alert("You earned 2 credits!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            SoulLift Audio
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Emotional Intelligence meets AI — Craft your perfect Soul Hug with advanced personalization
          </p>
        </div>

        {/* Main Actions */}
        <div className="max-w-2xl mx-auto space-y-6 mb-12">
          
          <Link 
            href="/creative-flow"
            className="group block bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Create New Soul Hug</h3>
                  <p className="text-slate-400">Start your creative journey with AI assistance</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link 
            href="/my-hugs"
            className="group block bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">View My Soul Hugs</h3>
                  <p className="text-slate-400">Access your saved creations and memories</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link 
            href="/audio-hug"
            className="group block bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl p-8 border border-orange-400/20 hover:border-orange-400/40 transition-all duration-300 hover:from-orange-500/20 hover:to-red-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Audio Features</h3>
                  <p className="text-slate-400">Voice recording, AI narration, and music mixing</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* User Section */}
        {user ? (
          <div className="max-w-md mx-auto space-y-4">
            
            {/* Welcome Message */}
            <div className="text-center bg-white/5 backdrop-blur-xl rounded-xl px-6 py-4 border border-white/10">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Welcome back,</span>
              </div>
              <span className="font-semibold text-white">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
            
            {/* Credits Display */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 backdrop-blur-xl rounded-xl px-6 py-4 border border-yellow-400/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-slate-300">Available Credits</p>
                    <p className="text-2xl font-bold text-white">{credits}</p>
                  </div>
                </div>
                <button
                  onClick={handleEarnCredits}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors text-sm"
                >
                  Earn More
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl px-6 py-4 border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 hover:border-white/40 transition-all duration-200 font-medium"
            >
              Sign In or Create Account
            </button>
          </div>
        )}
      </div>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
    </div>
  );
}