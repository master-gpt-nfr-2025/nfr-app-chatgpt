const CONFIG = {
	MONGO: {
		connectionString: `mongodb+srv://${process.env.DB_login}:${process.env.DB_password}@${process.env.DB_host}/NfrDB?retryWrites=true&w=majority&appName=Cluster0`,
	},
};

const GOOGLE = {
	clientId: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
};

export { CONFIG, GOOGLE };
