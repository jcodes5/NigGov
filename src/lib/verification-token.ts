
import { v4 as uuidv4 } from "uuid";
import prisma from "./prisma";

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    return verificationToken;
  } catch {
    return null;
  }
};

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { email: email },
    });
    return verificationToken;
  } catch {
    return null;
  }
};


export const createVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour from now

    const existingToken = await getVerificationTokenByEmail(email);

    if (existingToken) {
        await prisma.verificationToken.delete({
            where: { id: existingToken.id },
        });
    }

    const verificationToken = await prisma.verificationToken.create({
        data: {
            email: email,
            token: token,
            expires: expires,
        },
    });

    return verificationToken;
};

