"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfileDTO } from "@/dto/userProfile.dto";
import { AccountStatusEnum } from "@/enum/account-status-enum";
import { GenderEnum } from "@/enum/gender-enum";
import { useEffect, useRef, useState } from "react";

export default function EffectExample() {
    const [user, setUser] = useState<UserProfileDTO | null>(null);
    const apiUrl = process.env.BASE_API || "http://localhost:3001";
    useEffect(() => {
        // Get user profile from API
        const email = localStorage.getItem("email") || "";
        if (!email) {
            console.error("No email found in localStorage");
            return;
        }
        fetch(`${apiUrl}/api/users/by-email?email=${encodeURIComponent(email)}`)
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
        <Navbar />
        {user ? (
        <div className="flex">
            {/* User avt */}
            <div className="w-1/2 min-h-screen p-4 flex flex-col justify-center items-end pb-48">
                <img 
                    ref={avatarRef}
                    id="avatar"
                    src={user.avatarUrl}
                    alt={`${user.name}'s avatar`}
                    className="w-64 h-64 rounded-full mx-auto
                       object-cover object-center border-4 border-gray-500"
                /> 
                {/* <div>
                    <button className="mt-8 text-gray-500 text-3xl italic
                     underline hover:cursor-pointer"
                     onClick={handleChangeAvatar}>Change my avatar</button>
                </div> */}
            </div>
            {/* User info */}
            
            <div className="w-1/2 p-16 flex flex-col items-start justify-center mb-32">
             <Card className="px-6 py-3 border border-gray-300 shadow-md w-3/4">
                <div className="flex flex-row justify-center w-full">
                    <CardTitle className="font-semibold text-3xl">My Information</CardTitle>
                </div>
                <div className="flex flex-col">
                    {/* Name */}
                    <div className="flex flex-row mt-4">
                        <div className="underline text-lg">Name:</div>
                        <div className="ml-6 text-lg">{user.name || "Unknown"}</div>
                    </div>
                     {/* Gender */}
                    <div className="flex flex-row mt-4">
                        <div className="underline text-lg">Gender:</div>
                        <div className="ml-6 text-lg">{user.gender || GenderEnum.OTHER}</div>
                    </div>
                      {/* Email */}
                    <div className="flex flex-row mt-4">
                        <div className="underline text-lg">Email:</div>
                        <div className="ml-6 text-lg">{user.email || "Unknown"}</div>
                    </div>
                       {/* Phone */}
                    <div className="flex flex-row mt-4">
                        <div className="underline text-lg">PhoneNumber:</div>
                        <div className="ml-6 text-lg">{user.phoneNumber || "Unknown"}</div>
                    </div>
                   {/* dob */}
                    <div className="flex flex-row mt-4">
                        <div className="underline text-lg">Date of Birth:</div>
                        <div className="ml-6 text-lg">
                            {user.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                })
                            : "Unknown"}
                        </div>
                    </div>
                       {/* Adddress */}
                    <div className="flex flex-row mt-4">
                        <div className="underline text-lg">Address:</div>
                        <div className="ml-6 text-lg">{user.address || "Unknown"}</div>
                    </div>
                       {/* Account Status */}
                    <div className="flex flex-row mt-4">
                        <div className="underline text-lg">Status:</div>
                        <div className="ml-6 text-lg">
                            <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                user.status === AccountStatusEnum.ACTIVE
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                            >
                            {user.status || AccountStatusEnum.INACTIVE}
                            </span>
                        </div>
                    </div>

                    {/* Created At */}
                    <div className="flex flex-row mt-4">
                        <div className="underline text-lg">Joined At:</div>
                        <div className="ml-6 text-lg">
                            {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                })
                            : "Unknown"}
                        </div>
                    </div>
                </div>
                <Button
                className="mt-6 self-center hover:cursor-pointer"
                onClick={() => alert("Edit information")}>
                    Edit Information
                </Button>

            </Card>
            </div>

        </div>
        
        ) : (
            <p className="text-gray-500 text-center">Loading user profile...</p>
        )}
    </div>
    );
}
