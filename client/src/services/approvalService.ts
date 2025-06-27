import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export interface ApprovalStats {
  totalApproved: number;
  readyForTraining: boolean;
  lastTrainingDate?: Date;
}

/**
 * Mark a Soul Hug as approved for training data
 */
export async function approveSoulHug(hugId: string): Promise<void> {
  try {
    const hugRef = doc(db, 'soulHugs', hugId);
    await updateDoc(hugRef, {
      approved: true,
      approvedAt: new Date(),
      approvedBy: 'admin' // You could track which admin approved it
    });
  } catch (error) {
    console.error('Error approving Soul Hug:', error);
    throw error;
  }
}

/**
 * Remove approval from a Soul Hug
 */
export async function unapproveSoulHug(hugId: string): Promise<void> {
  try {
    const hugRef = doc(db, 'soulHugs', hugId);
    await updateDoc(hugRef, {
      approved: false,
      approvedAt: null,
      approvedBy: null
    });
  } catch (error) {
    console.error('Error unapproving Soul Hug:', error);
    throw error;
  }
}

/**
 * Check if a Soul Hug is approved
 */
export async function isSoulHugApproved(hugId: string): Promise<boolean> {
  try {
    const hugRef = doc(db, 'soulHugs', hugId);
    const hugDoc = await getDoc(hugRef);
    
    if (!hugDoc.exists()) {
      return false;
    }
    
    return hugDoc.data().approved === true;
  } catch (error) {
    console.error('Error checking approval status:', error);
    return false;
  }
}

/**
 * Check if user can approve Soul Hugs (admin only)
 */
export function canApproveHugs(): boolean {
  // This should match your admin email check logic
  const adminEmails = [
    'thecustomsoundarchitect@gmail.com',
    'admin@soullift.com'
  ];
  
  // You'd implement this based on your auth system
  // For now, returning true for development
  return true;
}

/**
 * Get approval statistics for training readiness
 */
export async function getApprovalStats(): Promise<ApprovalStats> {
  try {
    // This would query your approved Soul Hugs
    // For now, returning mock data for development
    return {
      totalApproved: 0,
      readyForTraining: false,
      lastTrainingDate: undefined
    };
  } catch (error) {
    console.error('Error getting approval stats:', error);
    return {
      totalApproved: 0,
      readyForTraining: false
    };
  }
}