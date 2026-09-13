import { useRef, useState } from "react";
import { Send } from "lucide-react";

const MessageInput = ({
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
}) => {
  const [text, setText] = useState("");

  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;

    setText(value);

    if (!value.trim()) {
      onStopTyping?.();
      return;
    }

    onTyping?.();

    /*
     * Reset the timeout every time
     * the user presses another key.
     */
    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping?.();
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText || disabled) {
      return;
    }

    onStopTyping?.();

    onSend(trimmedText);

    setText("");

    clearTimeout(typingTimeoutRef.current);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 p-4 bg-white border-t border-gray-200"
    >
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="Type a message..."
        disabled={disabled}
        className="
          flex-1
          px-4
          py-3
          rounded-full
          border
          border-gray-200
          bg-gray-50
          text-sm
          text-gray-900
          outline-none
          focus:border-gray-400
          focus:bg-white
          transition
          disabled:opacity-50
        "
      />

      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="
          w-11
          h-11
          shrink-0
          rounded-full
          bg-gray-900
          text-white
          flex
          items-center
          justify-center
          transition-all
          duration-150
          hover:bg-gray-800
          disabled:opacity-40
          disabled:cursor-not-allowed
        "
      >
        <Send size={18} />
      </button>
    </form>
  );
};

export default MessageInput;