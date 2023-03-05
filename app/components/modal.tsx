import { motion } from "framer-motion";

export default function Modal(
  props: React.PropsWithChildren<{
    title?: string;
    isDisabled?: boolean;
    onDismiss: () => void;
  }>
) {
  // TODO: ...bunch of code that is omitted handling Esc, UI jittering, clicking outside etc.

  const { onDismiss, isDisabled } = props;

  function handleDismissClick() {
    // TODO: You should use this function also for pressing esc
    onDismiss();
  }

  return (
    <>
      <div data-overlay className="fixed inset-0 z-30">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-zinc-700"
        />
      </div>

      <motion.div
        data-modal
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="z-50 w-full overflow-hidden rounded bg-white text-zinc-900 shadow-md sm:max-w-lg">
          <div className="flex items-center border-b px-5 py-4">
            <h2
              className="flex-1 text-lg font-bold leading-6 tracking-tight"
              id="modal-title"
            >
              {props.title}
            </h2>
            {!isDisabled && (
              <button
                onClick={handleDismissClick}
                className="text-zinc-500 outline-blue-500 hover:underline"
              >
                Close
              </button>
            )}
          </div>

          <div className="px-5 py-4">{props.children}</div>
        </div>
      </motion.div>
    </>
  );
}
