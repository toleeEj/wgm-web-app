import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const fileInputRef = useRef(null);

  // Session and users initialization
  useEffect(() => {
    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);
        
        const { data: usersData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url");
        
        if (usersData) {
          setUsers(usersData);
          setUnreadCounts(Object.fromEntries(usersData.map(user => [user.id, 0])));
        }
      }
    };

    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch messages with optimized query
  const fetchMessages = useCallback(async () => {
    if (!session || !selectedReceiver) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, content, attachment_url, created_at")
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${selectedReceiver}),and(sender_id.eq.${selectedReceiver},receiver_id.eq.${session.user.id})`)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", senderIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map(p => [p.id, p])
      );

      const enrichedMessages = await Promise.all(
        data.map(async (msg) => {
          let signed_url = null;
          if (msg.attachment_url) {
            const { data: signed } = await supabase.storage
              .from("chat-files")
              .createSignedUrl(msg.attachment_url, 3600);
            signed_url = signed?.signedUrl;
          }

          return {
            ...msg,
            signed_url,
            sender: profileMap[msg.sender_id] || {
              full_name: "Unknown",
              avatar_url: "/default-avatar.png",
            },
          };
        })
      );

      setMessages(enrichedMessages);
      setUnreadCounts(prev => ({ ...prev, [selectedReceiver]: 0 }));
    }
    setIsLoading(false);
  }, [session, selectedReceiver]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time updates
  useEffect(() => {
    if (!session) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel(`messages:${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id})`,
        },
        async (payload) => {
          if (payload.new.receiver_id === session.user.id && payload.new.sender_id !== selectedReceiver) {
            setUnreadCounts(prev => ({
              ...prev,
              [payload.new.sender_id]: (prev[payload.new.sender_id] || 0) + 1,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [session, selectedReceiver]);

  // Auto-scroll with performance optimization
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: messages.length > 10 ? "smooth" : "auto" 
      });
    };

    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages.length]);

  // Message actions
  const sendMessage = async () => {
    if (!session || !selectedReceiver || (!messageText.trim() && !fileUrl)) return;

    const { error } = await supabase.from("messages").insert([{
      sender_id: session.user.id,
      receiver_id: selectedReceiver,
      content: messageText.trim(),
      attachment_url: fileUrl,
    }]);

    if (!error) {
      setMessageText("");
      setFileUrl(null);
      setPreviewImage(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !session) return;

    setPreviewImage(URL.createObjectURL(file));
    setUploading(true);

    try {
      const filePath = `${session.user.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("chat-files")
        .upload(filePath, file);

      if (!error) setFileUrl(filePath);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

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

    if (!error) {
      setEditingMessageId(null);
      setEditingText("");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    await supabase
      .from("messages")
      .delete()
      .eq("id", id)
      .eq("sender_id", session.user.id);
  };

  const selectedUser = users.find(user => user.id === selectedReceiver);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">💬 Messages</h1>
          <p className="text-gray-600 text-sm mt-1">Chat with your team</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Conversation
          </label>
          {users.filter(user => user.id !== session?.user?.id).map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedReceiver(user.id)}
              className={`w-full p-4 flex items-center gap-4 rounded-xl transition-all ${
                selectedReceiver === user.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
              }`}
              aria-label={`Chat with ${user.full_name}`}
            >
              <img
                src={user.avatar_url || "/default-avatar.png"}
                alt={user.full_name}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div className="flex-1 text-left">
                <h3 className="font-semibold">{user.full_name}</h3>
                <p className={`text-sm ${selectedReceiver === user.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {unreadCounts[user.id] > 0 
                    ? `${unreadCounts[user.id]} unread message${unreadCounts[user.id] > 1 ? 's' : ''}`
                    : 'Click to chat'
                  }
                </p>
              </div>
              {unreadCounts[user.id] > 0 && (
                <span className={`${
                  selectedReceiver === user.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                } text-xs font-bold rounded-full px-2 py-1 min-w-6 text-center`}>
                  {unreadCounts[user.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedReceiver ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser?.avatar_url || "/default-avatar.png"}
                  alt={selectedUser?.full_name}
                  className="w-14 h-14 rounded-full border-2 border-blue-200"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedUser?.full_name}
                  </h2>
                  <p className="text-green-600 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-blue-50/30 p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👋</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-gray-500">
                    Send your first message to {selectedUser?.full_name}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender_id === session?.user?.id ? "justify-end" : "justify-start"}`}
                    >
                      {msg.sender_id !== session?.user?.id && (
                        <img
                          src={msg.sender?.avatar_url || "/default-avatar.png"}
                          alt={msg.sender?.full_name}
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                      )}
                      
                      <div className={`max-w-md rounded-2xl px-4 py-3 ${
                        msg.sender_id === session?.user?.id
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                      }`}>
                        {msg.sender_id !== session?.user?.id && (
                          <p className="font-semibold text-sm mb-1">{msg.sender?.full_name}</p>
                        )}
                        
                        {editingMessageId === msg.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-transparent border-none resize-none focus:ring-0 text-inherit"
                              rows="3"
                              autoFocus
                            />
                            <div className="flex gap-2 text-sm">
                              <button onClick={() => saveEdit(msg.id)} className="hover:underline">
                                Save
                              </button>
                              <button onClick={() => setEditingMessageId(null)} className="hover:underline">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                            {msg.signed_url && (
                              <img
                                src={msg.signed_url}
                                alt="Attachment"
                                className="mt-2 max-w-full rounded-lg max-h-60 border"
                              />
                            )}
                            <p className={`text-xs mt-2 ${msg.sender_id === session?.user?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </p>
                            
                            {msg.sender_id === session?.user?.id && (
                              <div className="flex gap-3 mt-2 text-xs">
                                <button onClick={() => handleEdit(msg)} className="hover:underline">
                                  Edit
                                </button>
                                <button onClick={() => handleDelete(msg.id)} className="hover:underline">
                                  Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-6">
              {previewImage && (
                <div className="mb-4 relative inline-block">
                  <img src={previewImage} alt="Preview" className="max-h-48 rounded-lg border" />
                  <button
                    onClick={() => {
                      setPreviewImage(null);
                      setFileUrl(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                  aria-label="Attach image"
                >
                  📎
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                
                <div className="flex-1 relative">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20"
                    rows="1"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    ⏎ to send
                  </div>
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={uploading || !selectedReceiver || (!messageText.trim() && !fileUrl)}
                  className="px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {uploading ? "⏳" : "🚀"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">💭</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Welcome to Chat
              </h2>
              <p className="text-gray-600 max-w-md">
                Select a conversation from the sidebar to start messaging with your team members.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;