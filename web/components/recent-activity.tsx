"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface Spending {
  id: string;
  amount: number;
  date: string;
  description: string;
  destination: string;
  politician: {
    name: string;
    party: string;
  };
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Spending[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/spending?limit=5`
      );
      const data = await response.json();
      setActivities(data.data || []);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Neueste Aktivität</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Neueste Aktivität
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Keine Daten verfügbar
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="border-b border-slate-100 last:border-0 pb-3 last:pb-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {activity.politician.name}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {activity.politician.party}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(activity.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
                
                {activity.destination && (
                  <p className="text-sm text-muted-foreground mt-1">
                    → {activity.destination}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}