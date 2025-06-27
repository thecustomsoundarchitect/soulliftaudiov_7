import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function AuthButtons() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Signed in with Google!");
    } catch (error) {
      console.error("Google login error", error);
    }
  };

  const loginWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Signed in with Email!");
    } catch (error) {
      console.error("Email login error", error);
    }
  };

  return (
    <div>
      <h3>Login</h3>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={loginWithEmail}>Sign In with Email</button>
      <button onClick={loginWithGoogle}>Sign In with Google</button>
    </div>
  );
}