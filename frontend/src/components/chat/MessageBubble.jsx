const MessageBubble = ({
  message,
  isOwn,
}) => {

  return (
    <div
      className={`
        flex
        ${isOwn ? "justify-end" : "justify-start"}
      `}
    >

      <div
        className={`
          max-w-[75%]
          rounded-2xl
          px-4 py-2.5
          text-sm
          shadow-sm
          ${
            isOwn
              ? "rounded-br-sm bg-[var(--primary)] text-white"
              : "rounded-bl-sm bg-white text-[var(--text)]"
          }
        `}
      >

        {!isOwn && (
          <p className="
            mb-1
            text-xs
            font-medium
            text-[var(--primary)]
          ">
            {message.sender?.name}
          </p>
        )}

        <p className="leading-5">
          {message.text}
        </p>

        {message.createdAt && (
          <p
            className={`
              mt-1
              text-[10px]
              ${
                isOwn
                  ? "text-white/70"
                  : "text-[var(--muted)]"
              }
            `}
          >
            {new Date(Number(message.createdAt)).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </p>
        )}

      </div>

    </div>
  );
};

export default MessageBubble;