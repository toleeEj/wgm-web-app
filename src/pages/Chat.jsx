// Chat.jsx (Professional Version)
'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { format } from "date-fns";
import { Send, Paperclip, X, Bell } from "lucide-react";

export default function Chat() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [unread, setUnread] = useState({});           // per-user unread count
  const [totalUnread, setTotalUnread] = useState(0); // sum of all unread
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [filePath, setFilePath] = useState(null);

  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  /* ────────────────────── Auto-resize textarea ────────────────────── */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [input]);

  /* ────────────────────── Session & User List Initialization ────────────────────── */
  useEffect(() => {
    const initializeSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSession(data.session);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url");
        if (profiles) {
          const otherUsers = profiles.filter(profile => profile.id !== data.session.user.id);
          setUsers(otherUsers);
          const initialUnread = {};
          otherUsers.forEach(user => (initialUnread[user.id] = 0));
          setUnread(initialUnread);
        }
      }
    };

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => setSession(session));
    return () => authListener.subscription.unsubscribe();
  }, []);

  /* ────────────────────── Fetch Messages ────────────────────── */
  const fetchMessages = useCallback(async () => {
    if (!session || !selectedUser) return;
    
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, content, attachment_url, created_at")
      .or(
        `and(sender_id.eq.${session.user.id},receiver_id.eq.${selectedUser}),` +
        `and(sender_id.eq.${selectedUser},receiver_id.eq.${session.user.id})`
      )
      .order("created_at", { ascending: true });

    if (data) {
      const senderIds = [...new Set(data.map(message => message.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", senderIds);

      const profileMap = {};
      (profiles || []).forEach(profile => (profileMap[profile.id] = profile));

      const enrichedMessages = await Promise.all(
        data.map(async message => {
          let signedUrl = null;
          if (message.attachment_url) {
            const { data: signedData } = await supabase.storage
              .from("chat-files")
              .createSignedUrl(message.attachment_url, 3600);
            signedUrl = signedData?.signedUrl;
          }
          return {
            ...message,
            signed_url: signedUrl,
            sender:
              profileMap[message.sender_id] || {
                full_name: "Unknown",
                avatar_url: "/default-avatar.png"
              }
          };
        })
      );
      setMessages(enrichedMessages);
      // Reset unread count for the opened conversation
      setUnread(prev => ({ ...prev, [selectedUser]: 0 }));
    }
  }, [session, selectedUser]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /* ────────────────────── Total Unread Calculation ────────────────────── */
  useEffect(() => {
    const total = Object.values(unread).reduce((accumulator, count) => accumulator + count, 0);
    setTotalUnread(total);
  }, [unread]);

  /* ────────────────────── Real-time Message Subscription ────────────────────── */
  useEffect(() => {
    if (!session) return;
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    channelRef.current = supabase
      .channel(`chat:${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id})`
        },
        async payload => {
          const newMessage = payload.new;

          // Increment unread count if message is from a different conversation
          if (newMessage.sender_id !== selectedUser && newMessage.receiver_id !== selectedUser) {
            setUnread(prev => ({
              ...prev,
              [newMessage.sender_id]: (prev[newMessage.sender_id] || 0) + 1
            }));
            return;
          }

          // Add message instantly if in the current conversation
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", newMessage.sender_id)
            .single();

          let signedUrl = null;
          if (newMessage.attachment_url) {
            const { data: signedData } = await supabase.storage
              .from("chat-files")
              .createSignedUrl(newMessage.attachment_url, 3600);
            signedUrl = signedData?.signedUrl;
          }

          const enrichedMessage = {
            ...newMessage,
            signed_url: signedUrl,
            sender: profile || { full_name: "Unknown", avatar_url: "/default-avatar.png" }
          };

          setMessages(prev => [...prev, enrichedMessage]);
          setUnread(prev => ({ ...prev, [newMessage.sender_id]: 0 }));
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [session, selectedUser]);

  /* ────────────────────── Auto-scroll to Latest Message ────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ────────────────────── Send Message (Optimistic UI) ────────────────────── */
  const sendMessage = async () => {
    if (!session || !selectedUser || (!input.trim() && !filePath)) return;

    const messagePayload = {
      sender_id: session.user.id,
      receiver_id: selectedUser,
      content: input.trim(),
      attachment_url: filePath
    };

    // Optimistic UI Update
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      ...messagePayload,
      created_at: new Date().toISOString(),
      signed_url: filePath ? URL.createObjectURL(fileInputRef.current?.files?.[0]) : null,
      sender: {
        full_name: session.user.user_metadata?.full_name || "You",
        avatar_url: session.user.user_metadata?.avatar_url || "/default-avatar.png"
      }
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setInput("");
    setFilePath(null);
    setPreview(null);

    // Database Insert (real-time subscription will replace temporary message)
    await supabase.from("messages").insert([messagePayload]);
  };

  /* ────────────────────── File Upload Handler ────────────────────── */
  const handleFileUpload = async event => {
    const file = event.target.files?.[0];
    if (!file || !session) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const path = `${session.user.id}/${Date.now()}_${file.name}`;
    await supabase.storage.from("chat-files").upload(path, file);
    setFilePath(path);
    setUploading(false);
  };

  const currentUser = users.find(user => user.id === selectedUser);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ───── Sidebar ───── */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Header with Notification Bell */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <h1 className="text-xl font-bold text-gray-800">Messages</h1>
          <div className="relative">
            <Bell size={22} className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer" />
            {totalUnread > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium rounded-full min-w-5 h-5 flex items-center justify-center animate-pulse shadow-sm">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user.id)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                selectedUser === user.id ? "bg-blue-50 border-blue-100" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={`${user.full_name}'s avatar`}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                />
                {/* Unread Notification Badge */}
                {unread[user.id] > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full min-w-5 h-5 flex items-center justify-center animate-pulse shadow-lg ${
                    unread[user.id] > 9 ? 'px-1' : 'w-5'
                  }`}>
                    {unread[user.id] > 99 ? '99+' : unread[user.id]}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.full_name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {unread[user.id] > 0 ? `${unread[user.id]} unread message${unread[user.id] > 1 ? 's' : ''}` : "Available to chat"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ───── Main Chat Area ───── */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 shadow-sm">
              <div className="relative">
                <img
                  src={currentUser?.avatar_url || "/default-avatar.png"}
                  alt={currentUser?.full_name}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                />
                {/* Online Status Indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">{currentUser?.full_name}</h2>
                <p className="text-sm text-green-600 font-medium">Online</p>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender_id === session?.user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender_id !== session?.user?.id && (
                    <img
                      src={message.sender.avatar_url}
                      alt={message.sender.full_name}
                      className="w-8 h-8 rounded-full flex-shrink-0 shadow-sm"
                    />
                  )}
                  <div
                    className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      message.sender_id === session?.user?.id
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {message.content && <p className="text-sm leading-relaxed">{message.content}</p>}
                    {message.signed_url && (
                      <img
                        src={message.signed_url}
                        alt="Attachment"
                        className="mt-2 max-w-full rounded-lg max-h-64 object-cover shadow-sm"
                      />
                    )}
                    <p
                      className={`text-xs mt-2 ${
                        message.sender_id === session?.user?.id
                          ? "text-blue-200"
                          : "text-gray-500"
                      }`}
                    >
                      {format(new Date(message.created_at), "HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
              {preview && (
                <div className="mb-3 relative inline-block">
                  <img src={preview} alt="Preview" className="max-h-32 rounded-lg shadow-sm" />
                  <button
                    onClick={() => {
                      setPreview(null);
                      setFilePath(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex items-end gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Attach file"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 bg-white"
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() && !filePath}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  title="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ───── Empty State ───── */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-2xl text-blue-600 font-semibold">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a contact from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}