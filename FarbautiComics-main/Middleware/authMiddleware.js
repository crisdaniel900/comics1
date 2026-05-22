import { UnauthenticatedError, UnauthorizedError } from '../Errors/customErrors.js'
import { verifyJWT } from '../Utils/tokenUtils.js'

export const authenticateUser = (req, res, next) => {
    const {token} = req.cookies;
    if(!token) return next(new UnauthenticatedError('authentication invalid'));
    try {
        const {userId, role} = verifyJWT(token);
        req.user = { userId, role };
        next();
    } catch (error) {
        return next(new UnauthenticatedError('Unexpected authentication invalid error'));
    }
}

// Middleware para detectar si el usuario inicio sesion
export const fetchUser = (req, res, next) => {
    const{token} = req.cookies
    if(!token) {
        return res.status(401).json({ message: 'No User'})
    }

    try {

        const decodedToken = verifyJWT(token);
        const userRole = decodedToken.role

        if(userRole === 'admin'){
            return res.status(200).json({ message: 'Admin'})
        }
        else{
            return res.status(200).json({message: 'User'})
        }

    }catch(error){
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

}

export const authorizePermissions = (...roles) => {

    return (req, res, next) =>{
        if(!roles.includes(req.user.role)){
            throw new UnauthorizedError('unauthorized to access this route')
        }
        next();
    }
}
