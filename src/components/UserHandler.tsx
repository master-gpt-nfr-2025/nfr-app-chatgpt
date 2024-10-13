// components/UserHandler.tsx
"use client";
import React, { useEffect, useState } from "react";
import { UserProvider } from "../context/userContext";
import { NamePopup } from "./ui/name-popup";
import Cookies from "js-cookie";

export function UserHandler({ children }: { children: React.ReactNode }) {
	const [showPopup, setShowPopup] = useState(false);

	useEffect(() => {
		const userId = localStorage.getItem("userId");
		const popupShownThisSession = sessionStorage.getItem("popupShown");

		if (userId) {
			Cookies.set("userId", userId, { expires: 7 }); // Set cookie for server-side access
		} else if (!popupShownThisSession) {
			setShowPopup(true);
			sessionStorage.setItem("popupShown", "true");
		}
	}, []);

	const handlePopupComplete = () => {
		setShowPopup(false);
		const newUserId = localStorage.getItem("userId");
		if (newUserId) {
			Cookies.set("userId", newUserId, { expires: 7 }); // Set cookie when user is created
		}
	};

	return (
		<UserProvider>
			{showPopup && <NamePopup onComplete={handlePopupComplete} />}
			{children}
		</UserProvider>
	);
}
