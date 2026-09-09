import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_MY_CHATS } from "../graphql/queries/chatQueries";
import { useAuth } from "../context/AuthContext";

import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import Skeleton from "../components/ui/Skeleton";

const Chat = () => {
  const { user } = useAuth();

  const [selectedChatId, setSelectedChatId] = useState(null);

  const { data, loading, error } = useQuery(GET_MY_CHATS);

  const chats = data?.myChats || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse mt-2" />
        </div>

        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Unable to load chats
          </h2>

          <p className="text-gray-500 mt-2">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Messages
        </h1>

        <p className="text-gray-500 mt-1">
          Chat with sellers and buyers in real time.
        </p>
      </div>

      {/* Chat Layout */}
      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-[320px_1fr]
          h-[650px]
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-sm
        "
      >

        <ChatSidebar
          chats={chats}
          currentUser={user}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />

        <ChatWindow
          chatId={selectedChatId}
          currentUser={user}
        />

      </div>
    </div>
  );
};

export default Chat;