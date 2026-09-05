import React from "react";
import db from "@/lib/db";
import { HomeClient } from "@/components/home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch live stats and featured challenges from database
  const totalChallenges = await db.challenge.count();
  const totalSolutions = await db.solution.count();
  const totalSolvers = await db.user.count({ where: { role: "SOLVER" } });
  const criticalCount = await db.challenge.count({ where: { severity: "CRITICAL" } });

  const featuredChallenges = await db.challenge.findMany({
    where: { status: { not: "MERGED" } },
    orderBy: [{ urgencyScore: "desc" }, { createdAt: "desc" }],
    take: 6,
    include: {
      _count: {
        select: { solutions: true, upvotes: true },
      },
    },
  });

  return (
    <HomeClient
      totalChallenges={totalChallenges}
      totalSolutions={totalSolutions}
      totalSolvers={totalSolvers}
      criticalCount={criticalCount}
      featuredChallenges={featuredChallenges}
    />
  );
}
