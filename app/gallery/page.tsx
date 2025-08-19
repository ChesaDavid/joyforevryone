'use client';

import React from "react";
import {ref,getDownloadURL, listAll} from 'firebase/storage'
import { storage } from "../firebase/config";
import Image from "next/image";
import { useState ,useEffect } from "react";

type Url = {
    url: string;
}
const GalleryPage:React.FC = () => {
    const [imageUrl, setImageUrl] = useState<Url[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(()=>{
        const fetchImages = async () => {
            try {
                const storageRef = ref(storage, 'images/');
                const listResult = await listAll(storageRef);
                const urls: Url[] = [];
                for (const item of listResult.items) {
                    const url = await getDownloadURL(item);
                    urls.push({ url });
                }
                setImageUrl(urls);
            } catch (error) {
                console.error("Error fetching images:", error);
                setError("Failed to load images.");
            }
        };
        fetchImages();
    },[])
    return(
        <main className="min-h-screen bg-gray-950 mt-12">
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"></div>
            </div>
            {
                imageUrl && imageUrl.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                        {imageUrl.map((item, index) => (
                            <div key={index} 
                                onClick={() => window.open(item.url, "_blank")}
                                className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                                <Image
                                    src={item.url}
                                    alt={`Image ${index + 1}`}
                                    layout="fill"
                                    objectFit="cover"
                                    className="transition-transform duration-300 hover:scale-105"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-screen text-white">
                        {error ? <p className="text-red-500">{error}</p> : <p>No images found.</p>}
                    </div>
                )
            }
            

        </main>
    )
}
export default GalleryPage;