import { useState, useEffect } from "react";
import Cookies from "js-cookie";

type User = {
	id: string;
	name: string;
	role: string;
	createdAt?: string;
};

export function useUser() {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const storedUserId = localStorage.getItem("userId");
		if (storedUserId) {
			refreshUser(storedUserId);
		}
	}, []);

	const refreshUser = async (userId?: string) => {
		const id = userId ?? localStorage.getItem("userId");
		if (!id) return;

		try {
			const res = await fetch("/api/user", {
				headers: { "x-user-id": id },
			});
			if (!res.ok) throw new Error("Failed to fetch user");

			const data = await res.json();
			if (data?.id) {
				localStorage.setItem("userId", data.id);
				localStorage.setItem("userName", data.name);
				localStorage.setItem("role", data.role);
				Cookies.set("userId", data.id, { expires: 7 });
				setUser(data);
			}
		} catch (err) {
			console.error("❌ Failed to refresh user", err);
			setUser(null);
		}
	};

	const setUserStorage = async (name: string) => {
		const existingId = localStorage.getItem("userId");
		console.log(existingId, name);
		const res = await fetch("/api/user", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: existingId, name }),
		});

		const data = await res.json();
		if (data?.id) {
			localStorage.setItem("userId", data.id);
			localStorage.setItem("userName", data.name);
			localStorage.setItem("role", data.role);
			Cookies.set("userId", data.id, { expires: 7 });
			setUser(data);
		}
	};

	const logout = () => {
		localStorage.removeItem("userId");
		localStorage.removeItem("userName");
		localStorage.removeItem("role");
		sessionStorage.removeItem("popupShown");
		Cookies.remove("userId");
		setUser(null);
	};

	return { user, setUserStorage, logout, refreshUser };
}
