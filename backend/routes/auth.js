import { Router } from 'express';
import { authRateLimit } from '../middleware/rateLimit.js';
import { signUpParent } from '../services/authService.js';

const router = Router();

router.post('/signup', authRateLimit, async (req, res) => {
  try {
    const result = await signUpParent(req.body || {});

    if (!result.ok) {
      const status =
        result.code === 'VALIDATION_ERROR' ? 400 :
        result.code === 'INVALID_INVITATION' ? 403 :
        result.code === 'EMAIL_TAKEN' ? 409 :
        result.code === 'AUTH_UNAVAILABLE' ? 503 : 500;

      return res.status(status).json({
        success: false,
        error: { code: result.code, message: result.message }
      });
    }

    return res.status(201).json({
      success: true,
      data: { userId: result.userId, email: result.email }
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SIGNUP_FAILED', message: err.message || 'Could not create account. Please try again.' }
    });
  }
});

export default router;
