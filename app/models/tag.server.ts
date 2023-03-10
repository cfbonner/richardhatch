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
  const URI_UNSAFE_REGEX =
    /[\x00-\x1f\x7f-\x9f!"#$%&'()*+,\/:;<=>?@[\\\]^`{|}~]/g;
  /*
  This regex pattern matches all the characters that are not safe to use in URIs,
  as defined in RFC 3986. The pattern includes all control characters (ASCII codes 0-31 and 127-159) 
  as well as some special characters that have special meanings in URIs.

  The g flag at the end of the pattern is used to make the pattern global, 
  which means it will match all occurrences of unsafe characters in a string, not just the first one.

  You can use this regex pattern with the replace() method to replace all unsafe characters with their URI-encoded equivalents. 
  */
  const safeSlug = str.replace(URI_UNSAFE_REGEX, encodeURIComponent);
  // Remove all non-word characters (everything except numbers and letters)
  const removedNonWord = safeSlug.replace(/\W/g, " ");
  // Replace all runs of whitespace with a single dash
  const replacedWhitespace = removedNonWord.trim().replace(/\s+/g, "-");
  // Convert to lowercase
  const lowercased = replacedWhitespace.toLowerCase();
  // Remove any leading or trailing dashes
  const removedDashes = lowercased.replace(/^-+|-+$/g, "");
  return removedDashes;
}
