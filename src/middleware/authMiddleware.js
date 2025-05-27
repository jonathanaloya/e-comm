import jwt from 'jsonwebtoken'
const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req?.headers?.authorization?.split(' ')[1]
    
    if(!token){
      return res.status(401).json({
        message : 'Unauthorized. Provide access token',
      })
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)

    if(!decoded){ 
      return res.status(401).json({
        message : 'Unauthorized. Invalid access token',
        error : true,
        success: false
      })
    }

    req.userId = decoded.id

    next()

  } catch (error) {
    return res.status(500).json({
      message : error.message || error,
      error : true,
      success: false
    })
  }
};

export default authMiddleware