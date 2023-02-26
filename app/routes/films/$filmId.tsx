import { Form, useCatch, useLoaderData } from "@remix-run/react";
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
} from "@remix-run/server-runtime";
import { prisma } from "~/db.server";
import { deleteFilm } from "~/models/film.server";
import { requireUserId } from "~/session.server";

export async function loader({ params }: LoaderArgs) {
  const film = await prisma.film.findUnique({
    where: {
      id: params.filmId,
    },
  });

  if (!film)
    throw new Response(`No film found with ID ${params.filmId}`, {
      status: 404,
    });

  return json({ film });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);

  if (typeof params.filmId !== "string") {
    throw new Response(`Can't find film without ID`, { status: 400 });
  }

  await deleteFilm({ id: params.filmId, userId });

  return redirect("/films");
}

export default function ShowFilmPage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h3 className="text-2xl font-bold">{data.film.title}</h3>
      <p className="py-6">{data.film.synopsis}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404 || caught.status == 400) {
    return (
      <div className="rounded bg-red-100 px-4 py-2 text-sm">{caught.data}</div>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
