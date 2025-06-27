import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { useLocation, Link } from "wouter";
import { ArrowLeft } from "lucide-react";

interface SoulHug {
  id: string;
  relationship: string;
  tone: string;
  occasion?: string;
  message: string;
  audioUrl?: string;
  imageUrl?: string;
  createdAt?: any;
}

export default function MyHugs() {
  const [soulHugs, setSoulHugs] = useState<SoulHug[]>([]);
  const [filtered, setFiltered] = useState<SoulHug[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    relationship: "",
    tone: "",
    occasion: "",
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [location, setLocation] = useLocation();
  const [showQrId, setShowQrId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoading(false);
      if (!user) {
        // Don't auto-redirect, let user see sign-in prompt
        setUser(null);
      } else {
        setUser(user);
        fetchHugs(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHugs = async (uid: string) => {
    setLoading(true);
    const q = query(collection(db, "soulHugs"), where("userId", "==", uid));
    const snap = await getDocs(q);
    const data: SoulHug[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SoulHug[];
    setSoulHugs(data);
    setFiltered(data);
    setLoading(false);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (f: typeof filters) => {
    let results = [...soulHugs];
    if (f.search) {
      results = results.filter((hug) =>
        hug.message.toLowerCase().includes(f.search.toLowerCase())
      );
    }
    if (f.relationship) {
      results = results.filter((hug) => hug.relationship === f.relationship);
    }
    if (f.tone) {
      results = results.filter((hug) => hug.tone === f.tone);
    }
    if (f.occasion) {
      results = results.filter((hug) => hug.occasion === f.occasion);
    }
    setFiltered(results);
  };

  const handleDelete = async (id: string, hugTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${hugTitle}"?`)) return;
    
    try {
      await deleteDoc(doc(db, "soulHugs", id));
      setSoulHugs(prev => prev.filter(h => h.id !== id));
      setFiltered(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error("Error deleting hug:", error);
      alert("Failed to delete Soul Hug. Please try again.");
    }
  };

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/hug/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy link. Please try again.");
    });
  };

  const handleShareEmail = (id: string, message: string) => {
    const link = `${window.location.origin}/hug/${id}`;
    const subject = encodeURIComponent("Your Soul Hug");
    const body = encodeURIComponent(`I created a personalized Soul Hug for you:\n\n"${message.substring(0, 100)}..."\n\nOpen your Soul Hug here: ${link}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="p-6 text-white bg-gradient-to-br from-purple-900 to-indigo-800 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-white bg-gradient-to-br from-purple-900 to-indigo-800 min-h-screen">
        <div className="max-w-2xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">My Soul Hugs</h1>
          <p className="text-gray-300 mb-8">Please sign in to view your saved Soul Hugs</p>
          <div className="space-y-4">
            <button
              onClick={() => setLocation("/")}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg border border-white/40 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white bg-gradient-to-br from-purple-900 to-indigo-800 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">My Soul Hugs</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by message"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="p-2 rounded text-black"
        />
        <select 
          value={filters.relationship} 
          onChange={(e) => handleFilterChange("relationship", e.target.value)} 
          className="p-2 rounded text-black"
        >
          <option value="">All Relationships</option>
          <option value="Partner">Partner</option>
          <option value="Friend">Friend</option>
          <option value="Mom">Mom</option>
          <option value="Dad">Dad</option>
          <option value="Child">Child</option>
        </select>
        <select 
          value={filters.tone} 
          onChange={(e) => handleFilterChange("tone", e.target.value)} 
          className="p-2 rounded text-black"
        >
          <option value="">All Tones</option>
          <option value="Warm">Warm</option>
          <option value="Empowering">Empowering</option>
          <option value="Reassuring">Reassuring</option>
        </select>
        <select 
          value={filters.occasion} 
          onChange={(e) => handleFilterChange("occasion", e.target.value)} 
          className="p-2 rounded text-black"
        >
          <option value="">All Occasions</option>
          <option value="Birthday">Birthday</option>
          <option value="Grief">Grief</option>
          <option value="Motivation">Motivation</option>
          <option value="Hard Day">Hard Day</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-300">You haven't saved any Soul Hugs yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((hug) => (
            <div key={hug.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {hug.relationship}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {hug.tone}
                  </span>
                  {hug.occasion && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {hug.occasion}
                    </span>
                  )}
                </div>
                
                <p className="text-white text-sm line-clamp-3">
                  {hug.message}
                </p>
                
                {hug.audioUrl && (
                  <audio controls className="w-full h-8">
                    <source src={hug.audioUrl} type="audio/mp3" />
                    <source src={hug.audioUrl} type="audio/wav" />
                    Your browser does not support audio playback.
                  </audio>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-300">
                  {hug.audioUrl && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Audio
                    </span>
                  )}
                  {hug.imageUrl && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Image
                    </span>
                  )}
                  {hug.createdAt && (
                    <span>
                      {hug.createdAt?.toDate ? hug.createdAt.toDate().toLocaleDateString() : 'Recent'}
                    </span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/20">
                  {!hug.audioUrl && (
                    <Link href={`/hug/${hug.id}/record`}>
                      <button className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs transition-colors">
                        Add Voice
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={() => handleCopyLink(hug.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => handleShareEmail(hug.id, hug.message)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
                  >
                    Email
                  </button>
                  <button
                    onClick={() => setShowQrId(showQrId === hug.id ? null : hug.id)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-colors"
                  >
                    Share URL
                  </button>
                  <button
                    onClick={() => handleDelete(hug.id, `${hug.relationship} - ${hug.tone}`)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors ml-auto"
                  >
                    Delete
                  </button>
                </div>
                
                {/* Share URL Display */}
                {showQrId === hug.id && (
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-300 text-center">
                    <div className="text-xs text-gray-600 mb-2">Share this URL:</div>
                    <div className="bg-gray-100 p-2 rounded text-xs break-all text-gray-800">
                      {window.location.origin}/hug/{hug.id}
                    </div>
                    <button
                      onClick={() => handleCopyLink(hug.id)}
                      className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Copy URL
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-start mt-8">
        <Link href="/audio-hug" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>
    </div>
  );
}