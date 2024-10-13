import React, { createContext, useContext } from "react";
import { useUser } from "@/hooks/useUser";

const UserContext = createContext<ReturnType<typeof useUser> | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
	const userState = useUser();

	return <UserContext.Provider value={userState}>{children}</UserContext.Provider>;
}

export function useUserContext() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUserContext must be used within a UserProvider");
	}
	return context;
}
