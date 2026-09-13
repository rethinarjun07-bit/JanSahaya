import { NextResponse } from "next/server";
import db from "@/lib/db";
import { compareSolutions, SolutionProposalTarget } from "@/lib/nlp/matcher";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get("challengeId");

    let challenge = challengeId
      ? await db.challenge.findUnique({
          where: { id: challengeId },
        })
      : await db.challenge.findFirst({
          where: { solutions: { some: {} } },
        });

    if (!challenge) {
      return NextResponse.json({ error: "No challenge with proposals found" }, { status: 404 });
    }

    const targetChallengeId = challenge.id;

    const solutions = await db.solution.findMany({
      where: { challengeId: targetChallengeId },
      include: {
        author: { select: { id: true, name: true, organization: true } },
        _count: { select: { reviews: true } },
      },
    });

    if (solutions.length === 0) {
      return NextResponse.json({
        challengeId,
        comparisons: [],
        message: "No solution proposals submitted yet for this challenge.",
      });
    }

    const proposalsTarget: SolutionProposalTarget[] = solutions.map((s) => ({
      id: s.id,
      title: s.title,
      abstract: s.abstract,
      methodology: s.methodology,
      techStack: s.techStack ? JSON.parse(s.techStack) : [],
      budgetEstimate: s.budgetEstimate,
      timelineMonths: s.timelineMonths,
      teamName: s.teamName,
      authorName: s.author.name,
      reviewsCount: s._count.reviews,
    }));

    const comparisons = compareSolutions(proposalsTarget, challenge.category);

    return NextResponse.json({
      challengeId,
      totalProposals: solutions.length,
      selectedSolutionId: challenge.selectedSolutionId,
      comparisons,
      governanceNotice: "AI Proposal Evaluation is purely advisory. Final solution selection and deployment endorsement is strictly executed by Government Authorities.",
    });
  } catch (error: unknown) {
    console.error("Compare Solutions Error:", error);
    return NextResponse.json({ error: "Failed to compare solutions" }, { status: 500 });
  }
}
