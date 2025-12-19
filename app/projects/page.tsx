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
import ListOfPeopleModal from "@/app/modal/ListOfPeople";
import RemoveParticipants from "../modal/RemoveParticipants";

type Project = {
    uid: string;
    author: string;
    title: string;
    description: string;
    date: string;
    participants: string[];
    participantsUids: string[];
    startOfBegining?: string;
    imageUrl: string;
    numberOfPrezente: number;
    participantsEmails: string[];
    active: boolean;
}
type ProjectUpdate = {
    projectId: string;
    title: string;
    description: string;
    numberOfPrezente: number;
}

const ProjectsPage:React.FC = ()=>{
    const [projects, setProjects] = React.useState<Project[]>([]);
    const { user ,rank} = useAuth();
    const router = useRouter();
    const [editingProject, setEditingProject] = useState<ProjectUpdate | null>(null);
    const [showPeopleModal, setShowPeopleModal] = useState<{isOpen: boolean, projectId: string | null}>({isOpen: false, projectId: null});
    const [removeParticipants,setRemoveParticipants] = useState<{isOpen: boolean, projectId: string | null}>({isOpen: false, projectId: null});

    useEffect(() => {
        const fetchProjects = async () => {
            const projectsCol = collection(db, 'projects');
            const snapshot = await getDocs(projectsCol);
            const projectsList: Project[] = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                projectsList.push({
                  uid: data.uid || docSnap.id,
                  author: data.author || "",
                  title: data.title || "",
                  description: data.description || "",
                  date: data.date || data.timeOfBegining || new Date().toISOString(),
                  participants: data.participants || [],
                  participantsUids: data.participantsUids || [],
                  imageUrl: data.imageUrl || "",
                  numberOfPrezente: data.numberOfPrezente || 0,
                  participantsEmails: data.participantsEmails || [],
                  active: typeof data.active === "boolean" ? data.active : true,
                } as Project);
            });
            // Sort projects: active first, then inactive
            projectsList.sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0));
            setProjects(projectsList);
        };
        fetchProjects();
    },[]);

    useEffect(() => {
    const processPastProjects = async () => {
      for (const project of projects) {
        const isPast = new Date(project.date) < new Date();
        if (isPast && project.active) {
          // mark inactive so we don't award multiple times
          await disableProjectAttendancePoints(project.uid);

          // award prezente to participants based on the stored numberOfPrezente
          for (const userId of project.participantsUids || []) {
            if (project.numberOfPrezente && project.numberOfPrezente > 0) {
              await updatePrezente(userId, project.numberOfPrezente);
            }
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
            <p className="text-gray-500 text-sm">Prezente (per participant): {project.numberOfPrezente}</p>
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
                       onClick={() => setEditingProject({projectId: project.uid, title: project.title, description: project.description, numberOfPrezente: project.numberOfPrezente})}
                      >
                        Edit Project
                      </button>
                    
                  ) : isParticipant ? (
                isPast ? (
                      <span className="ml-4 text-gray-400">Event in the past</span>
                    ) : !isPast && (
                      <button
                        className="mt-4 ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        onClick={() => handleExitProject(project.uid)}
                      >
                        Unregister
                      </button>
                    )
                  ) : !isPast && (
                    <button
                      className="mt-4 ml-4 bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition-colors"
                      onClick={() => handleJoinProject(project.uid)}
                    >
                      Register
                    </button>
                  )}
                    {rank === "Coordonator" && !isPast && (
                        <>
                        <button
                            className="bg-blue-700 ml-4 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
                            onClick={() =>
                                setShowPeopleModal({
                                    isOpen: true,
                                    projectId: project.uid,
                                })
                            }
                        >
                            Add people
                        </button>
                        <button
                            className="bg-red-700 ml-4 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
                            onClick={() =>
                                setRemoveParticipants({
                                    isOpen: true,
                                    projectId: project.uid,
                                })
                            }
                        >
                            Remove people
                        </button>
                        </>
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
          editProject(updated)
        }}
      />
      {showPeopleModal.isOpen && showPeopleModal.projectId && (
          <ListOfPeopleModal
              isOpen={showPeopleModal.isOpen}
              projectId={showPeopleModal.projectId}
              onClose={() =>
                  setShowPeopleModal({ isOpen: false, projectId: null })
              }
          />
      )}
      {removeParticipants.isOpen && removeParticipants.projectId && (
          <RemoveParticipants
              isOpen={removeParticipants.isOpen}
              projectId={removeParticipants.projectId}
              onClose={() =>
                  setRemoveParticipants({ isOpen: false, projectId: null })
              }
          />
      )}

  </div>
);
}
export default ProjectsPage;