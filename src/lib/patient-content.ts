type ContentItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  url: string | null;
  content: string | null;
  sortOrder: number;
};

export type { ContentItem };

export function sanitizePatientContents<T extends ContentItem>(contents: T[]): T[] {
  return contents.map((item) => {
    if (item.type === "YOUTUBE") {
      return { ...item, url: null };
    }
    return item;
  });
}
