'use client'
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { colRef } from "@/app/firebase/config";
import { getDocs } from "firebase/firestore";
import CalendarComponent from "@/app/components/calendar";
import TableComponent from "@/app/components/showallpresent";
import InsertImage from "@/app/components/imageupload";
import {setWhatsappFalse} from "@/app/firebase/userHelpers";
import LeaderBoard from "@/app/components/leadrboard";

type UserInfo = {
  id: string;
  name?: string;
  email?: string;
  prezente?: number;
  position?: string;
  phone?: string;
  whatsappInvite?:boolean;
};
const DashboardPage: React.FC = () => {
  const { user, rank } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [personalInfo, setPersonalIngo] = useState<UserInfo[]>([]);
  const [addPicture, setAddPicture] = useState<boolean>(false);
  useEffect(() => {
    if (rank === "Coordonator") {
      getDocs(colRef)
        .then((snapshot) => {
          const usersArr: UserInfo[] = []; // Fix type from any[] to UserInfo[]
          snapshot.docs.forEach((doc) => {
            usersArr.push({ id: doc.id, ...doc.data() });
          });
          const persArr = snapshot.docs.filter((doc) => doc.id === user.uid);
          setPersonalIngo(persArr.map(doc => ({ id: doc.id, ...doc.data() })));
          
          setUsers(usersArr);
        })
        .catch((err) => {
          console.log("The error is " + err);
        });
    }else{
      getDocs(colRef)
        .then((snapshot) => {
          const persArr = snapshot.docs.filter((doc) => doc.id === user.uid);
          setPersonalIngo(persArr.map(doc => ({ id: doc.id, ...doc.data() })));
        })
        .catch((err) => {
          console.log("The error is " + err);
        });
    }
  }, [rank, user?.uid]); // Add user?.uid to dependency array
    const handleSetWhatsappFalse = async (userId: string) => {
    try {
      await setWhatsappFalse(userId); // update Firestore flag
      window.open(
        "https://chat.whatsapp.com/Co8j7OboUFh6hHcSisIIVJ",
        "_blank"
      ); // open group in new tab
    } catch (error) {
      console.error("Failed to update WhatsApp flag:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Access Denied</h2>
          <p className="text-center text-gray-400">You must be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-15 pb-15 bg-gray-950">
      
      <div className="bg-gradient-to-br from-gray-950 to-gray-900 text-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Welcome to your Dashboard</h2>
        <div
         className="flex-col align-middle"
         >
        <p className="text-center text-gray-400 mb-6">
          {personalInfo[0]?.name || user.email}
        </p>
        </div>
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-purple-600 text-white flex items-center justify-center text-3xl font-bold rounded-full shadow-lg border-4 border-cyan-500">
            {personalInfo[0]?.prezente ?? 0}
          </div>
        </div>

        <CalendarComponent />
        <TableComponent/>
        <LeaderBoard/>
        
        {rank === "Coordonator" && (
          <div>
            <h3 className="text-xl font-semibold mb-2">All Participants</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-700 text-left">Name</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-left">Email</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-left">Prezente</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-left">Position</th>
                    <th className="py-2 px-4 border-b border-gray-700 text-left">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-2 px-4 border-b border-gray-700">{u.name || "-"}</td>
                      <td className="py-2 px-4 border-b border-gray-700">{u.email}</td>
                      <td className="py-2 px-4 border-b border-gray-700">{u.prezente ?? 0}</td>
                      <td className="py-2 px-4 border-b border-gray-700">{u.position || "Volunteer"}</td>
                      <td className="py-2 px-4 border-b border-gray-700">{u.phone || <button
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      onClick={() => alert('Please update your phone number in your profile settings.')}
                      >Demand phone number</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="mt-8">
        
            {addPicture ? (
              <div className="flex flex-col gap-2 items-center justify-center">
                <InsertImage />
                  <button
                    onClick={() => setAddPicture(!addPicture)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >Hide Image Upload</button>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                  <button
                    onClick={() => setAddPicture(!addPicture)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >Image Upload</button>

              </div>
            )}
          
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;