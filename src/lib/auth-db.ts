import { db } from './firebase';
import { collection, getDocs, addDoc, query, where, limit } from 'firebase/firestore';

export interface User {
    id: string; // We will use this to store the Firestore Document ID or generated UUID
    name: string;
    email: string;
    password: string;
}

const USERS_COLLECTION = 'users';

// Helper to transform Firestore doc to User
const mapDocToUser = (doc: any): User => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        email: data.email,
        password: data.password
    } as User;
};

export async function getUsers(): Promise<User[]> {
    try {
        const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
        return querySnapshot.docs.map(mapDocToUser);
    } catch (error) {
        console.error("Error fetching users from Firestore:", error);
        return [];
    }
}

export async function addUser(user: User) {
    try {
        // Firestore creates its own IDs, but we can store the 'id' field if we want, 
        // or just let Firestore auto-generate. 
        // Here we store the user object as-is.
        const { id, ...userData } = user; // Separate ID if it was manually generated
        await addDoc(collection(db, USERS_COLLECTION), {
            ...userData,
            originalId: id // Keep the original UUID if needed, or rely on Firestore ID
        });
    } catch (error) {
        console.error("Error adding user to Firestore:", error);
        throw new Error("Failed to create user in database.");
    }
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
    try {
        const q = query(collection(db, USERS_COLLECTION), where("email", "==", email), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return undefined;
        }

        return mapDocToUser(querySnapshot.docs[0]);
    } catch (error) {
        console.error("Error finding user:", error);
        return undefined;
    }
}
