'use client'
import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

type Registration = {
  date: string;
  nameList: string[];
};

const ShowTabel: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const regsCol = collection(db, 'registrations');
      const snapshot = await getDocs(regsCol);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);

      const regs: Registration[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (!data.date || !Array.isArray(data.nameList)) return;
        const regDate = new Date(data.date);
        regDate.setHours(0, 0, 0, 0);
        if (regDate >= today && regDate <= nextMonth) {
          regs.push({
            date: data.date,
            nameList: data.nameList,
          });
        }
      });

      regs.sort((a, b) => a.date.localeCompare(b.date));
      setRegistrations(regs);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-2xl mx-auto my-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
        Participants for the Next Month
      </h2>
      {loading ? (
        <div className="text-center text-cyan-300">Loading...</div>
      ) : (
        <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-700 text-left text-cyan-300">Date</th>
              <th className="py-2 px-4 border-b border-gray-700 text-left text-cyan-300">Participants</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-4 text-center text-gray-400">No registrations for the next month.</td>
              </tr>
            ) : (
              registrations.map(reg => (
                <tr key={reg.date}>
                  <td className="py-2 px-4 border-b border-gray-800">{reg.date}</td>
                  <td className="py-2 px-4 border-b border-gray-800">
                    {reg.nameList.length > 0
                      ? reg.nameList.map((name, idx) => (
                          <span key={idx} className="inline-block bg-cyan-800/60 text-cyan-100 rounded px-2 py-1 mr-2 mb-1 text-xs">
                            {name}
                          </span>
                        ))
                      : <span className="text-gray-500">No participants</span>
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ShowTabel;