'use client';
import { useEffect, useState } from "react";

import {db} from "@/app/firebase/config";
import React from "react";
import { useRouter } from 'next/navigation';
import {collection, getDocs} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import AddButton from "@/app/components/addButton";
import {updateProject, editProject,disableProjectAttendancePoints,updatePrezente} from "@/app/firebase/userHelpers"
import EditProjectModal from "@/app/modal/EditProjectModal";


type Project = {
    uid: string;
    author: string;
    title: string;
    description: string;
    date: string;
    participants: string[];
    participantsUids: string[];
    startOfBegining: string;
    imageUrl: string;
    numberOfPreznte: number;
    participantsEmails: string[];
    active: boolean;
}

const ProjectsPage:React.FC = ()=>{
    const [projects, setProjects] = React.useState<Project[]>([]);
    const { user ,rank} = useAuth();
    const router = useRouter();
    const [editingProject, setEditingProject] = useState<Project | null>(null);
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
    useEffect(() => {
    const processPastProjects = async () => {
      for (const project of projects) {
        const isPast = new Date(project.date) < new Date();
        if (isPast && project.active) {
          await disableProjectAttendancePoints(project.uid);

          for (const userId of project.participantsUids) {
            await updatePrezente(userId, project.numberOfPreznte);
          }
        }
      }
    };

    if (projects.length > 0) {
      processPastProjects();
    }
  }, [projects]);
    const handleExitProject = (projectId: string) => {
        if(!user || !user.email) {
            toast.error("You must be logged in to unregister from a project.");
            return;
        }
        const project = projects.find(p => p.uid === projectId);
        if(!project) {
            toast.error("Project not found.");
            return;
        }
        if(!project.participantsEmails.includes(user.email.toLowerCase())) {
            toast.info("You are not registered for this project.");
            return;
        }
        const updatedParticipants = project.participants.filter(p => p !== (user.displayName || user.email));
        const updatedParticipantsEmails = project.participantsEmails.filter(email => email !== user.email.toLowerCase());
        const updatedParticipantsUids = project.participantsUids.filter(id => id !== user.uid);
        updateProject({ participants: updatedParticipants, participantsUids: updatedParticipantsUids,projectId: projectId })
            .then(() => {
                setProjects(prevProjects => prevProjects.map(p => p.uid === projectId ? { ...p, participants: updatedParticipants, participantsEmails: updatedParticipantsEmails } : p));
                toast.success("Successfully unregistered from the project.");
            })
            .catch((error) => {
                console.error("Error unregistering from project: ", error);
                toast.error("Failed to unregister from the project. Please try again later.");
            });
    }
    const handleJoinProject = (projectId : string)=>{
        if(!user || !user.email) {
            toast.error("You must be logged in to join a project.");
            return;
        }
        const project = projects.find(p => p.uid === projectId);
        if(!project) {
            toast.error("Project not found.");
            return;
        }
        if(project.participantsEmails.includes(user.email.toLowerCase())) {
            toast.info("You are already registered for this project.");
            return;
        }
        const updatedParticipants = [...project.participants, user.displayName || user.email || "Unknown"];
        const updatedParticipantsEmails = [...project.participantsEmails, user.email.toLowerCase()];
        const updatedParticipantsUids = [...project.participantsUids, user.uid];
        updateProject({ participants: updatedParticipants,participantsUids: updatedParticipantsUids, projectId: projectId })
            .then(() => {
                setProjects(prevProjects => prevProjects.map(p => p.uid === projectId ? { ...p, participants: updatedParticipants, participantsEmails: updatedParticipantsEmails } : p));
                toast.success("Successfully registered for the project.");
            })
            .catch((error) => {
                console.error("Error joining project: ", error);
                toast.error("Failed to join the project. Please try again later.");
            });
    }
    if(!projects || projects.length === 0) {
        return (
                <main className="relative min-h-screen bg-gray-900 overflow-hidden flex items-center justify-center mb-16 p-6">

                No projects found.
              {user && rank === "Coordonator" &&
  <AddButton  here="add-project" />
}

              </main>
        )

      }
return (
  <div className="relative min-h-screen bg-gray-950 overflow-hidden flex items-center justify-center mt-10 p-6">
    <div className="absolute inset-0 opacity-20 -z-10">
      <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"></div>
    </div>
    {user && rank === "Coordonator" &&
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
            <p className="text-gray-500 text-sm">Prezente: {String(project.numberOfPreznte)}</p>
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
                  {isAuthor ? (
			                <button
                        className="mt-4 ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                       onClick={() => setEditingProject(project)}
                      >
                        Edit Project
                      </button>
                    
                  ) : isParticipant ? (
                isPast ? (
                      <span className="ml-4 text-gray-400">Event in the past</span>
                    ) : (
                      <button
                        className="mt-4 ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        onClick={() => handleExitProject(project.uid)}
                      >
                        Unregister
                      </button>
                    )
                  ) : (
                    <button
                      className="mt-4 ml-4 bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition-colors"
                      onClick={() => handleJoinProject(project.uid)}
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
      <EditProjectModal 
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        project={editingProject}
        onSave={(updated) => {
          console.log("Updated project:", updated);
          editProject(updated)
        }}
      />

  </div>
);
}
export default ProjectsPage;