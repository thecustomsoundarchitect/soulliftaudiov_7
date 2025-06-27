// FILE: AdminDashboard.tsx
// Description: Admin analytics page showing Soul Hug usage statistics

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useLocation } from "wouter";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SoulHug {
  tone: string;
  relationship: string;
  occasion?: string;
  createdAt?: any;
  userId: string;
  creditsUsed: number;
}

interface AdminStats {
  total: number;
  byTone: Record<string, number>;
  byRelationship: Record<string, number>;
  byOccasion: Record<string, number>;
  totalCreditsUsed: number;
  uniqueUsers: number;
  recentActivity: SoulHug[];
}

export default function AdminDashboard() {
  const [hugs, setHugs] = useState<SoulHug[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    byTone: {},
    byRelationship: {},
    byOccasion: {},
    totalCreditsUsed: 0,
    uniqueUsers: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        setLocation("/");
      } else {
        // Check if user is admin (you can customize this logic)
        if (user.email === "thecustomsoundarchitect@gmail.com") {
          fetchHugs();
        } else {
          setLocation("/");
        }
      }
    });
    return () => unsubscribe();
  }, [setLocation]);

  const fetchHugs = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "soulhugs"));
      const data: SoulHug[] = snap.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          tone: docData.tone || '',
          relationship: docData.relationship || '',
          occasion: docData.occasion || '',
          createdAt: docData.createdAt,
          userId: docData.userId || '',
          creditsUsed: docData.creditsUsed || 0
        } as SoulHug;
      });
      
      setHugs(data);
      computeStats(data);
    } catch (error) {
      console.error("Error fetching Soul Hugs:", error);
    } finally {
      setLoading(false);
    }
  };

  const computeStats = (data: SoulHug[]) => {
    const byTone: Record<string, number> = {};
    const byRelationship: Record<string, number> = {};
    const byOccasion: Record<string, number> = {};
    let totalCreditsUsed = 0;
    const uniqueUsers = new Set<string>();

    data.forEach(h => {
      // Count by tone
      const tone = h.tone || "Unknown";
      byTone[tone] = (byTone[tone] || 0) + 1;
      
      // Count by relationship
      const relationship = h.relationship || "Unknown";
      byRelationship[relationship] = (byRelationship[relationship] || 0) + 1;
      
      // Count by occasion
      const occasion = h.occasion || "Just because";
      byOccasion[occasion] = (byOccasion[occasion] || 0) + 1;
      
      // Track credits and users
      totalCreditsUsed += h.creditsUsed || 0;
      if (h.userId) {
        uniqueUsers.add(h.userId);
      }
    });

    // Sort data by creation date for recent activity
    const recentActivity = data
      .filter(h => h.createdAt)
      .sort((a, b) => {
        const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);

    setStats({
      total: data.length,
      byTone,
      byRelationship,
      byOccasion,
      totalCreditsUsed,
      uniqueUsers: uniqueUsers.size,
      recentActivity
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <Button 
            onClick={() => setLocation("/")}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            Back to Home
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/80">Total Soul Hugs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/80">Unique Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.uniqueUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/80">Credits Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCreditsUsed}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/80">Avg per User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.uniqueUsers > 0 ? Math.round(stats.total / stats.uniqueUsers * 10) / 10 : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tone Statistics */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Soul Hugs by Tone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byTone)
                  .sort(([,a], [,b]) => b - a)
                  .map(([tone, count]) => (
                    <div key={tone} className="flex justify-between items-center">
                      <span className="capitalize">{tone}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-white rounded-full h-2" 
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Relationship Statistics */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Soul Hugs by Relationship</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.byRelationship)
                  .sort(([,a], [,b]) => b - a)
                  .map(([relationship, count]) => (
                    <div key={relationship} className="flex justify-between items-center">
                      <span className="capitalize">{relationship}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-white rounded-full h-2" 
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Occasion Statistics */}
        <Card className="bg-white/10 border-white/20 text-white mb-8">
          <CardHeader>
            <CardTitle>Soul Hugs by Occasion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.byOccasion)
                .sort(([,a], [,b]) => b - a)
                .map(([occasion, count]) => (
                  <div key={occasion} className="text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-white/80 capitalize">{occasion}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((hug, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                  <div>
                    <div className="font-medium">{hug.relationship} • {hug.tone}</div>
                    <div className="text-sm text-white/60">{hug.occasion || "Just because"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{formatDate(hug.createdAt)}</div>
                    <div className="text-xs text-white/60">{hug.creditsUsed || 0} credits</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}