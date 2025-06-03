import { doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

export const updateDonationStats = async (userId, donationId, amount) => {
  try {
    // Update user's donation stats
    const userStatsRef = doc(db, 'userStats', userId);
    const userStatsDoc = await getDoc(userStatsRef);

    if (userStatsDoc.exists()) {
      await updateDoc(userStatsRef, {
        totalDonations: increment(amount),
        donationCount: increment(1),
        recentDonations: arrayUnion({
          id: donationId,
          amount,
          timestamp: new Date().toISOString()
        })
      });
    } else {
      await updateDoc(userStatsRef, {
        totalDonations: amount,
        donationCount: 1,
        recentDonations: [{
          id: donationId,
          amount,
          timestamp: new Date().toISOString()
        }]
      });
    }

    // Update global donation stats
    const globalStatsRef = doc(db, 'globalStats', 'donations');
    await updateDoc(globalStatsRef, {
      totalAmount: increment(amount),
      donationCount: increment(1)
    });

    return true;
  } catch (error) {
    console.error('Error updating donation stats:', error);
    return false;
  }
};

export const verifyDonationStatus = async (donationId) => {
  try {
    const donationRef = doc(db, 'donations', donationId);
    const donationDoc = await getDoc(donationRef);

    if (!donationDoc.exists()) {
      throw new Error('Donation not found');
    }

    const donationData = donationDoc.data();
    return {
      status: donationData.status,
      amount: donationData.amount,
      timestamp: donationData.timestamp,
      donorId: donationData.donorId
    };
  } catch (error) {
    console.error('Error verifying donation:', error);
    throw error;
  }
};

export const getDonationHistory = async (userId) => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    const userStatsDoc = await getDoc(userStatsRef);

    if (!userStatsDoc.exists()) {
      return {
        totalDonations: 0,
        donationCount: 0,
        recentDonations: []
      };
    }

    const stats = userStatsDoc.data();
    return {
      totalDonations: stats.totalDonations || 0,
      donationCount: stats.donationCount || 0,
      recentDonations: stats.recentDonations || []
    };
  } catch (error) {
    console.error('Error fetching donation history:', error);
    throw error;
  }
}; 