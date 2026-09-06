import {
  MessageCircle,
} from "lucide-react";

const ChatSidebar = ({
  chats,
  currentUser,
  selectedChatId,
  onSelectChat,
}) => {
  return (
    <aside className="flex flex-col border-r border-gray-200 bg-white">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">
          Conversations
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {chats.length} conversation{chats.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">

        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">

            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageCircle
                size={22}
                className="text-gray-500"
              />
            </div>

            <p className="font-medium text-gray-900 mt-3">
              No conversations
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Start a conversation to see it here.
            </p>

          </div>
        ) : (
          chats.map((chat) => {

            const otherUser = chat.users?.find(
              (u) => u.id !== currentUser?.id
            );

            const lastMessage =
              chat.messages?.[chat.messages.length - 1];

            const isSelected =
              selectedChatId === chat.id;

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`
                  w-full
                  text-left
                  px-5
                  py-4
                  border-b
                  border-gray-100
                  transition-colors
                  duration-150
                  ${
                    isSelected
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }
                `}
              >

                <div className="flex items-center gap-3">

                  {/* Avatar */}
                  <div
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
                      font-semibold
                    "
                  >
                    {otherUser?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  {/* Information */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-2">

                      <p className="font-medium text-gray-900 truncate">
                        {otherUser?.name || "Unknown User"}
                      </p>

                    </div>

                    <p className="text-sm text-gray-500 truncate mt-1">
                      {lastMessage?.text || "No messages yet"}
                    </p>

                  </div>

                </div>

              </button>
            );
          })
        )}

      </div>
    </aside>
  );
};

export default ChatSidebar;