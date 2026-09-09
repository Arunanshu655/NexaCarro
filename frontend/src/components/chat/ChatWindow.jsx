import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { MessageCircle } from "lucide-react";
import {useAuth} from '../../context/AuthContext'

import { GET_CHAT } from "../../graphql/queries/chatQueries";
import { SEND_MESSAGE } from "../../graphql/mutations/chatMutations";

import socket from "../../socket/socket";

import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const ChatWindow = ({ chatId, currentUser }) => {
  const messagesEndRef = useRef(null);
  const {user} = useAuth();

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(GET_CHAT, {
    variables: {
      chatId,
    },
    skip: !chatId,
  });

  const [sendMessage, { loading: sending }] = useMutation(
    SEND_MESSAGE
  );

  const chat = data?.chat;

  // if(chat) console.log(chat.messages[0].sender.id +" "+ user.id)
  // if(chat) console.log(chat.messages[0].createdAt)
  
  /*
   * Scroll to newest message
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  /*
   * Join / leave Socket.IO room
   */
  useEffect(() => {
    if (!chatId) return;

    socket.emit("join_chat", chatId);

    return () => {
      socket.emit("leave_chat", chatId);
    };
  }, [chatId]);

  /*
   * Receive realtime messages
   */
  useEffect(() => {
    if (!chatId) return;

    const handleReceiveMessage = (message) => {
      console.log("Realtime message received:", message);

      /*
       * Only process messages belonging
       * to the currently selected chat.
       */
      if (message.chatId !== chatId) return;

      /*
       * Refresh the current chat.
       *
       * This gives us the complete GraphQL
       * message object including sender,
       * createdAt, etc.
       */
      refetch();
    };

    socket.on(
      "receive_message",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "receive_message",
        handleReceiveMessage
      );
    };
  }, [chatId, refetch]);

  /*
   * Scroll whenever messages change
   */
  useEffect(() => {
    if (chat?.messages?.length) {
      scrollToBottom();
    }
  }, [chat?.messages]);

  /*
   * Send message
   */
  const handleSendMessage = async (text) => {
    if (!chatId || !text.trim()) return;

    try {
      /*
       * Save message through GraphQL
       */
      console.log("send : "+ text.trim())
      const { data } = await sendMessage({
        variables: {
          chatId,
          text: text.trim(),
        },
      });

      /*
       * Get the newly-created message
       */
      const messages =
        data?.sendMessage?.messages || [];

      const newMessage =
        messages[messages.length - 1];

      /*
       * Tell Socket.IO that a new message
       * was created.
       */
      socket.emit("send_message", {
        chatId,
        message: newMessage,
      });

    } catch (err) {
      console.error(
        "Failed to send message:",
        err
      );
    }
  };

  /*
   * No conversation selected
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
   * Loading
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-500">
          Loading conversation...
        </p>
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

      {/* Header */}
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

          <div className="flex items-center gap-1.5">
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
                isOwn={message.sender.id===user.id}

              />
            ))}

            <div ref={messagesEndRef} />

          </div>
        )}

      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={sending}
      />

    </section>
  );
};

export default ChatWindow;