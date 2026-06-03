"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@/lib/types";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestore থেকে user data নাও
        const userRef  = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          // Existing user
          const data = userSnap.data();
          setUser({
            id:         firebaseUser.uid,
            name:       data.name       || firebaseUser.displayName || "",
            email:      data.email      || firebaseUser.email || "",
            phone:      data.phone      || "",
            role:       data.role       || "customer",
            avatar:     data.avatar     || firebaseUser.photoURL || "",
            isVerified: data.isVerified || firebaseUser.emailVerified,
            createdAt:  data.createdAt?.toDate() || new Date(),
          } as User);
        } else {
          // নতুন user — Firestore-এ save করো (Google login এর ক্ষেত্রে)
          const newUser: Omit<User, "id"> = {
            name:       firebaseUser.displayName || "",
            email:      firebaseUser.email       || "",
            phone:      "",
            role:       "customer",
            avatar:     firebaseUser.photoURL    || "",
            isVerified: firebaseUser.emailVerified,
            createdAt:  new Date(),
          };

          await setDoc(userRef, {
            ...newUser,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          setUser({ id: firebaseUser.uid, ...newUser });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
