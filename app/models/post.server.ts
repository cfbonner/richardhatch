import type { User, Post } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Post } from "@prisma/client";

export function getPost({
  id,
  userId,
}: Pick<Post, "id"> & {
  userId: User["id"];
}) {
  return prisma.post.findFirst({
    where: { id, userId },
  });
}

export function getPostListItems({ userId }: { userId: User["id"] }) {
  return prisma.post.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function getPosts({ userId }: { userId: User["id"] }) {
  return prisma.post.findMany({
    where: { userId },
    orderBy: { title: "asc" },
    include: { tags: { include: { tag: true } } },
  });
}

export function createPost({
  body,
  title,
  type = "post",
  userId,
}: Pick<Post, "body" | "title" | "type"> & {
  userId: User["id"];
}) {
  return prisma.post.create({
    data: {
      title,
      body,
      type,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function updatePost({
  id,
  body,
  title,
}: Pick<Post, "body" | "title" | "id"> & { userId: User["id"] }) {
  return prisma.post.update({
    where: {
      id: id,
    },
    data: {
      title,
      body,
    },
  });
}

export function deletePost({
  id,
  userId,
}: Pick<Post, "id"> & { userId: User["id"] }) {
  return prisma.post.deleteMany({
    where: { id, userId },
  });
}
