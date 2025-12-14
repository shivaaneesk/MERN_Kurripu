import RateLimit from '../Config/upstash.js';
const rateLimiter = async (req, res, next) =>{
    try{
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const identifier = ip ? `rate_limit_${ip}` : "rate_limit_anonymous";
        const { success, pending, limit, reset, remaining } = await RateLimit.limit(identifier); 
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        if(!success){
            return res.status(429).json({message : "Too Many Requests", retryAfter: new Date(reset).toLocaleString()});
        }

        next();
    }
    catch(error){
        console.log("Error in rateLimiter middleware :", error);
        next(error);
    }
}

export default rateLimiter;