import React, { useEffect, useState, useRef} from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from '@/app/firebase/config';
import { doc, getDoc, setDoc, getDocs, collection, updateDoc,deleteDoc, increment } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useAuth } from "@/app/context/AuthContext";
import {updateTheRegistartionField} from "@/app/firebase/userHelpers";
type RegisteredDates = {  
  [date: string]: number;
};


const pad = (n: number) => n.toString().padStart(2, '0');
const getLocalDateStr = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export default function CalendarComponent() {
  const [registeredDates, setRegisteredDates] = useState<RegisteredDates>({});
  const [personalDats, setPersonalDates] = useState<string[]>([]); // Fix type from any[] to string[]
  const { user } = useAuth();//ia din auth datele user
  const hasRun = useRef(false);

// aici voi scrie niste documentare
  useEffect(() => {
    async function fetchRegistrations() { // aici incepem o functie care sa ia registrarea
      const regsCol = collection(db, 'registrations');//col=colection
      const snapshot = await getDocs(regsCol);//
      const regMap: RegisteredDates = {};
      snapshot.forEach(docSnap => {//snapshot
        const data = docSnap.data();
        if (data && data.date && Array.isArray(data.userIds)) {
          regMap[data.date] = data.userIds.length;
        }
      });
      setRegisteredDates(regMap);
    }
    async function fetchUserRegisteredDates() {
      if (!user) return;
      const userRegRef = doc(db, 'users', user.uid);
      const userRegSnap = await getDoc(userRegRef);
      if (userRegSnap.exists()) {
        const data = userRegSnap.data();
        if (data && data.registrations) {
          console.log("User registered dates:", data.registrations);
          setPersonalDates(data.registrations);
        }
      }
    }
    fetchUserRegisteredDates();
    fetchRegistrations();
  }, [user]); // Add user to dependency array
  
  const isSaturday = (date: Date) => date.getDay() === 6;
  const notifyNoUser = ()=> toast.info("Please log in to register for a date.")
  const notifyNoSaturday = ()=> toast.info("You can only register for Saturdays")
  const onDateChange = async (date: Date) => {
    if (!user) {
      notifyNoUser();
      return;
    }
    if (!isSaturday(date)) {
      notifyNoSaturday();
      return;
    }
    if(tileDisabled({ date })) {
      toast.error("This date is not available for registration.");
      return;
    }
    const dateStr = getLocalDateStr(date);
    const regRef = doc(db, 'registrations', dateStr);
    const regSnap = await getDoc(regRef);
    let userIds: string[] = [];
    let personalRegDats: string[] = [];
    let nameList: string[] = [];
    if (regSnap.exists()) {
      const data = regSnap.data();
      userIds = data.userIds || [];
      nameList = data.nameList || [];
      personalRegDats = personalDats;
      if (userIds.includes(user.uid)) {
        userIds = userIds.filter((id) => id !== user.uid);
        nameList = nameList.filter((name) => name !== (user.displayName || user.email || ""));
        personalRegDats = personalRegDats.filter((regDate) => regDate !== dateStr);
        setPersonalDates(personalRegDats);
        await setDoc(regRef, { date: dateStr, userIds, nameList }, { merge: true });
        await updateTheRegistartionField(user.uid, personalRegDats);
        toast.error('Registration canceled for this day.');
        setRegisteredDates(prev => ({ ...prev, [dateStr]: userIds.length }));
        return;
      }
      if (userIds.length >= 5) {
        toast.info('Day is full.');
        return;
      }
    }

    userIds.push(user.uid);
    nameList.push(user.displayName || user.email || "");
    personalRegDats.push(dateStr);
    setPersonalDates(personalRegDats);
    await updateTheRegistartionField(user.uid, personalRegDats);
    await setDoc(regRef, { date: dateStr, userIds, nameList }, { merge: true });
    toast.success("Registered for " + dateStr);
    setRegisteredDates(prev => ({ ...prev, [dateStr]: userIds.length }));
    return;
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    if(date < today){
        return true;
    }
    if (date.getDay() !== 6) return true;
    const dateStr = getLocalDateStr(date);;
    return registeredDates[dateStr] >= 5;
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = getLocalDateStr(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    const isSaturday = date.getDay() === 6;
    if (personalDats.includes(dateStr)) return 'registered';
    if (registeredDates[dateStr] >= 5) return 'full';
    if (registeredDates[dateStr]) return 'partial';
    if(!registeredDates[dateStr] && isSaturday && date>today) return 'available';
    const regsCol = collection(db, 'registrations');
    const snapshot = getDocs(regsCol);

    return 'everyelse';
  };

  const incrementPrezenteForPastDays = async () => {
    const regsCol = collection(db, 'registrations');
    const snapshot = await getDocs(regsCol);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Map to count unique days per user
    const userDayCount: Record<string, number> = {};

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (!data.date || !Array.isArray(data.userIds)) continue;
      const regDate = new Date(data.date);
      regDate.setHours(0, 0, 0, 0);
      if (regDate < today) {
        for (const uid of data.userIds) {
          userDayCount[uid] = (userDayCount[uid] || 0) + 1;
        }
        await deleteDoc(docSnap.ref);
      }
    }

    // Increment prezente for each user by their count
    for (const uid in userDayCount) {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { prezente: increment(userDayCount[uid]) });
    }
  };
  useEffect(() => {
    if (user && !hasRun.current) {
      hasRun.current = true;
      incrementPrezenteForPastDays();
    }
  }, [user]); // Add user to dependency array

  return (
    <div className="calendar-glass mx-auto my-8 p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg border border-gray-700 max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 drop-shadow">
        Register for Saturday Event
      </h2>
        <Calendar
        onClickDay={onDateChange}
        tileClassName={tileClassName}
        className="rounded-xl overflow-hidden shadow-lg pl-10 bg-gray-900"
        prev2Label={null}
        next2Label={null}
        />
      <div className="flex justify-center gap-4 mt-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-cyan-500 opacity-80 border border-purple-400"></span>
          Full
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-yellow-300 opacity-80 border border-yellow-400"></span>
          Partial
        </span>
          <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-red-500 opacity-60 border border-gray-600"></span>
          Registrated
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-white opacity-60 border border-gray-600"></span>
          Available
        </span>
      </div>
      <style>{`
        .calendar-glass {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        .react-calendar {
          background: transparent;
          border: none;
          color: #fff;
          
        }
        .react-calendar__tile {
          border-radius: 0.60rem;
          padding: 0.3rem 0.4rem;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          font-weight: 500;
          outline: none;  
          padding: 0.25rem !important;
          height: 2.2rem !important;
          width: 2.2rem !important;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background: blue;
          color: #fff;
          box-shadow: 0 0 0 0px #a78bfa55q  ;
        }
        .everyelse{
        background: black;
        color: #fff;
        ,
        }
        .available {
          background: white;
          color: black;
          opacity: 0.7;
          cursor: pointer;
        }
        .full {
          background: linear-gradient(90deg, #a78bfa 0%, #22d3ee 100%) !important;
          color: #fff !important;
          opacity: 0.7;
          cursor: not-allowed !important;
          border-radius: 0.75rem !important;
        }
        .partial {
          background: #fde68a !important;
          color: #92400e !important;
          border-radius: 0.75rem !important;
        } 
        .react-calendar__tile--now {
          background: purple!important;
          color: #fff !important;
          border-radius: 0.75rem !important;
        }
        .react-calendar__tile--active {
          background: linear-gradient(90deg, #a78bfa 0%, #22d3ee 100%) !important;
          color: #fff !important;
          border-radius: 0.75rem !important;
        }
        .react-calendar__navigation {
          background: transparent;
          margin-bottom: 1rem;
        }
        .react-calendar__navigation button {
          color: #a78bfa;
          min-width: 50px;
          background: transparent;
          font-size: 1.2rem;
          font-weight: bold;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }
          .registered{
          background: red;
          color: white;
          }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background: #a78bfa22;
        }
        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-size: 0.85rem;
          color: #a78bfa;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
