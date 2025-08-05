import { Router } from 'express';
import { stripe, STRIPE_CONFIG } from '../config/stripe.js';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

// Debug route to test if payments routes are working
router.get('/debug', (req, res) => {
  console.log('Payments debug route hit!');
  res.json({ message: 'Payments routes are working!' });
});

// Debug route with auth to test middleware
router.get('/debug-auth', requireAuth, (req: AuthRequest, res) => {
  console.log('Payments debug-auth route hit!');
  res.json({ message: 'Auth is working!', user: req.user });
});

// Debug route to test JWT manually without middleware
router.get('/debug-jwt', (req, res) => {
  console.log('Debug JWT route hit!');
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log('Token:', token);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
  }
  
  res.json({ message: 'JWT debug info logged to console' });
});

// POST /payments - Create payment intent
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    console.log('POST /payments route hit!');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    
    // Guard clause for authentication
    if (!req.user) {
      console.log('No user found, returning 401');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { amount, description, type = 'one-time' } = req.body;

    // Validation
    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Amount must be at least $0.50' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Payment description is required' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: STRIPE_CONFIG.currency,
      description,
      metadata: {
        userId: req.user.userId.toString(),
        userEmail: req.user.email,
        paymentType: type,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(201).json({
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      description: paymentIntent.description,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ 
      error: 'Unable to create payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /payments/:id - Get specific payment
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    // Guard clause for authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    
    // Check if this payment belongs to the requesting user
    if (paymentIntent.metadata?.userId !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      description: paymentIntent.description,
      paymentType: paymentIntent.metadata?.paymentType,
      created: paymentIntent.created,
    });
  } catch (error) {
    console.error('Payment retrieval error:', error);
    res.status(500).json({ 
      error: 'Unable to retrieve payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /payments - List user's payments
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    // Guard clause for authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { limit = 10, starting_after } = req.query;

    // Get all payments from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: Number(limit),
      starting_after: starting_after as string,
    });

    // Filter to only this user's payments  
    const userPayments = paymentIntents.data.filter(
      payment => payment.metadata?.userId === req.user?.userId.toString()
    );

    // Transform Stripe payment objects to our API format
    const transformedPayments = userPayments.map(payment => ({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      description: payment.description,
      paymentType: payment.metadata?.paymentType,
      created: payment.created,
    }));

    res.json({
      payments: transformedPayments,
      hasMore: paymentIntents.has_more,
    });
  } catch (error) {
    console.error('Payment list error:', error);
    res.status(500).json({ 
      error: 'Unable to retrieve payments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;