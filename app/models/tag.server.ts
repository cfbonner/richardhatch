import type { Post, Tag, User } from "@prisma/client";
import { prisma } from "~/db.server";

export function findOrCreateTag({
  title,
  userId,
}: Pick<Tag, "title"> & { userId: User["id"] }) {
  const slug = createSlug(title);
  return prisma.tag.upsert({
    create: {
      title: title,
      slug: slug,
      userId: userId,
    },
    update: {},
    where: {
      userId_slug: {
        userId: userId,
        slug: slug,
      },
    },
  });
}

export function maybeTagPost({
  postId,
  tagId,
}: {
  postId: Post["id"];
  tagId: Tag["id"];
}) {
  return prisma.postTags.upsert({
    where: {
      postId_tagId: {
        postId: postId,
        tagId: tagId,
      },
    },
    create: {
      tagId: tagId,
      postId: postId,
    },
    update: {},
  });
}

export function getTags({ userId }: { userId: User["id"] }) {
  return prisma.tag.findMany({
    orderBy: { posts: { _count: "desc" } },
    where: { posts: { some: { post: { is: { userId: userId } } } } },
    select: {
      title: true,
      id: true,
      slug: true,
      _count: {
        select: { posts: true },
      },
    },
  });
}

function createSlug(str: string): string {
  // Remove all non-word characters (everything except numbers and letters)
  const removedNonWord = str.replace(/\W/g, " ");
  // Replace all runs of whitespace with a single dash
  const replacedWhitespace = removedNonWord.trim().replace(/\s+/g, "-");
  // Convert to lowercase
  const lowercased = replacedWhitespace.toLowerCase();
  // Remove any leading or trailing dashes
  const removedDashes = lowercased.replace(/^-+|-+$/g, "");
  return removedDashes;
}
