import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const Chat = () => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({}); // Track unread messages per user
  const [notificationPermission, setNotificationPermission] = useState(Notification?.permission || "default");
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  /** 1️⃣ Load session, users, and request notification permission */
  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        console.error("Error fetching session:", error);
        window.location.href = "/login"; // Adjust redirect path as needed
      } else {
        setSession(data.session);
      }
    };

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data);
        // Initialize unread counts
        setUnreadCounts(Object.fromEntries(data.map((user) => [user.id, 0])));
      }
    };

    const requestNotificationPermission = async () => {
      if (Notification && notificationPermission === "default") {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }
    };

    fetchSession();
    fetchUsers();
    requestNotificationPermission();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => listener.subscription.unsubscribe();
  }, [notificationPermission]);

  /** 2️⃣ Fetch messages for selected receiver */
  useEffect(() => {
    const fetchMessages = async () => {
      if (!session || !selectedReceiver) return;

      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, attachment_url, created_at")
        .or(
          `and(sender_id.eq.${session.user.id},receiver_id.eq.${selectedReceiver}),and(sender_id.eq.${selectedReceiver},receiver_id.eq.${session.user.id})`
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      const senderIds = [...new Set(data.map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", senderIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map((p) => [
          p.id,
          { ...p, avatar_url_signed: p.avatar_url || "/default-avatar.png" },
        ])
      );

      const enrichedMessages = await Promise.all(
        data.map(async (msg) => {
          let signed_url = null;
          if (msg.attachment_url) {
            const filePath =
              msg.attachment_url.split("/object/public/chat-files/")[1] ||
              msg.attachment_url;
            const { data: signed, error } = await supabase.storage
              .from("chat-files")
              .createSignedUrl(filePath, 60 * 60);
            if (error) console.error("Error generating signed URL:", error);
            signed_url = signed?.signedUrl || null;
          }

          return {
            ...msg,
            signed_url,
            sender:
              profileMap[msg.sender_id] || {
                full_name: "Unknown",
                avatar_url_signed: "/default-avatar.png",
              },
          };
        })
      );

      setMessages(enrichedMessages);
      // Reset unread count for the selected receiver
      setUnreadCounts((prev) => ({ ...prev, [selectedReceiver]: 0 }));
    };

    fetchMessages();
  }, [session, selectedReceiver]);

  /** 3️⃣ Realtime updates (insert/update/delete) */
  useEffect(() => {
    if (!session) return;

    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create new subscription
    channelRef.current = supabase
      .channel(`public:messages:user:${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `or(sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id})`,
        },
        async (payload) => {
          console.log("Real-time event received:", payload);
          if (payload.eventType === "INSERT") {
            // Only process if the message involves the selected receiver
            if (
              (payload.new.sender_id === session.user.id &&
                payload.new.receiver_id === selectedReceiver) ||
              (payload.new.sender_id === selectedReceiver &&
                payload.new.receiver_id === session.user.id)
            ) {
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("id, full_name, avatar_url")
                .eq("id", payload.new.sender_id)
                .single();
              if (profileError) console.error("Error fetching profile:", profileError);

              let signed_url = null;
              if (payload.new.attachment_url) {
                const filePath =
                  payload.new.attachment_url.split("/object/public/chat-files/")[1] ||
                  payload.new.attachment_url;
                const { data: signed, error } = await supabase.storage
                  .from("chat-files")
                  .createSignedUrl(filePath, 60 * 60);
                if (error) console.error("Error generating signed URL:", error);
                signed_url = signed?.signedUrl || null;
              }

              const enrichedMessage = {
                ...payload.new,
                signed_url,
                sender: profile
                  ? { ...profile, avatar_url_signed: profile.avatar_url || "/default-avatar.png" }
                  : { full_name: "Unknown", avatar_url_signed: "/default-avatar.png" },
              };

              setMessages((prev) => [...prev, enrichedMessage]);

              // Show notification for received messages when tab is inactive
              if (
                payload.new.receiver_id === session.user.id &&
                !document.hasFocus() &&
                notificationPermission === "granted"
              ) {
                const senderName = profile?.full_name || "Unknown";
                const messagePreview = payload.new.content
                  ? payload.new.content.substring(0, 50)
                  : payload.new.attachment_url
                  ? "Sent you an image"
                  : "New message";
                new Notification(`New Message from ${senderName}`, {
                  body: messagePreview,
                  icon: profile?.avatar_url || "/default-avatar.png",
                });
              }
            }

            // Update unread count for received messages
            if (
              payload.new.receiver_id === session.user.id &&
              payload.new.sender_id !== selectedReceiver
            ) {
              setUnreadCounts((prev) => ({
                ...prev,
                [payload.new.sender_id]: (prev[payload.new.sender_id] || 0) + 1,
              }));
            }
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m))
            );
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) =>
              prev.filter((m) => m.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status, error) => {
        console.log("Subscription status:", status, error ? `Error: ${error.message}` : "");
        if (status === "SUBSCRIBED") {
          console.log("Real-time subscription active");
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error(`Subscription ${status}, attempting to reconnect...`);
          if (channelRef.current) {
            setTimeout(() => {
              channelRef.current.subscribe();
            }, 1000);
          }
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [session, notificationPermission]);

  /** 4️⃣ Scroll to bottom on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** 5️⃣ Send message */
  const sendMessage = async () => {
    if (!session || !selectedReceiver || (!messageText.trim() && !fileUrl)) return;

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: session.user.id,
        receiver_id: selectedReceiver,
        content: messageText.trim(),
        attachment_url: fileUrl,
      },
    ]);

    if (error) console.error("Error sending message:", error);
    else {
      setMessageText("");
      setFileUrl(null);
      setPreviewImage(null);
    }
  };

  /** 6️⃣ Upload image */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    try {
      setUploading(true);
      const filePath = `${session.user.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("chat-files")
        .upload(filePath, file);

      if (error) throw error;
      setFileUrl(filePath);
    } catch (err) {
      console.error("Upload failed:", err.message);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  /** ✏️ Edit message */
  const handleEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.content || "");
  };

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from("messages")
      .update({ content: editingText.trim() })
      .eq("id", id)
      .eq("sender_id", session.user.id);

    if (error) {
      console.error("Edit failed:", error.message);
      alert("Could not update message.");
    } else {
      setEditingMessageId(null);
      setEditingText("");
    }
  };

  /** 🗑️ Delete message */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id)
      .eq("sender_id", session.user.id);

    if (error) {
      console.error("Delete failed:", error.message);
      alert("Could not delete message.");
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100 rounded-2xl shadow-md max-w-full">
      {/* Receiver selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Select User to Chat With
        </label>
        <select
          value={selectedReceiver || ""}
          onChange={(e) => setSelectedReceiver(e.target.value)}
          className="mt-1 block w-full p-2 border rounded-lg"
        >
          <option value="" disabled>
            Select a user
          </option>
          {users
            .filter((user) => user.id !== session?.user?.id)
            .map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name || "Unknown"}{unreadCounts[user.id] > 0 ? ` (${unreadCounts[user.id]})` : ""}
              </option>
            ))}
        </select>
      </div>

      {/* Message display */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white rounded-xl shadow-inner">
        {!selectedReceiver ? (
          <p className="text-center text-gray-500">Select a user to start chatting.</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 items-start ${
                msg.sender_id === session?.user?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {/* Avatar */}
              {msg.sender_id !== session?.user?.id && (
                <img
                  src={msg.sender?.avatar_url_signed || "/default-avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border"
                />
              )}

              <div
                className={`p-3 rounded-lg max-w-xs ${
                  msg.sender_id === session?.user?.id
                    ? "bg-blue-100 text-right"
                    : "bg-gray-200 text-left"
                }`}
              >
                {/* Name */}
                {msg.sender_id !== session?.user?.id && (
                  <p className="text-sm font-semibold text-gray-700">
                    {msg.sender?.full_name || "Unknown"}
                  </p>
                )}

                {/* Edit mode */}
                {editingMessageId === msg.id ? (
                  <>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full border rounded p-1 text-sm"
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={() => saveEdit(msg.id)}
                        className="text-green-600 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMessageId(null)}
                        className="text-gray-500 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{msg.content}</p>
                    {msg.signed_url && (
                      <div className="mt-2">
                        <img
                          src={msg.signed_url}
                          alt="attachment"
                          className="max-w-full max-h-60 rounded-md border"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>

                    {/* Edit / Delete buttons */}
                    {msg.sender_id === session?.user?.id && (
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={() => handleEdit(msg)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="mt-3 flex flex-col gap-2">
        {previewImage && (
          <div className="relative">
            <img src={previewImage} alt="Preview" className="max-h-48 rounded-lg" />
            <button
              onClick={() => {
                setPreviewImage(null);
                setFileUrl(null);
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2"
            >
              X
            </button>
          </div>
        )}
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          className="resize-none p-2 rounded-lg border"
          rows={2}
          disabled={uploading || !selectedReceiver}
        />
        <div className="flex gap-2 items-center">
          <label className="cursor-pointer text-blue-500 hover:underline">
            Attach Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading || !selectedReceiver}
            />
          </label>
          <button
            onClick={sendMessage}
            disabled={uploading || !selectedReceiver || (!messageText.trim() && !fileUrl)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-blue-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;