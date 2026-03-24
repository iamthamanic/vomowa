"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

interface TopSpender {
  politicianId: string;
  _sum: { amount: number };
  _count: number;
  politician: {
    name: string;
    party: string;
  };
}

export function TopSpenders() {
  const [spenders, setSpenders] = useState<TopSpender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopSpenders();
  }, []);

  const fetchTopSpenders = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/spending/stats`
      );
      const data = await response.json();
      setSpenders(data.topSpenders?.slice(0, 10) || []);
    } catch (error) {
      console.error("Error fetching top spenders:", error);
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

  const getPartyColor = (party: string) => {
    const colors: { [key: string]: string } = {
      "SPD": "bg-red-500",
      "CDU": "bg-black",
      "CSU": "bg-blue-600",
      "GRÜNE": "bg-green-500",
      "FDP": "bg-yellow-500",
      "AfD": "bg-blue-400",
      "LINKE": "bg-purple-500"
    };
    return colors[party] || "bg-gray-500";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Spender</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
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
          Top Spender
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {spenders.map((spender, index) => (
            <div
              key={spender.politicianId}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="text-lg font-bold text-muted-foreground w-6">
                {index + 1}
              </span>
              
              <Avatar className="h-10 w-10">
                <AvatarFallback className={`${getPartyColor(spender.politician.party)} text-white`}>
                  {spender.politician.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {spender.politician.name}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {spender.politician.party}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {spender._count} Reisen
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">
                  {formatCurrency(spender._sum.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}