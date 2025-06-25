//import calls 
import express from 'express';

//PORT FROM ENV
const PORT= "3000"
//initiallizing 
const express_api=express();

//server
express_api.listen(PORT,()=>{
    console.log(`server error at ${PORT}`);
})
