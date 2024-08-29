
import { JWT_SECRET } from "../config";
import prisma from "../utils/db";
import {Router}  from 'express';
import jwt from "jsonwebtoken";

export const userRouter = Router();

userRouter.post("/signup",async(req,res)=>{
        try{
            const {name,username,password} = req.body;
    // Validate the request body
    if(!name || !username || !password){
        return res.status(400).json({message:"Invalid request body"});
    }

    const exisitingUser = await prisma.user.findUnique({
        where:{
            username
        }
    })

    if(!exisitingUser){
        const newUser = await prisma.user.create({
            data:{
                name,
                username,
                password
            }
        })

        return res.status(200).json({message:"User created successfully",data:newUser});
    }
    return res.status(400).json({message:"User already exists"});
    }catch(err){
        return res.status(500).json({message:"Internal server error"});
    }
});


userRouter.post("/signin",async(req,res)=>{

    const {username,password} = req.body;

    if(!username || !password){
        return res.status(400).json({message:"Invalid request body"});
    }

    const user = await prisma.user.findFirst({
        where:{
            username,
            password
        }
    })

    if(!user){
        return res.status(403).json({message:"Unable to find your account"});
    }

    if(password != user.password){
        return res.status(403).json({message:"Invalid Password"});
    }

    const token = jwt.sign({
        id : user.id,
    },JWT_SECRET);

    return res.status(200).json({message:"Login successful",token});
})
