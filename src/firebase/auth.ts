import { auth, db } from './config'
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export async function registerUser(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  if (credential.user) {
    await updateProfile(credential.user, { displayName })
    // Ensure auth.currentUser is set and matches
    if (!auth.currentUser || auth.currentUser.uid !== credential.user.uid) {
      throw new Error('Authentication state mismatch after sign up')
    }
    const userRef = doc(db, 'users', credential.user.uid)
    await setDoc(userRef, {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName,
      createdAt: serverTimestamp(),
    })
  }
  return credential.user
}

export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}
