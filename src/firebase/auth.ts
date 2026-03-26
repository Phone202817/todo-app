import { auth, db } from './config.ts'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export async function registerUser(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  if (credential.user) {
    await updateProfile(credential.user, { displayName })
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
