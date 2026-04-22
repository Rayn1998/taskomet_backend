import { DatabaseError } from "pg";
import { EArtistRoles } from "@/server/constants";

export const isDatabaseError = (err: unknown): err is DatabaseError => {
	return err instanceof DatabaseError;
};

export const isArtistRole = (role: unknown): role is EArtistRoles => {
	return (
		typeof role === "number" &&
		Object.values(EArtistRoles)
			.filter((val) => typeof val === "number")
			.includes(role)
	);
};
