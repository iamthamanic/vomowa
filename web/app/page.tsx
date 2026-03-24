import { StatsOverview } from "@/components/stats-overview";
import { TopSpenders } from "@/components/top-spenders";
import { RecentActivity } from "@/components/recent-activity";
import { SearchBar } from "@/components/search-bar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              vomowa
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6">
              VolksMoneyWatch
            </p>
            <p className="text-lg text-blue-50 mb-8">
              Transparenz für deutsche Politik. Echtzeit-Tracking politischer Ausgaben.
            </p>
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <StatsOverview />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Spenders */}
          <div className="lg:col-span-2">
            <TopSpenders />
          </div>

          {/* Recent Activity */}
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </main>
  );
}