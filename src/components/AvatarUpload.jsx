export default function AvatarUpload({ profileUrl, onFileChange }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <img
          src={profileUrl || "https://placehold.co/128x128?text=Avatar"}
          alt="Avatar"
          className="rounded-full w-32 h-32 object-cover border-2 border-gray-300"
        />
        <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files[0])}
          />
          <span className="text-xs">📷</span>
        </label>
      </div>
    </div>
  );
}
