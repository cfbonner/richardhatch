import type { Film, User } from "@prisma/client";
import { prisma } from "~/db.server";

export function getFilms() {
  return prisma.film.findMany();
}

export function createFilm({
  title,
  synopsis,
  userId,
}: Pick<Film, "title" | "synopsis"> & {
  userId: User["id"];
}) {
  return prisma.film.create({
    data: {
      title,
      synopsis,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteFilm({
  id,
  userId,
}: { id: Film["id"] } & {
  userId: User["id"];
}) {
  return prisma.film.deleteMany({
    where: {
      id: id,
      userId: userId,
    },
  });
}
