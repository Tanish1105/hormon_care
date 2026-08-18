import { getYoutubeVideoId } from "./youtube";
import { parsePlanContentSection, isSafeHttpUrl, type PlanContentSection } from "./plan-sections";

export type PlanContentInput = {
  section: PlanContentSection;
  type: string;
  title: string;
  description: string | null;
  url: string | null;
  content: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
};

const VALID_TYPES = new Set(["TEXT", "IMAGE", "VIDEO", "YOUTUBE", "LINK", "EXERCISE"]);

export function parsePlanContentInput(body: unknown): PlanContentInput | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }

  const data = body as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  let type = typeof data.type === "string" ? data.type.trim().toUpperCase() : "";
  const url = typeof data.url === "string" && data.url.trim() ? data.url.trim() : null;
  const description =
    typeof data.description === "string" && data.description.trim() ? data.description.trim() : null;
  const content = typeof data.content === "string" && data.content.trim() ? data.content.trim() : null;

  if (!VALID_TYPES.has(type)) {
    return { error: "Type must be Description, Image, Video, or Link" };
  }

  if (type === "TEXT") {
    const bodyText = content || description;
    if (!bodyText) return { error: "Please enter a description" };
    return {
      section: parsePlanContentSection(data.section),
      type: "TEXT",
      title: title || "Notes",
      description: description && content ? description : null,
      url: null,
      content: bodyText,
      imageUrl: null,
      videoUrl: null,
    };
  }

  if (!title) {
    return { error: "Title is required" };
  }

  if (type === "LINK" || type === "YOUTUBE") {
    if (!url) return { error: "A link URL is required" };
    if (!isSafeHttpUrl(url)) return { error: "Please enter a valid http or https URL" };
    type = getYoutubeVideoId(url) ? "YOUTUBE" : "LINK";
  }
  if (type === "IMAGE" && !url) {
    return { error: "Please upload an image" };
  }
  if (type === "VIDEO" && !url) {
    return { error: "Please upload a video" };
  }

  return {
    section: parsePlanContentSection(data.section),
    type,
    title,
    description,
    url,
    content,
    imageUrl: typeof data.imageUrl === "string" && data.imageUrl.trim() ? data.imageUrl.trim() : null,
    videoUrl: typeof data.videoUrl === "string" && data.videoUrl.trim() ? data.videoUrl.trim() : null,
  };
}
