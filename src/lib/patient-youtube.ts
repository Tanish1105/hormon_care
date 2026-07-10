import { prisma } from "@/lib/prisma";

async function verifyAssignment(
  patients: { id: string }[]
): Promise<boolean> {
  return patients.length > 0;
}

export async function getPatientYoutubeUrl(
  contentId: string,
  source: string,
  userId: string
): Promise<string | null> {
  if (source === "garbha") {
    const content = await prisma.garbhaContent.findUnique({
      where: { id: contentId },
      include: {
        week: {
          include: {
            plan: {
              include: {
                patients: { where: { userId }, select: { id: true } },
              },
            },
          },
        },
      },
    });
    if (!content || content.type !== "YOUTUBE" || !content.url) return null;
    if (!(await verifyAssignment(content.week.plan.patients))) return null;
    return content.url;
  }

  if (source === "child-guidance") {
    const weekContent = await prisma.childGuidanceContent.findUnique({
      where: { id: contentId },
      include: {
        week: {
          include: {
            plan: {
              include: {
                patients: { where: { userId }, select: { id: true } },
              },
            },
          },
        },
      },
    });
    if (weekContent?.type === "YOUTUBE" && weekContent.url) {
      if (await verifyAssignment(weekContent.week.plan.patients)) {
        return weekContent.url;
      }
    }

    const dayContent = await prisma.childGuidanceDayContent.findUnique({
      where: { id: contentId },
      include: {
        day: {
          include: {
            week: {
              include: {
                plan: {
                  include: {
                    patients: { where: { userId }, select: { id: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!dayContent || dayContent.type !== "YOUTUBE" || !dayContent.url) return null;
    if (!(await verifyAssignment(dayContent.day.week.plan.patients))) return null;
    return dayContent.url;
  }

  const content = await prisma.weekContent.findUnique({
    where: { id: contentId },
    include: {
      week: {
        include: {
          plan: {
            include: {
              patients: { where: { userId }, select: { id: true } },
            },
          },
        },
      },
    },
  });
  if (!content || content.type !== "YOUTUBE" || !content.url) return null;
  if (!(await verifyAssignment(content.week.plan.patients))) return null;
  return content.url;
}
