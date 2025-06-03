export type VerificationStatus = 'pending' | 'in_review' | 'verified' | 'rejected';

export type DocumentType = 'aadhar' | 'pan' | 'voter_id' | 'driving_license';

export interface VerificationDocument {
  type: DocumentType;
  documentNumber: string;
  frontImageUrl: string;
  backImageUrl?: string;
  selfieWithDocument?: string;
  uploadedAt: string;
  verifiedAt?: string;
  status: VerificationStatus;
  rejectionReason?: string;
}

export interface UserVerification {
  userId: string;
  status: VerificationStatus;
  documents: VerificationDocument[];
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    phone: string;
  };
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
    verified: boolean;
  };
  moderatorNotes?: string[];
  lastUpdated: string;
  createdAt: string;
} 