"use client";

import { UserProfileDTO } from "@/dto/userProfile.dto";
import { useEffect, useRef, useState } from "react";

export default function EffectExample() {
    const [user, setUser] = useState<UserProfileDTO | null>(null);
    const apiUrl = process.env.BASE_API || "http://localhost:3001";
    useEffect(() => {
        // Get user profile from API
        fetch(`${apiUrl}/api/users/by-email?email=aaaa@example.com`)
            .then((res) => res.json())
            .then(
                function (response) {
                    setUser(response.data);
                    console.log("Fetched user profile:", response.data);
                }
            )
            .catch((err) => console.error("Failed to fetch user profile:", err));
        
    }, []);

    const avatarRef = useRef<HTMLImageElement>(null);
    const handleChangeAvatar = async () => {
        if (!user) return;
        const inputAvt = document.createElement("input");
        inputAvt.type = "file";
        inputAvt.accept = "image/*";
        inputAvt.onchange = async () => {
            if (inputAvt.files && inputAvt.files[0] && avatarRef.current) {
                const formData = new FormData();
                formData.append("avatar", inputAvt.files[0]);
                // Upload avatar to API
                // try {
                //     const res = await fetch(`${apiUrl}/api/users/${user.id}/avatar`, {
                //         method: "POST",
                //         body: formData,
                //     });
                //     const data = await res.json();
                //     if (res.ok) {
                //         setUser({ ...user, avatarUrl: data.avatarUrl });
                //         alert("Avatar updated successfully!");
                //     } else {
                //         alert(`Failed to update avatar: ${data.message}`);
                //     }
                // } catch (error) {
                //     console.error("Error uploading avatar:", error);
                //     alert("An error occurred while uploading the avatar.");
                // }
                avatarRef.current.src = URL.createObjectURL(inputAvt.files[0]);
                alert("Avatar upload functionality is just a demo, it is not going to call api.");
            }
        };
        inputAvt.click();
    }
        
return (
    <div className="min-h-screen">
        {user ? (
        <div className="flex">
            {/* User avt */}
            <div className="w-1/3 min-h-screen p-4 flex flex-col justify-center items-center">
                <img 
                    ref={avatarRef}
                    id="avatar"
                    src={user.avatarUrl}
                    alt={`${user.name}'s avatar`}
                    className="w-64 h-64 rounded-full mx-auto
                     justify-center items-center object-cover object-center border-4 border-gray-500"
                /> 
                <div>
                    <button className="mt-8 text-gray-500 text-3xl italic
                     underline hover:cursor-pointer"
                     onClick={handleChangeAvatar}>Change my avatar</button>
                </div>
            </div>
            {/* User info */}
            <div className="w-2/3 p-4 flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold mb-4">{user.name}</h1>
                <p className="mb-2"><strong>Email:</strong> {user.email}</p>
                {user.bio && <p className="mb-2"><strong>Bio:</strong> {user.bio}</p>}
                {user.location && <p className="mb-2"><strong>Location:</strong> {user.location}</p>}
                <p className="text-sm text-gray-500">
                    Joined on {new Date(user.createdAt).toLocaleDateString()}
                </p>
            </div>

        </div>
        
        ) : (
            <p className="text-gray-500 text-center">Loading user profile...</p>
        )}
    </div>
    );
}
