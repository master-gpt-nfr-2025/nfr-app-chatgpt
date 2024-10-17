type User = {
	_id: string;
	name: string;
	email: string;
	password: string;
	role: "user" | "admin";
	createdAt: Date;
	requirements: string[];
};

export type { User };
