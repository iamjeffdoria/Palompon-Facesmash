import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

const bots = [
  { name: "Ivan C.", barangay: "Mahawan", photoURL: "https://placehold.co/300x400?text=Ivan" },
  { name: "Reyna F.", barangay: "Bagong Silang", photoURL: "https://placehold.co/300x400?text=Reyna" },
  { name: "Marga D.", barangay: "Poblacion", photoURL: "https://placehold.co/300x400?text=Marga" },
  { name: "Jhun-Jhun R.", barangay: "Cangcosme", photoURL: "https://placehold.co/300x400?text=JhunJhun" },
  { name: "Ate Vhel", barangay: "Camotes", photoURL: "https://placehold.co/300x400?text=Vhel" },
];

export async function seedBots() {
  for (const bot of bots) await addDoc(collection(db, "bots"), bot);
  console.log("Seeded", bots.length, "bots");
}