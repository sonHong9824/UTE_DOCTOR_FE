"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("sonhong");
  return (
    <div>
      Login Page
      {email}
    </div>
  );
}
