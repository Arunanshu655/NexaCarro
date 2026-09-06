import { useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { MessageCircle } from "lucide-react";

import { GET_CHAT } from "../../graphql/queries/chatQueries";
import socket from "../../socket/socket";

import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import Skeleton from "../ui/Skeleton";

const ChatWindow = ({ chatId, currentUser }) => {

  const {
    data,
    loading,
    error,
  } = useQuery(GET_CHAT, {
    variables: {
      chatId,
    },
    skip: !chatId,
  });

  const chat = data?.chat;

  /*
   * Join Socket.IO room whenever
   * the selected chat changes.
   */
  useEffect(() => {

    if (!chatId) return;
    try {
        socket.emit("join_chat", chatId);
    } catch (error) {
        console.log(error)
    }
    

    return () => {
      // Leave room when changing conversation
      socket.emit("leave_chat", chatId);
    };

  }, [chatId]);

  /*
   * No chat selected
   */
  if (!chatId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">

        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center">
          <MessageCircle
            size={28}
            className="text-gray-400"
          />
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mt-4">
          Select a conversation
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Choose a chat from the sidebar to start messaging.
        </p>

      </div>
    );
  }

  /*
   * Loading messages
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">
          Loading conversation...
        </div>
      </div>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <div className="flex items-center justify-center h-full px-6 text-center">
        <div>
          <h2 className="font-semibold text-gray-900">
            Unable to load conversation
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  const otherUser = chat?.users?.find(
    (u) => u.id !== currentUser?.id
  );

  return (
    <section className="flex flex-col h-full bg-gray-50">

      {/* Chat Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-200">

        <div
          className="
            w-10
            h-10
            rounded-full
            bg-gray-900
            text-white
            flex
            items-center
            justify-center
            font-semibold
          "
        >
          {otherUser?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">
            {otherUser?.name || "Unknown User"}
          </h2>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />

            <span className="text-xs text-gray-500">
              Online
            </span>
          </div>
        </div>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5">

        {chat?.messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full">

            <div className="text-center">

              <MessageCircle
                size={28}
                className="mx-auto text-gray-400"
              />

              <p className="text-sm text-gray-500 mt-2">
                No messages yet
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Send a message to start the conversation.
              </p>

            </div>

          </div>
        ) : (
          <div className="space-y-3">

            {chat.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                currentUser={currentUser}
              />
            ))}

          </div>
        )}

      </div>

      {/* Input */}
      <MessageInput
        onSend={(message) => {
          console.log("Send:", message);
        }}
      />

    </section>
  );
};

export default ChatWindow;