import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB - update connection string to use PolicyVault database
mongoose.connect('mongodb+srv://Adisesha:SCPrOZD9O8olTrRr@cluster0.dipykhr.mongodb.net/PolicyVault?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected to PolicyVault database'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Define Policy Schema
const policySchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  value: { type: Number, required: true },
  premium: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Pending', 'Renewal Due'], default: 'Active' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Define Nominee Schema
const nomineeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  verified: { type: Boolean, default: false },
  status: { type: String, default: 'Active' },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Policy = mongoose.model('Policy', policySchema);
const Nominee = mongoose.model('Nominee', nomineeSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token required.' });
  }

  try {
    const verified = jwt.verify(token, 'YOUR_SECRET_KEY');
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create and save new user
    const newUser = new User({ 
      name: name || email.split('@')[0], 
      email, 
      password: hashedPassword 
    });
    
    await newUser.save();
    
    return res.status(201).json({ 
      message: 'User registered successfully',
      user: { name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      'YOUR_SECRET_KEY', 
      { expiresIn: '1h' }
    );
    
    return res.json({ 
      message: 'Login successful', 
      token,
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// Forgot password endpoint
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    // We don't reveal if a user exists or not for security reasons
    // Just return success in both cases
    return res.json({ message: 'Password reset email sent if user exists' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Server error during password reset' });
  }
});

// POLICY ENDPOINTS
// Get all policies for a user
app.get('/api/policies', authenticateToken, async (req, res) => {
  try {
    const policies = await Policy.find({ userId: req.user.userId });
    return res.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    return res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

// Get a specific policy
app.get('/api/policies/:id', authenticateToken, async (req, res) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    return res.json(policy);
  } catch (error) {
    console.error('Error fetching policy:', error);
    return res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

// Create a new policy
app.post('/api/policies', authenticateToken, async (req, res) => {
  try {
    const { name, company, value, premium, startDate, endDate, status } = req.body;
    
    const newPolicy = new Policy({
      name,
      company,
      value,
      premium,
      startDate,
      endDate,
      status,
      userId: req.user.userId
    });
    
    await newPolicy.save();
    
    return res.status(201).json({
      message: 'Policy created successfully',
      policy: newPolicy
    });
  } catch (error) {
    console.error('Error creating policy:', error);
    return res.status(500).json({ error: 'Failed to create policy' });
  }
});

// Update a policy
app.put('/api/policies/:id', authenticateToken, async (req, res) => {
  try {
    const { name, company, value, premium, startDate, endDate, status } = req.body;
    
    const policy = await Policy.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    const updatedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      {
        name,
        company,
        value,
        premium,
        startDate,
        endDate,
        status
      },
      { new: true }
    );
    
    return res.json({
      message: 'Policy updated successfully',
      policy: updatedPolicy
    });
  } catch (error) {
    console.error('Error updating policy:', error);
    return res.status(500).json({ error: 'Failed to update policy' });
  }
});

// Delete a policy
app.delete('/api/policies/:id', authenticateToken, async (req, res) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    // Delete associated nominees first
    await Nominee.deleteMany({ policyId: req.params.id });
    
    // Then delete the policy
    await Policy.findByIdAndDelete(req.params.id);
    
    return res.json({ message: 'Policy and associated nominees deleted successfully' });
  } catch (error) {
    console.error('Error deleting policy:', error);
    return res.status(500).json({ error: 'Failed to delete policy' });
  }
});

// NOMINEE ENDPOINTS
// Get all nominees for a user
app.get('/api/nominees', authenticateToken, async (req, res) => {
  try {
    const nominees = await Nominee.find({ userId: req.user.userId });
    return res.json(nominees);
  } catch (error) {
    console.error('Error fetching nominees:', error);
    return res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

// Get nominees for a specific policy
app.get('/api/policies/:policyId/nominees', authenticateToken, async (req, res) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.policyId, userId: req.user.userId });
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    const nominees = await Nominee.find({ policyId: req.params.policyId });
    return res.json(nominees);
  } catch (error) {
    console.error('Error fetching nominees for policy:', error);
    return res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

// Create a new nominee
app.post('/api/nominees', authenticateToken, async (req, res) => {
  try {
    const { name, relationship, email, phone, policyId } = req.body;
    
    // Check if the policyId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      return res.status(400).json({ 
        error: 'Invalid policy ID format. Please select a valid policy.' 
      });
    }
    
    // Check if the policy exists and belongs to the user
    const policy = await Policy.findOne({ _id: policyId, userId: req.user.userId });
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found or does not belong to you' });
    }
    
    const newNominee = new Nominee({
      name,
      relationship,
      email,
      phone,
      policyId,
      userId: req.user.userId
    });
    
    await newNominee.save();
    
    return res.status(201).json({
      message: 'Nominee added successfully',
      nominee: newNominee
    });
  } catch (error) {
    console.error('Error creating nominee:', error);
    return res.status(500).json({ error: 'Failed to create nominee' });
  }
});

// Update a nominee
app.put('/api/nominees/:id', authenticateToken, async (req, res) => {
  try {
    const { name, relationship, email, phone, verified, status } = req.body;
    
    const nominee = await Nominee.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!nominee) {
      return res.status(404).json({ error: 'Nominee not found' });
    }
    
    const updatedNominee = await Nominee.findByIdAndUpdate(
      req.params.id,
      {
        name,
        relationship,
        email,
        phone,
        verified,
        status
      },
      { new: true }
    );
    
    return res.json({
      message: 'Nominee updated successfully',
      nominee: updatedNominee
    });
  } catch (error) {
    console.error('Error updating nominee:', error);
    return res.status(500).json({ error: 'Failed to update nominee' });
  }
});

// Verify a nominee
app.patch('/api/nominees/:id/verify', authenticateToken, async (req, res) => {
  try {
    const nominee = await Nominee.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!nominee) {
      return res.status(404).json({ error: 'Nominee not found' });
    }
    
    nominee.verified = true;
    await nominee.save();
    
    return res.json({
      message: 'Nominee verified successfully',
      nominee
    });
  } catch (error) {
    console.error('Error verifying nominee:', error);
    return res.status(500).json({ error: 'Failed to verify nominee' });
  }
});

// Delete a nominee
app.delete('/api/nominees/:id', authenticateToken, async (req, res) => {
  try {
    const nominee = await Nominee.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!nominee) {
      return res.status(404).json({ error: 'Nominee not found' });
    }
    
    await Nominee.findByIdAndDelete(req.params.id);
    
    return res.json({ message: 'Nominee deleted successfully' });
  } catch (error) {
    console.error('Error deleting nominee:', error);
    return res.status(500).json({ error: 'Failed to delete nominee' });
  }
});

// Analytics endpoint
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const policies = await Policy.find({ userId: req.user.userId });
    const nominees = await Nominee.find({ userId: req.user.userId });
    
    // Calculate statistics
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.status === 'Active').length;
    const totalCoverage = policies.reduce((sum, policy) => sum + policy.value, 0);
    const totalNominees = nominees.length;
    
    // Policy distribution by type (names in this case)
    const policyDistribution = {};
    policies.forEach(policy => {
      if (!policyDistribution[policy.name]) {
        policyDistribution[policy.name] = 0;
      }
      policyDistribution[policy.name]++;
    });
    
    // Policy values by type
    const policyValues = {};
    policies.forEach(policy => {
      if (!policyValues[policy.name]) {
        policyValues[policy.name] = 0;
      }
      policyValues[policy.name] += policy.value;
    });
    
    return res.json({
      summary: {
        totalPolicies,
        activePolicies,
        totalCoverage,
        totalNominees
      },
      charts: {
        policyDistribution: Object.entries(policyDistribution).map(([name, value]) => ({
          name,
          value
        })),
        policyValues: Object.entries(policyValues).map(([name, value]) => ({
          name,
          value
        }))
      }
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    return res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Add user profile endpoint
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user data without the password
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
