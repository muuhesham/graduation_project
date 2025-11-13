import jwt from 'jsonwebtoken';
import { JWT_KEY } from './../config/env.js';
import { matchPassword } from './../utils/hash.js';
import userService from './userService.js';
import mailService from './mailService.js';
import otpService from './otpService.js';

const authService = {
    async register(user) {
        const createdUser = await userService.create(user);

        if (createdUser.status === 'fail') {
            return createdUser;
        }
        
        const token = authService.generateToken(createdUser);
        
        await authService.sendOtpMail(user, true);
        
        return {
            createdUser,
            token,
        };
    },

    async login(user) {
        const exists = await userService.findByEmail(user.email);

        if (!exists) {
            return {
                status: 'fail',
                data: { error: 'Invalid credentials' },
            };
        }

        const isPasswordValid = await matchPassword(user.password, exists.password);

        if (!isPasswordValid) {
            return {
                status: 'fail',
                data: { error: 'Invalid credentials' },
            };
        }
        
        const tokenData = authService.generateToken(exists);

        return {
            token: tokenData,
        };
    },

    generateToken(user) {
        const payload = {
            userId: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        const expiresIn = 3600;
        const token = jwt.sign(payload, JWT_KEY, { expiresIn });

        return {
            accessToken: token,
            type: 'Bearer',
            expiresIn: expiresIn,
        };
    },
    
    async sendOtpMail(user, isFirstTime) {
        let userData = user;
        
        if (isFirstTime) {
            userData = await userService.findByEmail(user.email);
        }
        
        if (userData.isVerified) {
            return {
                status: 'fail',
                data: { error: 'Email already verified' }
            };
        }
        
        const otp = otpService.generateOtp();
        
        await Promise.all([
            mailService.sendOtpJob(userData, otp), 
            otpService.storeOrUpdateOtp(userData.email, otp)
        ]);
        
        return {
            status: 'success',
            data: { message: 'OTP sent successfully' }
        };
    },
    
    async verifyOtp(user, otp) {
        const existingUser = await userService.findByEmail(user.email);
        
        if (existingUser.isVerified) {
            return {
                status: 'fail',
                data: { error: 'Email already verified' }
            };
        }
        
        const isValid = await otpService.verifyOtp(user.email, otp);
        
        if (!isValid || isValid.status === 'fail') {
            return isValid;
        }

        return {
            status: 'success',
            data: { message: 'Email verified successfully' }
        };
    },
};

export default authService;
