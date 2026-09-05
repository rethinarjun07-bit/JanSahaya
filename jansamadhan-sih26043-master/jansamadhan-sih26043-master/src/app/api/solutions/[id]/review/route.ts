import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { ReviewSchema } from "@/lib/validators";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: solutionId } = params;
    const session = await getUserFromRequest(request);

    let reviewerId = session?.userId;
    let reviewerRole = session?.role || "MENTOR";

    if (!reviewerId) {
      // Default to Industry partner or Admin
      const demoReviewer = await db.user.findFirst({ where: { role: "INDUSTRY" } });
      if (!demoReviewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      reviewerId = demoReviewer.id;
      reviewerRole = "INDUSTRY";
    }

    const body = await request.json();
    const result = ReviewSchema.safeParse({ ...body, solutionId });
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    const review = await db.review.create({
      data: {
        solutionId,
        reviewerId,
        role: reviewerRole,
        rating: data.rating,
        feasibilityScore: data.feasibilityScore,
        impactScore: data.impactScore,
        costEffectiveness: data.costEffectiveness,
        scalabilityScore: data.scalabilityScore,
        feedback: data.feedback,
      },
      include: {
        reviewer: { select: { id: true, name: true, role: true, organization: true } },
      },
    });

    // Update solution status if mentor reviewed
    await db.solution.update({
      where: { id: solutionId },
      data: { status: "MENTOR_REVIEW" },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: unknown) {
    console.error("Post Review Error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
