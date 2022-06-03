const express =require('express');
const router=express.Router();

//mongodb user model
const User=require('./../models/User');

//password handler
const bcrypt=require('bcrypt');

//signup
router.post('/signup',(req,res)=>{
    let {name,email,password,dateOfBirth} =req.body;
    name=name.trim();
    email=email.trim();
    password=password.trim();
    dateOfBirth=dateOfBirth.trim();

    if(name==""||email==""||password==""||dateOfBirth==""){
        res.json({
            status:"FAILED",
            message:"Empty input fields"
        });
    }else if(!/^[a-zA-Z ]*$/.test(name)){
        res.json({
            status:"FAILED",
            message:"Invalid name Entered"
        })

    }else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status:"FAILED",
            message:"Invalid email Entered"
        })
    }else if(!new Date(dateOfBirth).getTime()){
        res.json({
            status:"FAILED",
            message:"Invalid date of Birth Entered"
        })
    }else if(password.length<8){
        res.json({
            status:"FAILED",
            message:"Password Is too short"
        })
    }else{
        //checking if user exists
        User.find({email}).then(result =>{
            if(result.length){
                //a user is already there
                res.json({
                    status:"FAILED",
                    message:"User already exists"
                })
            }else{
                //try to create new

                //password handling
                const saltrounds=10;
                bcrypt.hash(password,saltrounds).then(hashedPassword =>{
                    const newUser=new User({
                        name,
                        email,
                        password:hashedPassword,
                        dateOfBirth
                    })
                    newUser.save().then(result =>{
                        res.json({
                            status:"SUCCESS",
                            message:"Sign up Successful",
                            data:result,
                        })
                    })
                    .catch(err =>{
                        res.json({
                            status:"FAILED",
                            message:"An Error occured while saving User"
                        })
                    })

                })
                .catch(err =>{
                    res.json({
                        status:"FAILED",
                        message:"Error occured while hashing password"
                    })
                })
            }

        }).catch(err=>{
            console.log(err);
            res.json({
                status:"FAILED",
                message:"An error occured while checking for existing user"
            })
        })
    }

})

//signin
router.post('/signin',(req,res)=>{
    let {email,password} =req.body;
    email=email.trim();
    password=password.trim();

    if(email=="" || password==""){
        res.json({
            status:"FAILED",
            message:"Empty credentials"
        })

    }else{
        //check if user exists
        User.find({email})
        .then(data =>{
            if(data.length){
            //user exists

            const hashedPassword = data[0].password;
            bcrypt.compare(password,hashedPassword).then(result =>{
                if(result){
                    //password match
                    res.json({
                        status:"SUCCESS",
                        message:"Sign in succesful",
                        data:data
                    })
                } else{
                    res.json({
                        status:"FAILED",
                        message:"Invalid password"
                    })

                }
            })
            .catch(err =>{
                res.json({
                    status:"FAILED",
                    message:"Problem while comapring password"
                })
            })
        }else{
            res.json({
                status:"FAILED",
                message:"Invalid credentials"
            })

            

        }
           
        })
        .catch(err=>{
            res.json({
                status:"FAILED",
                message:"Error while checking existing user"
            })
        })
    }

})

module.exports=router;
