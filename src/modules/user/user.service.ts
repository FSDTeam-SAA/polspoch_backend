import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import config from '../../config'
import AppError from '../../errors/AppError'
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from '../../utils/cloudinary'
import sendEmail from '../../utils/sendEmail'
import { createToken } from '../../utils/tokenGenerate'
import verificationCodeTemplate from '../../utils/verificationCodeTemplate'
import { IUser } from './user.interface'
import { USER_ROLE } from './user.constant'
import { User } from './user.model'

const registerUser = async (payload: IUser) => {
  const existingUser = await User.isUserExistByEmail(payload.email)
  if (existingUser?.isVerified) {
    throw new AppError('User already exists', StatusCodes.CONFLICT)
  }

  // Password check
  if (payload.password.length < 6) {
    throw new AppError(
      'Password must be at least 6 characters long',
      StatusCodes.BAD_REQUEST,
    )
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const hashedOtp = await bcrypt.hash(otp, 10)
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000)

  let result: IUser

  // Case 2: exists but not verified → update OTP
  if (existingUser && !existingUser.isVerified) {
    result = (await User.findOneAndUpdate(
      { email: existingUser.email },
      { otp: hashedOtp, otpExpires },
      { new: true },
    )) as IUser
  } else {
    // Case 3: new user
    result = await User.create({
      ...payload,
      otp: hashedOtp,
      otpExpires,
      isVerified: false,
    })
  }

  // Send email
  const emailSendResult = await sendEmail({
    to: result.email,
    subject: 'Verify your email',
    html: verificationCodeTemplate(otp),
  })

  if (!emailSendResult.success) {
    throw new AppError(
      'Failed to send verification code. Please try again.',
      StatusCodes.INTERNAL_SERVER_ERROR,
    )
  }

  // JWT payload
  const JwtToken = {
    userId: result._id,
    email: result.email,
    role: result.role,
  }

  const accessToken = createToken(
    JwtToken,
    config.JWT_SECRET as string,
    config.JWT_EXPIRES_IN as string,
  )

  return {
    accessToken,
    user: {
      _id: result._id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
    },
  }
}

const verifyEmail = async (email: string, payload: string) => {
  const { otp }: any = payload
  if (!otp) throw new Error('OTP is required')

  const existingUser = await User.findOne({ email })
  if (!existingUser) throw new AppError('User not found', StatusCodes.NOT_FOUND)

  if (!existingUser.otp || !existingUser.otpExpires) {
    throw new AppError('OTP not requested or expired', StatusCodes.BAD_REQUEST)
  }

  if (existingUser.otpExpires < new Date()) {
    throw new AppError('OTP has expired', StatusCodes.BAD_REQUEST)
  }

  if (existingUser.isVerified === true) {
    throw new AppError('User already verified', StatusCodes.CONFLICT)
  }

  const isOtpMatched = await bcrypt.compare(otp.toString(), existingUser.otp)
  if (!isOtpMatched) throw new AppError('Invalid OTP', StatusCodes.BAD_REQUEST)

  const result = await User.findOneAndUpdate(
    { email },
    {
      isVerified: true,
      $unset: { otp: '', otpExpires: '' },
    },
    { new: true },
  ).select('username email role')
  return result
}

const resendOtpCode = async (email: string) => {
  const existingUser = await User.findOne({ email })
  if (!existingUser) throw new AppError('User not found', StatusCodes.NOT_FOUND)

  if (existingUser.isVerified === true) {
    throw new AppError('User already verified', StatusCodes.CONFLICT)
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const hashedOtp = await bcrypt.hash(otp, 10)
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000)

  const result = await User.findOneAndUpdate(
    { email },
    {
      otp: hashedOtp,
      otpExpires,
    },
    { new: true },
  ).select('username email role')

  const emailSendResult = await sendEmail({
    to: existingUser.email,
    subject: 'Verify your email',
    html: verificationCodeTemplate(otp),
  })

  if (!emailSendResult.success) {
    throw new AppError(
      'Failed to resend verification code. Please try again.',
      StatusCodes.INTERNAL_SERVER_ERROR,
    )
  }

  return result
}

const getAllUsers = async () => {
  const result = await User.find({})
    .select('firstName lastName email role isVerified createdAt')
    .sort({ createdAt: -1 })

  return result
}

const updateUserRole = async (userId: string, role: string) => {
  const allowedRoles = [USER_ROLE.ADMIN, USER_ROLE.USER]
  if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
    throw new AppError('Invalid role', StatusCodes.BAD_REQUEST)
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true },
  ).select('firstName lastName email role isVerified')

  if (!updatedUser) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND)
  }

  return updatedUser
}

const getMyProfile = async (email: string) => {
  const existingUser = await User.findOne({ email, isVerified: true })
  if (!existingUser) throw new AppError('User not found', StatusCodes.NOT_FOUND)

  const result = await User.findOne({ email }).select(
    '-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires',
  )

  return result
}

const updateUserProfile = async (payload: any, email: string, file: any) => {
  const user = await User.findOne({ email, isVerified: true }).select('image')
  if (!user) throw new AppError('User not found', StatusCodes.NOT_FOUND)

  // eslint-disable-next-line prefer-const
  let updateData: any = { ...payload }
  let oldImagePublicId: string | undefined

  if (file) {
    const uploadResult = await uploadToCloudinary(file.path, 'users')
    oldImagePublicId = user.image?.public_id

    updateData.image = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    }
  }

  const result = await User.findOneAndUpdate({ email }, updateData, {
    new: true,
  })

  if (oldImagePublicId) {
    await deleteFromCloudinary(oldImagePublicId)
  }

  return result
}

const updateUserProfileImage = async (email: string, file: any) => {
  const user = await User.findOne({ email, isVerified: true }).select('image')
  if (!user) throw new AppError('User not found', StatusCodes.NOT_FOUND)

  let oldImagePublicId: string | undefined

  if (file) {
    const uploadResult = await uploadToCloudinary(file.path, 'users')
    oldImagePublicId = user.image?.public_id

    const updateData = {
      image: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    }

    const result = await User.findOneAndUpdate({ email }, updateData, {
      new: true,
    }).select(
      '-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires',
    )

    if (oldImagePublicId) {
      await deleteFromCloudinary(oldImagePublicId)
    }

    return result
  } else {
    throw new AppError('No file provided', StatusCodes.BAD_REQUEST)
  }
}

const userService = {
  registerUser,
  verifyEmail,
  resendOtpCode,
  getAllUsers,
  updateUserRole,
  getMyProfile,
  updateUserProfile,
  updateUserProfileImage,
}

export default userService
