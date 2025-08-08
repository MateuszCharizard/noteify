// components/Avatar.js

import React, { useState } from 'react';

export default function Avatar({ url, onUpload }) {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];

      // --- New Base64 Conversion Logic ---
      const reader = new FileReader();
      reader.readAsDataURL(file); // This reads the file as a Base64 string
      
      reader.onloadend = () => {
        // Once the file is read, the result is the Base64 data URL
        const base64String = reader.result;
        onUpload(base64String); // Pass the string to the parent component
        setUploading(false);
      };

      reader.onerror = (error) => {
        throw error;
      };

    } catch (error) {
      alert(error.message);
      setUploading(false);
    }
  };

  // The 'url' prop is now expected to be a full Base64 data URL
  const avatarSrc = url || `https://avatar.vercel.sh/user.png?size=100`;

  return (
    <div className="flex items-center gap-4">
      <img
        src={avatarSrc}
        alt="Avatar"
        className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-border)]"
      />
      <div>
        <label htmlFor="single" className="cursor-pointer bg-[var(--color-background)] text-sm font-semibold text-[var(--color-text-primary)] py-2 px-4 rounded-md hover:bg-[var(--color-bg-subtle-hover)] transition-colors">
          {uploading ? 'Uploading…' : 'Upload'}
        </label>
        <input
          style={{ visibility: 'hidden', position: 'absolute' }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  );
}