import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType = "up", // "up" or "down"
}) {
  const TrendIcon = trendType === "up" ? ArrowUpRight : ArrowDownRight;
  const trendColor =
    trendType === "up" ? "text-emerald-600" : "text-red-500";

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
