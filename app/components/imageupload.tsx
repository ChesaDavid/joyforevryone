'use client';

import { useState } from "react";
import Image from "next/image";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

type Url = {
  url: string;
};

export const ImageUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<Url | null>(null);
  const [error, setError] = useState<string | null >(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `images/${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setUploadedUrl({ url: downloadURL });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl shadow-xl space-y-6 border border-gray-800">
      <h2 className="text-3xl font-bold text-center text-white">Image Uploader</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full text-sm text-gray-300
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-700 file:text-white
          hover:file:bg-blue-800
          transition-colors duration-200"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <button
        onClick={()=> {
          if(file){
            handleUpload();
            setError(null);
          }else
            setError('Please select a file to upload');
        }}
        disabled={uploading}
        className={`w-full py-2.5 px-4 rounded-xl text-white font-medium transition-all duration-200 ${
          uploading
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
        }`}
      >

        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {uploadedUrl && (
        <div className="text-center space-y-3">
          <p className="text-gray-400 text-sm">Uploaded Image Preview:</p>
          <div className="overflow-hidden rounded-xl shadow-lg border border-gray-800">
            <Image
              src={uploadedUrl.url}
              alt="Uploaded Image"
              width={400}
              height={400}
              className="object-cover w-full h-auto transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
