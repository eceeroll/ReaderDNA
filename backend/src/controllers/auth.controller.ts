import bcrypt from "bcrypt";
import { prisma } from "../prisma/client.js";
import jwt, { SignOptions } from "jsonwebtoken"
import type { Request, Response } from "express";
import { loginUserSchema, registerUserSchema } from "../schemas/user.schema.js";
import { sendValidationError } from "../utils/http-responses.js";
import { isPrismaDuplicate } from "../utils/prisma-errors.js";

export async function registerUser(req: Request, res: Response): Promise<void> {
  const parsed = registerUserSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const { email, password } = parsed.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword
      },
      select: { id: true, email: true, createdAt: true }
    })

    res.status(201).json(user);
  } catch (error) {
    if(isPrismaDuplicate(error)){
      res.status(409).json({
        message: "An account with this email already exists."
      })
      return;
    }
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error"
    })
  }
}

export async function loginUser(req: Request, res: Response): Promise<void> {
  const parsed = loginUserSchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error)
    return;
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    res.status(401).json({
      message: "Invalid email or password"
    })
    return;
  }

  const isValidPassword = await bcrypt.compare(
    password,
    user.hashedPassword
  )

  if (!isValidPassword) {
    res.status(401).json({
      message: "Password is not correct"
    })
    return;
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRE_TIME = process.env.JWT_EXPIRE_TIME;
  
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  
  if (!JWT_EXPIRE_TIME) {
    throw new Error("JWT_EXPIRE_TIME is not defined");
  }
  
  const options: SignOptions = {
    expiresIn: JWT_EXPIRE_TIME as SignOptions["expiresIn"],
  };
  
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_SECRET,
    options
  );

  res.status(200).json({
    message: "Login successfull",
    token
  })
}