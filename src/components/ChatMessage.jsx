// src/components/ChatMessage.jsx
import React from "react";

export default function ChatMessage({ message }) {
  const { content, attachment_url, created_at, sender_id, profiles } = message;

  const name = profiles?.name || `User ${sender_id?.slice(0, 6)}`;
  const avatar = profiles?.avatar_url || "https://placehold.co/40x40?text=👤";
  const role = profiles?.role || "Admin";

  return (
    <div className="flex gap-3 items-start">
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full object-cover border"
      />
      <div className="flex-1 bg-gray-100 rounded-lg p-3">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium text-gray-800">
            {name} <span className="text-xs text-gray-500">({role})</span>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {content && <p className="text-gray-800 mb-1">{content}</p>}

        {attachment_url && (
          <a
            href={attachment_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline text-sm"
          >
            📎 Download attachment
          </a>
        )}
      </div>
    </div>
  );
}
