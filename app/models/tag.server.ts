import type { Post, Tag } from "@prisma/client";
import { prisma } from "~/db.server";

export function findOrCreateTag({ title }: Pick<Tag, "title">) {
  const slug = createSlug(title);
  return prisma.tag.upsert({
    create: {
      title: title,
      slug: slug,
    },
    update: {},
    where: {
      slug: slug,
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
