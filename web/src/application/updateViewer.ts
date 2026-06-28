import { updateChild, type ChildProfile } from '@/lib/api';

type UpdateViewerInput = {
  token: string | null;
  child: ChildProfile;
  displayName: string;
  avatarEmoji: string;
};

export async function updateViewerProfile(input: UpdateViewerInput) {
  return updateChild(input.token, input.child.id, {
    displayName: input.displayName,
    avatarEmoji: input.avatarEmoji
  });
}
