import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any);
      const updootIdsToUser: Record<string, Updoot> = {};
      updoots.forEach((updoot) => {
        updootIdsToUser[`${updoot.userId}|${updoot.postId}`] = updoot;
      });

      const sortedUpdoots = keys.map(
        (key) => updootIdsToUser[`${key.userId}|${key.postId}`]
      );
      return sortedUpdoots;
    }
  );
