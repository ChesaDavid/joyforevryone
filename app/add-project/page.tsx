"use client";
import React, { useState } from "react";
import { storage } from "@/app/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { setProject } from "../firebase/userHelpers";
import { v4 as uuidv4 } from "uuid";
import {  useAuth } from "@/app/context/AuthContext";
import Image from "next/image";

const AddProjectPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);  
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [timeofstart, setTimeofstart] = useState<string>("");
  const { user } = useAuth();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
     setUploading(true);
     const storageRef = ref(storage, `projects/${file.name}`);

    try {
      await uploadBytes(storageRef, file);
     const downloadURL = await getDownloadURL(storageRef);
      setUploadedUrl(downloadURL);
      setError(null);
      } catch (error) {
        console.error("Upload failed:", error);
        setError("Failed to upload file.");
      } finally {
        setUploading(false);
      }
    };
    const handleGenerateDescription = async () => {
      if(!title){setError("Please provide a title to generate a description."); return;}
      setError(null);
      try{
        const response = await fetch('api/generate-description',{
          method: 'POST',
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ title })
        });
        const data = await response.json();
        console.log(data);
        if(data.description){
          setDescription(data.description);
        } else {
          setError("Failed to generate description.");
        }
      }
      catch (error) {
        console.error("Error generating description:", error);
        setError("Failed to generate description h.");
      }
    } 

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!uploadedUrl || !title || !description || !timeofstart) {
        setError("Please fill all fields and upload an image.");
        return;
      }
      const list = [];
      list.push(user.displayName || user.email || "");
      const newProject = {
        uid: uuidv4(),
        name: title,
        description,
        imageUrl: uploadedUrl,
        participants: list,
        timeofstart,
      };

      try {
        await setProject(newProject);
        setTitle("");
        setDescription("");
        setTimeofstart("");
        setUploadedUrl(null);
        setFile(null);
        alert("Project added successfully.");
      } catch (error) {
        console.error("Failed to add project:", error);
        setError("Could not save the project.");
      }
    };

    return (
        <main className=" min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
          <div className="min-h-screen  mx-auto p-6 bg-gradient-to-br from-gray-950  to-gray-900 rounded-xl shadow-xl border border-gray-900 mt-10">
          <div className="absolute inset-0 opacity-20 -z-10">
            <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"></div>
          </div>
          <h2 className="text-3xl font-bold text-white text-center mb-6">Add New Project</h2>
          <form onSubmit={handleSubmit}
            className="inset-0 ">
            <div className="mb-6">
              <label htmlFor="title" className="block text-lg font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onClick={() => console.log("Title clicked")}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-lg font-medium text-gray-300 mb-2">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:border-blue-500"
                rows={5}
                required
              ></textarea>
            <button 
                  onClick={()=> handleGenerateDescription()}
                  className="flex items-center gap-2 bg-blue-500/10 p-2 rounded-lg mt-2 cursor-pointer hover:bg-blue-900 transition-colors">
                <span className="text-lg font-medium text-white">AI Description</span>
                <span className="text-sm text-gray-400">Generate</span> 
              </button>
            </div>

            <div className="mb-6">
              <label htmlFor="timeofstart" className="block text-lg font-medium text-gray-300 mb-2">Start Time</label>
              <input
                type="datetime-local"
                id="timeofstart"
                value={timeofstart}
                onChange={(e) => setTimeofstart(e.target.value)}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-300 mb-2">Project Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800 transition-colors duration-200"
              />
              {
                file && (
                  <div className="mt-2 text-sm text-gray-400">
                    <label className="block mb-1">Change file name:</label>
                    <input
                      type="text"
                      value={file.name}
                      onChange={(e) => {
                        if (file) {
                          const newFile = new File([file], e.target.value, { type: file.type });
                          setFile(newFile);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:border-blue-500"/>
                  </div>
                )
              }
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !file}
                className={`mt-2 px-4 py-2 rounded-lg font-medium text-white ${uploading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} transition-colors duration-200`}
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </div>

            {uploadedUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Uploaded Image Preview:</h3>
                <Image src={uploadedUrl} alt="Uploaded" className="w-full rounded-lg" />
              </div>
            )}

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  };

  export default AddProjectPage;
