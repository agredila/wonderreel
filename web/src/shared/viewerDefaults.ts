/** Default viewer label when parent has not set a nickname yet. */
export const DEFAULT_VIEWER_NAME = 'My child';

export function isDefaultViewerName(name: string | null | undefined): boolean {
  if (!name) return true;
  return name.trim().toLowerCase() === DEFAULT_VIEWER_NAME.toLowerCase();
}

export type StoryStructure = 'single' | 'three_part';

export type CreateIntent = {
  prompt: string;
  structure: StoryStructure;
  category: string;
};
