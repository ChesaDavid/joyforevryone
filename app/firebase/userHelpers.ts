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

type UserDoc = {
    email: string;
    name: string;
    position: string;
    phone: string | null;
    whatsappInvite: boolean;
}



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

  // build doc only with defined values to avoid `undefined` being sent to Firestore
  const userDoc: UserDoc = {
    email: user.email,
    name: user.displayName || "",
    position,
    whatsappInvite: true,
    phone: user.phone || "",
  };
  if (user.phone !== undefined && user.phone !== null && user.phone !== '') {
    userDoc.phone = user.phone;
  }

  // sanitize object by removing keys with undefined values (extra safety)
  const sanitized = Object.fromEntries(
    Object.entries(userDoc).filter(([, v]) => v !== undefined)
  );

  try {
    await setDoc(
      doc(db, "users", user.uid),
      sanitized,
      { merge: true }
    );
  } catch (err) {
    console.error("upsertUser: failed to write user doc", err, "sanitized:", sanitized);
    // do not rethrow so auth flows aren't blocked by Firestore write issues
  }
}
export async function  setWhatsappFalse(userId :string) {
  const userRef = doc(db,"users",userId);
  await updateDoc(userRef,{
    whatsappInvite: false
  })
  
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
      author: project.participants[0] || "",
      description: project.description,
      imageUrl: project.imageUrl,
      participants: project.participants || [],
      participantsUids: project.participantsUids || [],
      // store the event start time in `date` so front-end uses it for "past" checks
      date: project.timeofstart,
      numberOfPrezente: project.numberOfPrezente || 0,
      timeOfBegining: project.timeofstart,
      participantsEmails: (project.participants || []).map(email => (email || "").toLowerCase()),
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
