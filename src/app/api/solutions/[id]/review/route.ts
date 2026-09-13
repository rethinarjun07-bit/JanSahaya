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

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required to submit technical evaluations.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const allowedReviewerRoles = ["SOLVER", "INDUSTRY", "ADMIN"];
    if (!allowedReviewerRoles.includes(session.role)) {
      return NextResponse.json(
        {
          error: "Forbidden: Only Technical Evaluators (SOLVER, INDUSTRY, ADMIN) can submit proposal reviews.",
          code: "INSUFFICIENT_PRIVILEGES",
        },
        { status: 403 }
      );
    }

    const reviewerId = session.userId;
    const reviewerRole = session.role;

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
