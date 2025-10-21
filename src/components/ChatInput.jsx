// src/components/ChatInput.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ChatInput({ onSend, onToast }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  async function uploadChatFile(file) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // filename: userId/timestamp-filename
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-files")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // private bucket -> create a signed URL (short expiry)
    const { data } = await supabase.storage
      .from("chat-files")
      .createSignedUrl(filePath, 60 * 60); // 1 hour signed url

    return data.signedUrl;
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text && !file) return onToast?.("Enter a message or attach a file.");

    setSending(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let attachment_url = null;
      if (file) {
        attachment_url = await uploadChatFile(file);
      }

      const { error } = await supabase
        .from("chat_messages")
        .insert([
          {
            sender_id: user.id,
            content: text || null,
            attachment_url,
          },
        ]);

      if (error) throw error;

      setText("");
      setFile(null);
      onSend?.();
      onToast?.("Message sent");
    } catch (err) {
      console.error("send message err", err);
      onToast?.("Failed to send message: " + (err.message || err));
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border p-2 rounded"
      />
      <input type="file" onChange={handleFileChange} className="text-sm" />
      <button
        type="submit"
        disabled={sending}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
