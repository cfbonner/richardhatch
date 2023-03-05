import {
  Form,
  useCatch,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Modal from "~/components/modal";
import { Tag } from "~/components/tag";
import { TagList } from "~/components/tag_list";
import { prisma } from "~/db.server";
import { findOrCreateTag, maybeTagPost } from "~/models/tag.server";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { requireUserId } from "~/session.server";

export async function loader({ params }: LoaderArgs) {
  const post = await prisma.post.findUnique({
    where: {
      id: params.postId,
    },
    include: { tags: { include: { tag: true } } },
  });

  if (!post) throw new Response("Not found", { status: 404 });

  return json({ post, postTags: post.tags.map((tag) => tag.tag) });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  const form = await request.formData();
  if (!params.postId) throw new Response("Not found", { status: 404 });

  const intent = form.get("intent");

  switch (intent) {
    case "create": {
      const title = form.get("title");
      if (typeof title !== "string" || title.length === 0) {
        return json({ errors: { title: "must be provided" } }, { status: 400 });
      }
      const tag = await findOrCreateTag({ title, userId });
      await maybeTagPost({ postId: params.postId, tagId: tag.id });
      return redirect(
        `/posts/${params["postId"]}/tags?${new URLSearchParams([
          ["newTag", tag.slug],
        ])}`
      );
    }
    case "delete": {
      const tagId = form.get("tagId");
      if (typeof tagId !== "string")
        throw new Response("Tag not found", { status: 404 });
      await prisma.postTags.delete({
        where: {
          postId_tagId: {
            postId: params.postId,
            tagId: tagId,
          },
        },
      });
      return redirect(`/posts/${params["postId"]}/tags`);
    }
    default: {
      throw new Error("Unexpected action");
    }
  }
}

export default function Tags() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tagInputEl = useRef<HTMLInputElement>(null);

  const newTag = searchParams.get("newTag");

  useEffect(() => {
    if (tagInputEl.current == null) return;
    if (typeof newTag == "string") {
      tagInputEl.current.value = "";
      tagInputEl.current.focus();
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleExitComplete = () => {
    navigate(`/posts/${data.post.id}`);
  };

  const handleDismiss = () => {
    setIsModalOpen(false);
  };

  const tagClass = (
    tagSlug: string,
    tagSlugFromParam: string | null
  ): string => {
    if (typeof tagSlugFromParam != "string") return "";

    if (tagSlugFromParam == tagSlug) {
      return " animate-wiggle-once";
    } else {
      return "";
    }
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isModalOpen && (
        <Modal title={`Tag ${data.post.title}`} onDismiss={handleDismiss}>
          <TagList className="mb-2">
            {data.postTags.map((tag) => (
              <Tag
                key={tag.id}
                id={tag.slug}
                className={tagClass(tag.slug, newTag)}
              >
                <span className="flex items-center">
                  <span className="mr-1">{tag.title}</span>
                  <Form method="post" className="h-full">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="tagId" value={tag.id} />
                    <button
                      type="submit"
                      className="hover:text-underline h-full bg-transparent"
                    >
                      <span className="sr-only">Delete</span>
                      <XMarkIcon
                        aria-hidden="true"
                        className="h-2 w-2 text-black"
                      />
                    </button>
                  </Form>
                </span>
              </Tag>
            ))}
          </TagList>
          <Form method="post" className="space-y-2">
            <div>
              <input type="hidden" name="intent" value="create" />
              <label className="flex w-full flex-col gap-1">
                <span className="sr-only">Title:</span>
                <input
                  ref={tagInputEl}
                  name="title"
                  type="text"
                  className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                  placeholder="Family friendly"
                />
              </label>
            </div>
            <button
              type="submit"
              className="w-full rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Add tag
            </button>
          </Form>
        </Modal>
      )}
    </AnimatePresence>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  switch (caught.status) {
    case 404: {
      return (
        <p className="my-4 rounded bg-red-200 px-2 py-1 text-sm">
          {caught.statusText}
        </p>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}
