import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  addDoc,
  updateDoc,
  doc,
  getDocs, 
  query, 
  orderBy 
} from "firebase/firestore";
import { Project } from "../types";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgWNaq_596VMuHQ5vtcwYR5UxDO4qLCVc",
  authDomain: "pdntest-8e107.firebaseapp.com",
  projectId: "pdntest-8e107",
  storageBucket: "pdntest-8e107.firebasestorage.app",
  messagingSenderId: "53545672973",
  appId: "1:53545672973:web:4b32d86e04bd6d9ac85044",
  measurementId: "G-QQY1KK663S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const PROJECTS_COLLECTION = "projects";

// Fetch all projects
export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// Add a new project
export const createProject = async (project: Project): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...project,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

// Update an existing project
export const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    // Remove id from updates if present to avoid overwriting document ID field (though Firestore handles this, it's cleaner)
    const { id: _, ...dataToUpdate } = updates as any; 
    await updateDoc(docRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};