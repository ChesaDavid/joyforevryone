import React, { useEffect, useState } from "react";
import { colRef } from "../firebase/config";
import { getDocs } from "firebase/firestore";
type UserInfo = {
  id: string;
  name?: string;
  email?: string;
  prezente?: number;
  position?: string;
  phone?: string;
  whatsappInvite?:boolean;
};

const LeaderBoard : React.FC = () =>{
    const [users, setUsers] = useState<UserInfo[]>([]);
    useEffect(() => {
        getDocs(colRef)
        .then((snapshot)=>{
            const usersArr: UserInfo[] = [];
            snapshot.docs.forEach((doc)=>{
                if(doc.data().prezente !== 0){
                    usersArr.push({name: doc.data().name, prezente: doc.data().prezente,id: doc.id})
                }
            });
            usersArr.sort((a,b) => (b.prezente || 0) - (a.prezente || 0));
            setUsers(usersArr);
        })
        .catch((err)=>{
            console.log("The error is "+ err);
        });

    }, []);
    return (
        <div className="max-w-4xl mx-auto my-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Leaderboard - Top Participants</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 rounded-lg overflow-scroll">
            <thead>
            <tr>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-cyan-300">Position</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-cyan-300">Name</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-cyan-300">Participations</th>
            </tr>
            
            </thead>
            <tbody>
            {users.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}>
                <td className="py-2 px-4 border-b border-gray-700 text-cyan-300">{index + 1}</td>
                <td className="py-2 px-4 border-b border-gray-700 text-white">{user.name || "N/A"}</td>
                <td className="py-2 px-4 border-b border-gray-700 text-white">{user.prezente || 0}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
        </div>
    );
}

export default LeaderBoard;