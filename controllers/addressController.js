
// ============================================
// FILE 3: addressController.js (UPDATED - Fix getUserAddresses)
// ============================================
import Address from '../models/Address.js';
import User from '../models/User.js';

// Get all addresses for a specific user (Admin only)
export const getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('Fetching addresses for userId:', userId);

    // Verify the user exists
    const user = await User.findById(userId);

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all addresses for this user
    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, createdAt: -1 });

    console.log(`Found ${addresses.length} addresses for user ${userId}`);

    res.json({ addresses });
  } catch (error) {
    console.error('Get user addresses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new address
export const createAddress = async (req, res) => {
  try {
    const {
      addressType,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      phone,
      isDefault = false
    } = req.body;

    // Validation
    if (!fullName || !addressLine1 || !city || !state || !pincode || !phone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // If this is set as default, unset all other default addresses
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user._id, isDefault: true },
        { isDefault: false }
      );
    }

    console.log('Creating address for user:', req.user._id);
    const address = await Address.create({
      userId: req.user._id,
      addressType,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country: country || 'India',
      phone,
      isDefault
    });

    console.log('Address created successfully');
    res.status(201).json(address);
  } catch (error) {
    console.error('CRITICAL Create address error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get all addresses for the authenticated user
export const getAddresses = async (req, res) => {
  try {
    console.log('Fetching addresses for user:', req.user._id);
    const addresses = await Address.find({ userId: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 });

    console.log(`Found ${addresses.length} addresses`);
    res.json({ addresses });
  } catch (error) {
    console.error('CRITICAL Get addresses error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get a specific address by ID
export const getAddressById = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Check authorization
    if (address.userId.toString() !== req.user._id.toString() &&
      !req.user.isAdmin &&
      req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(address);
  } catch (error) {
    console.error('Get address by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an address
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (address.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      addressType,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      phone,
      isDefault
    } = req.body;

    // If setting as default, unset others
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId: req.user._id, isDefault: true, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    // Update fields
    address.addressType = addressType || address.addressType;
    address.fullName = fullName || address.fullName;
    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 = addressLine2 !== undefined ? addressLine2 : address.addressLine2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.pincode = pincode || address.pincode;
    address.country = country || address.country;
    address.phone = phone || address.phone;
    if (isDefault !== undefined) address.isDefault = isDefault;

    const updatedAddress = await address.save();

    res.json(updatedAddress);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an address
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (address.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Address.deleteOne({ _id: req.params.id });

    res.json({ message: 'Address removed' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (address.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Unset all other defaults
    await Address.updateMany(
      { userId: req.user._id, isDefault: true, _id: { $ne: req.params.id } },
      { isDefault: false }
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    res.json(address);
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};