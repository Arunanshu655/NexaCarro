import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import { GET_CHAT } from "../../graphql/queries/chatQueries";
import { SEND_MESSAGE } from "../../graphql/mutations/chatMutations";

import socket from "../../socket/socket";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const ChatWindow = ({ chatId, currentUser }) => {
  const messagesEndRef = useRef(null);

  const { user } = useAuth();

  /*
   * Local messages state
   *
   * GraphQL loads the initial messages.
   * Socket.IO will update this state in realtime.
   */
  const [messages, setMessages] = useState([]);

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

  const [sendMessage, { loading: sending }] = useMutation(
    SEND_MESSAGE
  );

  const chat = data?.chat;

  /*
   * Whenever a different chat is selected,
   * load its messages into local state.
   */
  useEffect(() => {
    if (!chat) {
      setMessages([]);
      return;
    }

    setMessages(chat.messages || []);
  }, [chat]);

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

    const handleReceiveMessage = (data) => {
      console.log("Realtime message received:", data);

      /*
       * Ignore messages belonging to another chat.
       */
      if (data.chatId !== chatId) {
        return;
      }

      const incomingMessage = data.message;

      if (!incomingMessage) {
        return;
      }

      /*
       * Add the message to local state.
       *
       * Before adding it, check whether it already exists.
       */
      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (message) => String(message.id) === String(incomingMessage.id)
        );

        if (alreadyExists) {
          console.log("Duplicate message ignored");
          return currentMessages;
        }

        return [
          ...currentMessages,
          incomingMessage,
        ];
      });
    };

    socket.on(
      "receive_message",
      handleReceiveMessage
    );

    /*
     * VERY IMPORTANT:
     * Remove this listener when the chat changes
     * or component unmounts.
     */
    return () => {
      socket.off(
        "receive_message",
        handleReceiveMessage
      );
    };
  }, [chatId]);

  /*
   * Scroll whenever messages change.
   */
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  /*
   * Send message
   */
  const handleSendMessage = async (text) => {
    if (!chatId || !text.trim()) {
      return;
    }

    try {
      const trimmedText = text.trim();

      console.log("send:", trimmedText);

      /*
       * Save message through GraphQL.
       */
      const { data } = await sendMessage({
        variables: {
          chatId,
          text: text.trim(),
        },
      });

      /*
       * Get updated messages from GraphQL response.
       */
      console.log(data.sendMessage)
      const updatedMessages =
        [data?.sendMessage] || [];
        // console.log(updatedMessages)

      /*
       * The last message is the newly-created message.
       */
      const newMessage =
        updatedMessages[updatedMessages.length - 1];

      // console.log(newMessage)
      if (!newMessage) {
        console.error(
          "No message returned from sendMessage"
        );
        return;
      }

      /*
       * Add message immediately to our own UI.
       */
      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (message) => String(message.id) === String(newMessage.id)
        );
        if (alreadyExists) {
          return currentMessages;
        }

        return [
          ...currentMessages,
          newMessage,
        ];
      });

      /*
       * Notify other users through Socket.IO.
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

        {messages.length === 0 ? (

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

            {messages.map((message) => (
              <MessageBubble
                // key={message.id}
                message={message}
                currentUser={currentUser}
                isOwn={message.sender.id === user.id}
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