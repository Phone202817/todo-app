import { ref } from "vue"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../../firebase/config"

export const currentUser = ref<any>(null)

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const snap = await getDoc(doc(db, "users", user.uid))
    currentUser.value = snap.data()
  } else {
    currentUser.value = null
  }
})