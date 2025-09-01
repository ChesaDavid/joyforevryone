"use client";
import React, { useState } from "react";
import { deleteProject } from "../firebase/userHelpers";
import { toast } from "react-toastify";

type EditProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  project: {
    uid: string;
    title: string;
    description: string;
    numberOfPrezente?: number;
  } | null;
  onSave: (updatedProject: { projectId: string; title: string; description: string , numbOfPrezente:number}) => void;
};

const handeDeleteProject = async (projectId: string) => {
  if (!projectId) return;
  try {
    await deleteProject({ projectId });
    toast.info("Project deleted successfully.");
  } catch (error) {
    console.error("Error deleting project:", error);
    toast.info("Failed to delete project. Please try again.");
  }
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, project, onSave }) => {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [numberOfPrezente, setNumberOfPrezente] = useState(project?.numberOfPrezente || 0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  React.useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description);
      setNumberOfPrezente(project.numberOfPrezente || 0);
    }
  }, [project]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Edit Project</h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 mb-3 rounded bg-gray-800 text-white border border-gray-700"
          placeholder="Project Title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 mb-3 rounded bg-gray-800 text-white border border-gray-700"
          placeholder="Project Description"
          rows={4}
        />
        <input
          type="number"
          value={numberOfPrezente}
          onChange={(e) => setNumberOfPrezente(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 mb-3 rounded bg-gray-800 text-white border border-gray-700"
          placeholder="Number of Prezente"
          min={0}
        />
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({
                projectId: project.uid, 
                title,
                description,
                numbOfPrezente:numberOfPrezente
              });
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={()=>{
              setIsDeleting(true);
            }
            }
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Delete Project
            </button>
        </div>
      </div>
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Deletion</h2>
            <p className="text-white mb-4">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handeDeleteProject(project.uid);
                  setIsDeleting(false);
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
          </div>
      )}
    </div>
  );
};

export default EditProjectModal;
