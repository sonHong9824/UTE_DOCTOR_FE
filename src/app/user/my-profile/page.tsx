// "use client";

// import { GetUserProfile } from "@/apis/user/user.api";
// import MedicalRecordDisplay from "@/components/medical-record/medical-record-display";
// import MedicalRecordDetail from "@/components/medical-record/medical-record-detail";
// import Navbar from "@/components/navbar";
// import { Button } from "@/components/ui/button";
// import { Card, CardTitle } from "@/components/ui/card";
// import { AccountStatusEnum } from "@/enum/account-status.enum";
// import { GenderEnum } from "@/enum/gender.enum";
// import { ResponseCode as rc } from "@/enum/response-code.enum";
// import { UserProfileDTO } from "@/types/userDTO/userProfile.dto";
// import { useEffect, useRef, useState } from "react";

// export default function EffectExample() {
//     const [user, setUser] = useState<UserProfileDTO | null>(null);
    
//     useEffect(() => {
//         const email = localStorage.getItem("email") || "";
//         if (!email) {
//         console.error("No email found in localStorage");
//         return;
//         }

//         const fetchUserProfile = async () => {
//         try {
//             const response = await GetUserProfile({email});
//             if (response?.code == rc.SUCCESS)
//             {
//                 console.log("Fetched user profile:", response.data);
//                 setUser(response.data);
//             }
            
//         } catch (err) {
//             console.error("Failed to fetch user profile:", err);
//         }
//         };

//         fetchUserProfile();
//     }, []);

//     const avatarRef = useRef<HTMLImageElement>(null);
//     const handleChangeAvatar = async () => {
//         if (!user) return;
//         const inputAvt = document.createElement("input");
//         inputAvt.type = "file";
//         inputAvt.accept = "image/*";
//         inputAvt.onchange = async () => {
//             if (inputAvt.files && inputAvt.files[0] && avatarRef.current) {
//                 const formData = new FormData();
//                 formData.append("avatar", inputAvt.files[0]);
//                 // Upload avatar to API
//                 // try {
//                 //     const res = await fetch(`${apiUrl}/api/users/${user.id}/avatar`, {
//                 //         method: "POST",
//                 //         body: formData,
//                 //     });
//                 //     const data = await res.json();
//                 //     if (res.ok) {
//                 //         setUser({ ...user, avatarUrl: data.avatarUrl });
//                 //         alert("Avatar updated successfully!");
//                 //     } else {
//                 //         alert(`Failed to update avatar: ${data.message}`);
//                 //     }
//                 // } catch (error) {
//                 //     console.error("Error uploading avatar:", error);
//                 //     alert("An error occurred while uploading the avatar.");
//                 // }
//                 avatarRef.current.src = URL.createObjectURL(inputAvt.files[0]);
//                 alert("Avatar upload functionality is just a demo, it is not going to call api.");
//             }
//         };
//         inputAvt.click();
//     }
        
// return (
//     <div className="min-h-screen mb-16">
//         <Navbar />
//         {user ? (
//             <div className="flex flex-col w-full mt-8">
//                 <div className="flex flex-row">
//                     {/* Left Section */}
//                     <div className="flex flex-col md:flex-col gap-6 w-full">
//                         {/* Avatar */}
//                         <div className="flex justify-center md:justify-center flex-1">
//                             <img
//                             ref={avatarRef}
//                             id="avatar"
//                             src={user.avatarUrl || "https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/481478694_2103522440111572_7456189524097186132_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEEFy3b28gzie5bP5XSM6n0aKFNoNCDDSFooU2g0IMNIZ3KESM90HdDaAg9zukZPQ5R2yLBG_4NCu8vStBAvErJ&_nc_ohc=B_Y0K2NwUcgQ7kNvwF1tafH&_nc_oc=AdkoeWI-Pz9cpVMhFbsoLEY40-HGOw05ZTbJ8WttO4nTmcd-pMB44YwHJ34PSr2H06k&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=5aHazM63vNLF4mj3DVjCgg&oh=00_AfbXTClllflXbySMMDXEB8y0WUX9L7OL3mlqSUQx2py7Dg&oe=68DFE750"}
//                             alt={`${user.name}'s avatar`}
//                             className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-gray-500 object-cover object-center"
//                             />
//                         </div>

//                         {/* User Info */}
//                         <div className="flex justify-center flex-1">
//                             <Card className="w-full md:w-3/4 px-6 py-4 border border-gray-300 shadow-md">
//                             <div className="flex justify-center w-full mb-4">
//                                 <CardTitle className="text-3xl font-semibold">My Information</CardTitle>
//                             </div>

//                             <div className="flex flex-col space-y-3">
//                                 {/* Name */}
//                                 <div className="flex justify-between text-lg">
//                                 <span className="underline">Name:</span>
//                                 <span>{user.name || "Unknown"}</span>
//                                 </div>

//                                 {/* Gender */}
//                                 <div className="flex justify-between text-lg">
//                                 <span className="underline">Gender:</span>
//                                 <span>{user.gender || GenderEnum.OTHER}</span>
//                                 </div>

//                                 {/* Email */}
//                                 <div className="flex justify-between text-lg">
//                                 <span className="underline">Email:</span>
//                                 <span>{user.email || "Unknown"}</span>
//                                 </div>

//                                 {/* Phone */}
//                                 <div className="flex justify-between text-lg">
//                                 <span className="underline">PhoneNumber:</span>
//                                 <span>{user.phoneNumber || "Unknown"}</span>
//                                 </div>

//                                 {/* DOB */}
//                                 <div className="flex justify-between text-lg">
//                                 <span className="underline">Date of Birth:</span>
//                                 <span>
//                                     {user.dateOfBirth
//                                     ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN", {
//                                         day: "2-digit",
//                                         month: "2-digit",
//                                         year: "numeric",
//                                         })
//                                     : "Unknown"}
//                                 </span>
//                                 </div>

//                                 {/* Address */}
//                                 <div className="flex justify-between text-lg">
//                                 <span className="underline">Address:</span>
//                                 <span>{user.address || "Unknown"}</span>
//                                 </div>

//                                 {/* Status */}
//                                 <div className="flex justify-between text-lg">
//                                 <span className="underline">Status:</span>
//                                 <span
//                                     className={`px-3 py-1 rounded-full text-sm font-semibold ${
//                                     user.status === AccountStatusEnum.ACTIVE
//                                         ? "bg-green-100 text-green-600"
//                                         : "bg-red-100 text-red-600"
//                                     }`}
//                                 >
//                                     {user.status || AccountStatusEnum.INACTIVE}
//                                 </span>
//                                 </div>

//                                 {/* Joined At */}
//                                 <div className="flex justify-between text-lg">
//                                 <span className="underline">Joined At:</span>
//                                 <span>
//                                     {user.createdAt
//                                     ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
//                                         day: "2-digit",
//                                         month: "2-digit",
//                                         year: "numeric",
//                                         })
//                                     : "Unknown"}
//                                 </span>
//                                 </div>
//                             </div>

//                             <Button
//                                 className="mt-6 self-center hover:cursor-pointer"
//                                 onClick={() => alert("Edit information")}
//                             >
//                                 Edit Information
//                             </Button>
//                             </Card>
//                         </div>
//                     </div>

                                                    
//                     {/* Right Setion */}
//                     <div className="flex w-1/2 flex-col justify-end items-center me-8"> 
//                         <MedicalRecordDisplay medicalRecord={user.medicalRecord} />
//                     </div>
                    
//                 </div>
//                 <div className="w-full flex justify-center">
//                     <MedicalRecordDetail medicalRecord={user.medicalRecord}/>
//                 </div>
                    

             
//             </div>

//         ) : (
//             <p className="text-gray-500 text-center">Loading user profile...</p>
//         )}
//     </div>
//     );
// }
"use client";
import { GetUserProfile } from "@/apis/user/user.api";
import Sidebar from "@/components/layout/side-bar";
import UserContent from "@/components/layout/user-content";
import Navbar from "@/components/navbar";
import { ResponseCode as rc } from "@/enum/response-code.enum";
import { UserProfileDTO } from "@/types/userDTO/userProfile.dto";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfileDTO | null>(null);
  const [activeTab, setActiveTab] = useState<string>("general-health");

  useEffect(() => {
    const email = localStorage.getItem("email") || "";
    if (!email) return;
    const fetchUserProfile = async () => {
      try {
        const response = await GetUserProfile({ email });
        if (response?.code === rc.SUCCESS) setUser(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserProfile();
  }, []);

  if (!user) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex mt-8">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <UserContent user={user} activeTab={activeTab} />
      </div>
    </div>
  );
}
