import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SoulHug {
  id: string;
  relationship: string;
  tone: string;
  occasion?: string;
  message: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt?: any;
}

export default function HugPlayback() {
  const [match, params] = useRoute("/hug/:id");
  const [location, setLocation] = useLocation();
  const id = params?.id;

  const [hug, setHug] = useState<SoulHug | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHug() {
      if (!id) {
        setError("No Hug ID provided.");
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, "soulHugs", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("Soul Hug not found.");
        } else {
          setHug({ id: snap.id, ...(snap.data() as Omit<SoulHug, "id">) });
        }
      } catch (e: any) {
        setError(e.message || "Failed to load Soul Hug.");
      } finally {
        setLoading(false);
      }
    }
    fetchHug();
  }, [id]);

  if (loading) return <p className="p-6 text-white">Loading Soul Hug...</p>;
  if (error) return <p className="p-6 text-red-400">Error: {error}</p>;
  if (!hug) return <p className="p-6 text-white">No Soul Hug to display.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-blue-900 text-white p-6">
      <button
        onClick={() => window.history.back()}
        className="mb-4 px-4 py-2 bg-white/20 rounded"
      >
        Back
      </button>

      {hug.imageUrl && (
        <img
          src={hug.imageUrl}
          alt="Cover"
          className="w-full max-w-md mx-auto rounded mb-4"
        />
      )}

      <h1 className="text-2xl font-bold mb-2">
        {hug.relationship} - {hug.tone}{hug.occasion ? ` (${hug.occasion})` : ''}
      </h1>

      <p className="mb-4 whitespace-pre-line">{hug.message}</p>

      {hug.audioUrl && (
        <audio controls className="w-full mb-4">
          <source src={hug.audioUrl} type="audio/mp3" />
          Your browser does not support audio playback.
        </audio>
      )}

      <p className="text-sm text-gray-300">
        Created on:{' '}
        {hug.createdAt?.seconds
          ? new Date(hug.createdAt.seconds * 1000).toLocaleString()
          : 'Unknown'}
      </p>

      <div className="mt-8 text-center">
        <button
          onClick={() => setLocation("/")}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
        >
          Create Your Own Soul Hug
        </button>
      </div>
    </div>
  );
}