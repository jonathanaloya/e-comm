import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const generateAccessToken = async(userId) => {
    const token = await jwt.sign({ id : userId},
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn : '24h'}
    )

    return token
}

export default generateAccessToken
