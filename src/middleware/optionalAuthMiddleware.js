import jwt from 'jsonwebtoken'

const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if (token) {
            // If token exists, verify it
            const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)
            req.userId = decoded.id
        }
        // If no token, req.userId will be undefined (guest user)
        
        next()
    } catch (error) {
        // If token is invalid, treat as guest user
        req.userId = undefined
        next()
    }
}

export default optionalAuthMiddleware