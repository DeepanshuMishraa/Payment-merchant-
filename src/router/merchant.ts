import {  Router } from "express";
import prisma from "../utils/db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";


export const merchantRouter = Router();


merchantRouter.post("/signup",async(req,res)=>{
    try{
            const {name,username,password} = req.body;
    // Validate the request body
    if(!name || !username || !password){
        return res.status(400).json({message:"Invalid request body"});
    }

    const exisitingMerchant = await prisma.merchant.findUnique({
        where:{
            username
        }
    })

    if(!exisitingMerchant){
        const newMechant = await prisma.merchant.create({
            data:{
                name,
                username,
                password
            }
        })

        return res.status(200).json({message:"Merchant created successfully",data:newMechant});
    }
    return res.status(400).json({message:"Merchant already exists"});
    }catch(err){
        return res.status(500).json({message:"Internal server error"});
    }
})

merchantRouter.post("/signin",async(req,res)=>{

    const {username,password} = req.body;

    if(!username || !password){
        return res.status(400).json({message:"Invalid request body"});
    }

    const merchant = await prisma.merchant.findFirst({
        where:{
            username,
            password
        }
    })

    if(!merchant){
        return res.status(403).json({message:"Unable to find your account"});
    }

    if(password != merchant.password){
        return res.status(403).json({message:"Invalid Password"});
    }

    const token = jwt.sign({
        id : merchant.id,
    },JWT_SECRET);

    return res.status(200).json({message:"Login successful",token});

})
