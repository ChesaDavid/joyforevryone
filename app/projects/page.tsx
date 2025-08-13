'use client';
import { useEffect } from "react";

import {db,auth} from "@/app/firebase/config";
import React from "react";
import { useRouter } from 'next/navigation';
import {collection, getDocs} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import AddButton from "@/app/components/addButton";

type Project = {
    uid: string;
    author: string;
    title: string;
    description: string;
    date: string;
    participants: string[];
    startOfBegining: string;
    imageUrl: string;
    participantsEmails: string[];
}

const ProjectsPage:React.FC = ()=>{
    const [projects, setProjects] = React.useState<Project[]>([]);
    const { user } = useAuth();
    const router = useRouter();
    useEffect(() => {
        const fetchProjects = async () => {
            const projectsCol = collection(db, 'projects');
            const snapshot = await getDocs(projectsCol);
            const projectsList: Project[] = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data() as Project;
                projectsList.push(data);
            });
            setProjects(projectsList);
        };
        fetchProjects();
    },[]);
    if(!projects || projects.length === 0) {
        return (
                <main className="relative min-h-screen bg-gray-900 overflow-hidden flex items-center justify-center mb-16 p-6">

                No projects found.
            </main>
        )

    }
   // ...existing imports and code...

return (
  <div className="relative min-h-screen bg-gray-950 overflow-hidden flex items-center justify-center p-6">
    <div className="absolute inset-0 opacity-20 -z-10">
      <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"></div>
    </div>
    {user && 
  <AddButton  here="add-project" />
}

    <div className="w-full flex flex-col items-center">
      {projects.map((project, index) => {
        const isPast = new Date(project.date) < new Date();
        const userNameOrEmail = user?.displayName || user?.email || "";
        const isParticipant = project.participants.includes(userNameOrEmail);
        const isAuthor = project.participants[0 ] === userNameOrEmail;

        return (
          <div key={index} className="bg-gradient-to-br from-gray-950 to-gray-800 p-6 rounded-lg shadow-lg mb-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">{project.title}</h2>
            <p className="text-gray-400 mb-4">
              {project.description.length > 120
                ? project.description.slice(0, 120) + "..."
                : project.description}
            </p>
            <p className="text-gray-500 text-sm">Author: {project.author}</p>
            <p className="text-gray-500 text-sm">Date: {new Date(project.date).toLocaleDateString()}</p>
            <p className="text-gray-500 text-sm">Participants: {project.participants.join(', ')}</p>
            <div>
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                onClick={() => {
                    router.push(`/projects/${project.uid}`)
                    console.log("Button pressed");
                }}
              >
                View Details
              </button>
              {user && (
                <>
                  {isPast ? (
                    <span className="ml-4 text-gray-400">Event in the past</span>
                  ) : isParticipant ? (
                    isAuthor ? (
                      <button
                        className="mt-4 ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        onClick={() => toast(`You are the author of this project: ${project.title}`)}
                      >
                        Edit Project
                      </button>
                    ) : (
                      <button
                        className="mt-4 ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        onClick={() => alert(`You are already registered for this project: ${project.title}`)}
                      >
                        Unregister
                      </button>
                    )
                  ) : (
                    <button
                      className="mt-4 ml-4 bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition-colors"
                      onClick={() => alert(`You have registered for this project: ${project.title}`)}
                    >
                      Register
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>

  </div>
);
}
export default ProjectsPage;