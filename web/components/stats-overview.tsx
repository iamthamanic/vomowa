"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Receipt, AlertCircle } from "lucide-react";

interface Stats {
  totalAmount: number;
  totalTransactions: number;
  totalPoliticians: number;
  avgAmount: number;
}

export function StatsOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/spending/stats`
      );
      const data = await response.json();
      
      setStats({
        totalAmount: data.summary?.totalAmount || 0,
        totalTransactions: data.summary?.totalTransactions || 0,
        totalPoliticians: 0, // TODO: fetch separately
        avgAmount: data.summary?.totalTransactions 
          ? data.summary.totalAmount / data.summary.totalTransactions 
          : 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: "Gesamtausgaben",
      value: formatCurrency(stats?.totalAmount || 0),
      icon: Receipt,
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Transaktionen",
      value: (stats?.totalTransactions || 0).toLocaleString("de-DE"),
      icon: TrendingUp,
      trend: "+5%",
      trendUp: true
    },
    {
      title: "Politiker",
      value: stats?.totalPoliticians?.toString() || "-",
      icon: Users,
      trend: "0%",
      trendUp: true
    },
    {
      title: "Durchschnitt",
      value: formatCurrency(stats?.avgAmount || 0),
      icon: AlertCircle,
      trend: "-3%",
      trendUp: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.title} className="bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className={`text-xs ${item.trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {item.trend} zum Vormonat
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}