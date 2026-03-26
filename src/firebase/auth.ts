import { auth, db } from './config'
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'



export const registerUser = async (
  email: string,
  password: string,
  displayName: string
) => {
  // 🔥 สมัคร Auth
  const res = await createUserWithEmailAndPassword(auth, email, password)
  const user = res.user

  // 🔥 set displayName ใน Auth
  await updateProfile(user, {
    displayName
  })

  // 🔥 บันทึก Firestore (สำคัญมาก)
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: displayName,
    role: "User", // 🔥 ตรงนี้ที่คุณต้องการ
    status: "active",
    createdAt: new Date()
  })

  return user
}
export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}
