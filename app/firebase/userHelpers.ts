import { doc, setDoc, updateDoc,increment ,deleteDoc} from "firebase/firestore";
import { db } from "./config";

type ProjectUpdate = {
  projectId: string;
  participants?: string[];
  participantsUids?: string[];
  title?: string;
  description?: string;
  date?: string;
  imageUrl?: string;
  active?: boolean;
  numberOfPrezente?: number;
  [key: string]: string | boolean | string[] | number | undefined; 
};




export async function editProject(update: ProjectUpdate) {
  const { projectId, ...fieldsToUpdate } = update;

  if (!projectId) throw new Error("Project ID is required");
  if (Object.keys(fieldsToUpdate).length === 0) return;

  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, fieldsToUpdate);
}

export async function deleteProject(update: { projectId: string }) {
  const { projectId } = update;

  if (!projectId) throw new Error("Project ID is required");

  const projectRef = doc(db, "projects", projectId);
  await deleteDoc(projectRef);
  
}
function getCoordinatorEmails(): string[] {
  const env = process.env.NEXT_PUBLIC_COORDONATOR_EMAILS || "";
  return env.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
}

export async function upsertUser(user: { uid: string; email: string | null; displayName: string | null; phone?:string | null}) {
  if (!user.uid || !user.email) return;
  const coordinatorEmails = getCoordinatorEmails();
  const position = coordinatorEmails.includes(user.email.toLowerCase()) ? "Coordonator" : "Volunteer";
  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      name: user.displayName || "",
      prezente: 0,
      position,
      phone: user.phone,
      registrations: [],
    },
    { merge: true }
  );
}
export async function updatePrezente(userId: string, numberOfPrezente: number) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    prezente: increment(numberOfPrezente),
  });
}

export async function updateTheRegistartionField(userId: string, registrations: string[]) {
  await updateDoc(doc(db, "users", userId), {
    registrations: registrations,
  });
}

export async function setProject(project: { uid: string; name: string; description: string; imageUrl: string; participants: string[];participantsUids: string[];numberOfPrezente: number; timeofstart: string }) {
  if (!project.uid || !project.name || !project.description || !project.imageUrl) return;
  await setDoc(
    doc(db, "projects", project.uid),
    {
      uid: project.uid,
      title: project.name,
      author: project.participants[0],
      description: project.description,
      imageUrl: project.imageUrl,
      participants: project.participants,
      participantsUids: project.participantsUids,
      date: new Date().toISOString(),
      numberOfPrezente:project.numberOfPrezente,
      timeOfBegining: project.timeofstart,
      participantsEmails: project.participants.map(email => email.toLowerCase()),
      active: (new Date(project.timeofstart) < new Date()) ? false : true,
    }
  );
}

export async function disableProjectAttendancePoints(projectId: string) {
  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, {
    active: false,
  });
}


export async function updateProject(update: { participants: string[];participantsUids: string[]; projectId: string }) {
  if (!update.participants) return;
  const projectRef = doc(db, "projects", update.projectId);
  await updateDoc(projectRef, {
    participants: update.participants,
    participantsUids: update.participantsUids
  });
}
export function isCoordonator(email: string | null | undefined): boolean {
  if (!email) return false;
  const coordinatorEmails = getCoordinatorEmails();
  return coordinatorEmails.includes(email.toLowerCase());
}