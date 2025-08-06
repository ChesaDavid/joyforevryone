'use client'
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/app/firebase/config";
import { getDocs ,collection} from "firebase/firestore";
import { useRouter } from 'next/navigation'

type Project = {
    uid: string;
    author: string;
    title: string;
    description: string;
    createdAt: string;
    participants: string[];
    date: string;
    imageUrl: string;
}

export const PrivatePage: React.FC = () => {
    const [selectedProject,setSelctedProjec] = useState<Project[] | null>(null);    
    const [projectFound , setProjectFound] = useState<Boolean>(false);
    const pathname = usePathname();
    const router = useRouter();
    useEffect(()=>{
        const fetchSelectedProject = async () => {
            const storageCol = collection(db,"projects");
            const snapshot = await getDocs(storageCol);
            const selec: Project[] = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data() as Project;
                if (docSnap.id === pathname.split('/').pop()) {
                    selec.push(data);
                    setProjectFound(true);
                }
            });
            setSelctedProjec(selec);

        }
        fetchSelectedProject();
    },[])
    if(projectFound===false){
        console.log("Project not found");
        return(
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
                    <h1 className="text-2xl font-bold mb-4">Project not Found</h1>
                    <p className="text-gray-400 mb-6">This page is  strangly the fault of Dosoniu.</p>
                    <p className="text-blue-500 hover:underline cursor-pointer" onClick={() => router.push('/')}>Click to go to safty</p>
                </div>      
            </div>
        )    
    }
    return(
        console.log(selectedProject),
        selectedProject && selectedProject.length > 0 && (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
                    <h1 className="text-2xl font-bold mb-4">{selectedProject[0].title}</h1>
                    <p className="text-gray-400 mb-6">{selectedProject[0].description}</p>
                    <p className="text-gray-400 mb-6">Author: {selectedProject[0].author}</p>
                    <p className="text-gray-400 mb-6">Date: {selectedProject[0].date}</p>
                    <p className="text-gray-400 mb-6">Participants: {selectedProject[0].participants.join(', ')}</p>
                    <img src={selectedProject[0].imageUrl} alt="Project Image" className="w-full h-full object-cover rounded-lg mb-4" />

                    <p className="text-blue-500 hover:underline cursor-pointer" onClick={() => alert('You are logged in!')}>Click here to confirm access</p>
                </div>
            </div>
        ) 
    )
}
export default PrivatePage;