import jwt from 'jsonwebtoken'

//cambiar 'secret ' por algo mas complejo como una cadena aleatoria

export const createJWT = (payload) =>{
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    return token;
};

export const verifyJWT = (token) =>{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
}