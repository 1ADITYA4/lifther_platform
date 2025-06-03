import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { UserVerification, VerificationDocument, DocumentType } from '../types/verification';

export const uploadVerificationDocument = async (
  userId: string,
  file: File,
  documentType: DocumentType,
  isFrontImage: boolean = true
): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `verification/${userId}/${documentType}_${isFrontImage ? 'front' : 'back'}.${fileExtension}`;
  const storageRef = ref(storage, fileName);
  
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const submitVerification = async (
  userId: string,
  documents: Omit<VerificationDocument, 'status' | 'uploadedAt'>[],
  personalInfo: UserVerification['personalInfo'],
  bankDetails: Omit<UserVerification['bankDetails'], 'verified'>
): Promise<void> => {
  const verificationData: UserVerification = {
    userId,
    status: 'pending',
    documents: documents.map(doc => ({
      ...doc,
      status: 'pending',
      uploadedAt: new Date().toISOString()
    })),
    personalInfo,
    bankDetails: {
      ...bankDetails,
      verified: false
    },
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'verifications', userId), verificationData);
  
  // Update user role to indicate verification in progress
  await updateDoc(doc(db, 'userRoles', userId), {
    verificationStatus: 'pending'
  });
};

export const getVerificationStatus = async (userId: string): Promise<UserVerification | null> => {
  const verificationDoc = await getDoc(doc(db, 'verifications', userId));
  return verificationDoc.exists() ? verificationDoc.data() as UserVerification : null;
};

export const updateBankVerification = async (
  userId: string,
  verified: boolean,
  note?: string
): Promise<void> => {
  const verificationRef = doc(db, 'verifications', userId);
  const verificationDoc = await getDoc(verificationRef);
  
  if (!verificationDoc.exists()) {
    throw new Error('Verification record not found');
  }

  const verification = verificationDoc.data() as UserVerification;
  
  await updateDoc(verificationRef, {
    'bankDetails.verified': verified,
    moderatorNotes: [...(verification.moderatorNotes || []), note].filter(Boolean),
    lastUpdated: new Date().toISOString()
  });
};

export const verifyDocument = async (
  userId: string,
  documentType: DocumentType,
  verified: boolean,
  rejectionReason?: string
): Promise<void> => {
  const verificationRef = doc(db, 'verifications', userId);
  const verificationDoc = await getDoc(verificationRef);
  
  if (!verificationDoc.exists()) {
    throw new Error('Verification record not found');
  }

  const verification = verificationDoc.data() as UserVerification;
  const documentIndex = verification.documents.findIndex(doc => doc.type === documentType);
  
  if (documentIndex === -1) {
    throw new Error('Document not found');
  }

  const updatedDocuments = [...verification.documents];
  updatedDocuments[documentIndex] = {
    ...updatedDocuments[documentIndex],
    status: verified ? 'verified' : 'rejected',
    verifiedAt: new Date().toISOString(),
    rejectionReason: rejectionReason
  };

  // Check if all documents are verified
  const allVerified = updatedDocuments.every(doc => doc.status === 'verified');
  
  await updateDoc(verificationRef, {
    documents: updatedDocuments,
    status: allVerified ? 'verified' : 'in_review',
    lastUpdated: new Date().toISOString()
  });

  if (allVerified) {
    // Update user role to verified
    await updateDoc(doc(db, 'userRoles', userId), {
      verificationStatus: 'verified'
    });
  }
}; 