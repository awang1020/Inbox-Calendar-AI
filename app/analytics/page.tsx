import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics | FlowTask",
  description: "Visualize productivity metrics and task performance."
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}

