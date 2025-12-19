"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getDocs, doc, getDoc } from "firebase/firestore";
import { colRef, db } from "@/app/firebase/config";
import { updateProject } from "@/app/firebase/userHelpers";
import { toast } from "react-toastify";

type UserInfo = {
  id: string;
  name?: string;
  email?: string;
};

type Props = {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
};

const RemoveParticipants: React.FC<Props> = ({ isOpen, projectId, onClose }) => {
  const { user, rank } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [thisProjectParticipantsId, setThisProjectParticipantsId] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || rank !== "Coordonator") return;

    getDocs(colRef)
      .then((snapshot) => {
        const usersArr: UserInfo[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersArr);
      })
      .catch((err) => {
        console.error("Error getting users:", err);
      });
      getDoc(doc(db, "projects", projectId))
        .then((projectSnap) => {
            if (projectSnap.exists()) {
                const data = projectSnap.data();
                const participantsUids: string[] = data.participantsUids || [];
                setThisProjectParticipantsId(participantsUids);
                // Filter users to only show participants
                setUsers((prevUsers) => prevUsers.filter(u => participantsUids.includes(u.id)));
            }
        })
        .catch((err) => {
            console.error("Error getting project participants:", err);
        });
  }, [isOpen, rank, projectId]);

  if (!isOpen || !user || rank !== "Coordonator") return null;

  const handleRemoveFromProject = async (selectedUser: UserInfo) => {
    try {
      setLoadingId(selectedUser.id);

      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);

      if (!projectSnap.exists()) {
        toast.error("Project not found");
        return;
      }

      const data = projectSnap.data();
      const participants: string[] = data.participants || [];
      const participantsUids: string[] = data.participantsUids || [];
      const participantsEmails: string[] = data.participantsEmails || [];

      const index = participantsUids.indexOf(selectedUser.id);
      if (index === -1) {
        toast.info("User not in project");
        return;
      }

      // Remove from all arrays
      participants.splice(index, 1);
      participantsUids.splice(index, 1);
      participantsEmails.splice(index, 1);

      await updateProject({
        projectId,
        participants,
        participantsUids,
        participantsEmails,
      });

      toast.success("User removed from project");
      window.location.reload(); // Refresh page to update list
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove user");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-3">
      <div className="bg-gray-900 w-full max-w-md rounded-xl shadow-xl p-4 relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-white mb-4 text-center">
          Remove people from project
        </h2>

        {/* Scrollable list for mobile */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {users.map((u) => (
            <button
              key={u.id}
              disabled={loadingId === u.id}
              onClick={() => handleRemoveFromProject(u)}
              className="w-full flex flex-col rounded-lg bg-gray-800 px-4 py-3 text-left hover:bg-red-600 transition disabled:opacity-60"
            >
              <span className="text-white font-medium">
                {u.name || "Unnamed user"}
              </span>
              <span className="text-sm text-gray-400">
                {u.email}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RemoveParticipants;
