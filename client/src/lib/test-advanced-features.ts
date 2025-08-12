// Test file to verify all advanced features are working with the database
import { supabaseService } from './supabase';

const DEMO_USER_ID = '11111111-1111-1111-1111-111111111111';

export const testAdvancedFeatures = async () => {
  console.log('🧪 TESTING ADVANCED FEATURES...');

  try {
    // Test 1: Loyalty Points System
    console.log('🧪 Testing Loyalty Points...');
    const loyaltyPoints = await supabaseService.getLoyaltyPoints(DEMO_USER_ID, '33333333-3333-3333-3333-333333333333');
    console.log('✅ Loyalty Points:', loyaltyPoints);

    // Test 2: Point Transactions
    console.log('🧪 Testing Point Transactions...');
    const pointTransactions = await supabaseService.getPointTransactions(DEMO_USER_ID);
    console.log('✅ Point Transactions:', pointTransactions);

    // Test 3: Rewards System
    console.log('🧪 Testing Rewards...');
    const rewards = await supabaseService.getRewards(DEMO_USER_ID);
    console.log('✅ Rewards:', rewards);

    // Test 4: Suppliers
    console.log('🧪 Testing Suppliers...');
    const suppliers = await supabaseService.getSuppliers(DEMO_USER_ID);
    console.log('✅ Suppliers:', suppliers);

    // Test 5: Payment Methods
    console.log('🧪 Testing Payment Methods...');
    const paymentMethods = await supabaseService.getPaymentMethods(DEMO_USER_ID);
    console.log('✅ Payment Methods:', paymentMethods);

    // Test 6: Notifications
    console.log('🧪 Testing Notifications...');
    const notifications = await supabaseService.getNotifications(DEMO_USER_ID, 5);
    console.log('✅ Notifications:', notifications);

    // Test 7: User Preferences
    console.log('🧪 Testing User Preferences...');
    const smsPreference = await supabaseService.getUserPreference(DEMO_USER_ID, 'notification_sms_enabled');
    console.log('✅ SMS Preference:', smsPreference);

    console.log('🎉 ALL ADVANCED FEATURES TESTED SUCCESSFULLY!');
    return {
      loyaltyPoints,
      pointTransactions,
      rewards,
      suppliers,
      paymentMethods,
      notifications,
      smsPreference
    };

  } catch (error) {
    console.error('❌ Advanced Features Test Failed:', error);
    throw error;
  }
};

// Function to create sample loyalty points for a customer
export const createSampleLoyaltyData = async (customerId: string, purchaseAmount: number) => {
  try {
    // Calculate points (1 point per 10 taka spent)
    const pointsEarned = Math.floor(purchaseAmount / 10);
    
    // Get existing loyalty points or create new
    let loyaltyPoints = await supabaseService.getLoyaltyPoints(DEMO_USER_ID, customerId);
    
    if (!loyaltyPoints) {
      // Create new loyalty points record
      loyaltyPoints = await supabaseService.createOrUpdateLoyaltyPoints(DEMO_USER_ID, {
        user_id: DEMO_USER_ID,
        customer_id: customerId,
        total_points: pointsEarned,
        available_points: pointsEarned,
        redeemed_points: 0,
        current_tier: 'bronze',
        lifetime_spending: purchaseAmount
      });
    } else {
      // Update existing loyalty points
      loyaltyPoints = await supabaseService.createOrUpdateLoyaltyPoints(DEMO_USER_ID, {
        user_id: DEMO_USER_ID,
        customer_id: customerId,
        total_points: loyaltyPoints.total_points + pointsEarned,
        available_points: loyaltyPoints.available_points + pointsEarned,
        redeemed_points: loyaltyPoints.redeemed_points,
        current_tier: calculateTier(loyaltyPoints.lifetime_spending + purchaseAmount),
        lifetime_spending: loyaltyPoints.lifetime_spending + purchaseAmount
      });
    }

    // Create point transaction record
    await supabaseService.createPointTransaction(DEMO_USER_ID, {
      user_id: DEMO_USER_ID,
      customer_id: customerId,
      points: pointsEarned,
      transaction_type: 'earned',
      reason: 'purchase',
      description: `Purchase of ৳${purchaseAmount} - earned ${pointsEarned} points`
    });

    console.log(`✅ Created loyalty data: ${pointsEarned} points for ৳${purchaseAmount} purchase`);
    return loyaltyPoints;

  } catch (error) {
    console.error('❌ Failed to create loyalty data:', error);
    throw error;
  }
};

// Helper function to calculate customer tier based on lifetime spending
const calculateTier = (lifetimeSpending: number): string => {
  if (lifetimeSpending >= 10000) return 'platinum';
  if (lifetimeSpending >= 5000) return 'gold';
  if (lifetimeSpending >= 2000) return 'silver';
  return 'bronze';
};