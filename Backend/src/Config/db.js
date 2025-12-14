import mongoose from 'mongoose';

export const ConnectMongoDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO);
        console.log("MongoDB Connected Successfully");
    }
    catch(error){
        console.log("MongoDB Connection Failed", error);
        process.exit(1);
    }
}