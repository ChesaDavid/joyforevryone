import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

function getCoordinatorEmails(): string[] {
  const env = process.env.NEXT_PUBLIC_COORDONATOR_EMAILS || "";
  return env.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
}

export async function upsertUser(user: { uid: string; email: string | null; displayName: string | null }) {
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
      registrations: [],
    },
    { merge: true }
  );
}

export async function updateTheRegistartionField(userId: string, registrations: string[]) {
  await updateDoc(doc(db, "users", userId), {
    registrations: registrations,
  });
}

export async function setProject(project: { uid: string; name: string; description: string; imageUrl: string; participants: string[]; timeofstart: string }) {
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
      date: new Date().toISOString(),
      timeOfBegining: project.timeofstart,
      participantsEmails: project.participants.map(email => email.toLowerCase()),
    }
  );
}

export async function updateProject(update: { participants: string[]; projectId: string }) {
  if (!update.participants) return;
  const projectRef = doc(db, "projects", update.projectId);
  await updateDoc(projectRef, {
    participants: update.participants,
  });
}

export function isCoordonator(email: string | null | undefined): boolean {
  if (!email) return false;
  const coordinatorEmails = getCoordinatorEmails();
  return coordinatorEmails.includes(email.toLowerCase());
}