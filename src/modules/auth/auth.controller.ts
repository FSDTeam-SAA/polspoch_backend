import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import config from '../../config'
import authService from './auth.service'
import { createToken } from '../../utils/tokenGenerate'
import AppError from '../../errors/AppError'

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body)
  const { refreshToken } = result

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User logged in successfully',
    data: result,
  })
})

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies
  const result = await authService.refreshToken(refreshToken)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Access token refreshed successfully',
    data: result,
  })
})

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body
  const result = await authService.forgotPassword(email)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'OTP sent to your email',
    data: result,
  })
})

const resendForgotOtpCode = catchAsync(async (req, res) => {
  const { email } = req.user!
  await authService.resendForgotOtpCode(email)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'OTP resent successfully',
    // data: result,
  })
})

const verifyOtp = catchAsync(async (req, res) => {
  const { otp } = req.body
  const { email } = req.user!
  const result = await authService.verifyOtp(email, otp)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'OTP verified successfully',
    data: result,
  })
})

const resetPassword = catchAsync(async (req, res) => {
  const { email } = req.user!
  const result = await authService.resetPassword(req.body, email)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset successfully',
    data: result,
  })
})

const changePassword = catchAsync(async (req, res) => {
  const { email } = req.user!
  const result = await authService.changePassword(req.body, email)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  })
})


const googleCallback = catchAsync(async (req, res) => {
  // Step 1: safe parse state
  let redirectUrl = "";
  try {
    if (req.query.state && (req.query.state as string).startsWith("{")) {
      const parsedState = JSON.parse(req.query.state as string);
      redirectUrl = parsedState?.redirect || "";
    } else if (typeof req.query.state === "string") {
      redirectUrl = req.query.state;
    }
  } catch (err) {
    redirectUrl = "";
  }

  // Step 2: remove leading "/"
  if (redirectUrl.startsWith("/")) {
    redirectUrl = redirectUrl.slice(1);
  }

  const user = req.user as {
    _id: string;
    email: string;
    role: string;
  };

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND);
  }

  const tokenPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    tokenPayload,
    config.JWT_SECRET as string,
    config.JWT_EXPIRES_IN as string,
  );

  const refreshToken = createToken(
    tokenPayload,
    config.refreshTokenSecret as string,
    config.jwtRefreshTokenExpiresIn as string,
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Step 3: safe redirect
  const finalRedirect = redirectUrl
    ? `${config.frontendUrl}/${redirectUrl}`
    : config.frontendUrl;
  res.redirect(finalRedirect as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "You have logged in successfully.",
    data: { accessToken },
  });
});

const authController = {
  login,
  refreshToken,
  forgotPassword,
  resendForgotOtpCode,
  verifyOtp,
  resetPassword,
  changePassword,
  googleCallback,
}

export default authController
