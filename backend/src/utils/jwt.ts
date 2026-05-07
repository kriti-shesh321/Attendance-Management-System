import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

type GenerateTokenPayload = {
    userId: string;
    role: Role;
};

export const generateToken = (payload: GenerateTokenPayload) => {
    return jwt.sign(
        payload,
        JWT_SECRET as string,
        {
            expiresIn:
                JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
        }
    );
};