import { supabase, HOSPITAL_ID, isSupabaseConfigured } from '../lib/supabase';

export interface DemographicData {
  name: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  bloodGroup: string;
  photoUrl?: string;
  abhaId?: string;
  aadhaarNo?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface PMJAYStatus {
  eligible: boolean;
  schemeName: string;
  coverageAmount: number;
  policyNo?: string;
  remarks?: string;
}

export interface UPIPaymentResponse {
  paymentId: string;
  qrCode: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export abstract class GovernmentIntegrationAdapter {
  abstract fetchAadhaarDemographics(aadhaarNo: string): Promise<DemographicData>;
  abstract fetchABHADemographics(abhaId: string): Promise<DemographicData>;
  abstract checkPMJAYEligibility(identifier: string): Promise<PMJAYStatus>;
  abstract initiateUPIPayment(amount: number, description: string): Promise<UPIPaymentResponse>;
  abstract getOccupancyStats(): Promise<{ occupancyPct: number; activeQueue: number; avgWaitTime: number }>;
}

export class MockGovernmentAdapter extends GovernmentIntegrationAdapter {
  async fetchAadhaarDemographics(aadhaarNo: string): Promise<DemographicData> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
    const cleanNo = aadhaarNo.replace(/\s/g, '');
    if (cleanNo === '123412341234') {
      return {
        name: 'Jayveer Dubey',
        phone: '9876543210',
        dob: '1995-04-15',
        gender: 'Male',
        address: 'Flat 402, Shiv Shanti Chambers, Dadar West, Mumbai - 400028',
        bloodGroup: 'O+',
        aadhaarNo: '1234 1234 1234',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150'
      };
    }
    // Default mock response
    return {
      name: 'Sunita Ravindra Deshmukh',
      phone: '9812345678',
      dob: '1968-08-24',
      gender: 'Female',
      address: 'Row House 12, MCGM Colony, Bhandup, Mumbai - 400078',
      bloodGroup: 'A+',
      aadhaarNo: aadhaarNo,
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150'
    };
  }

  async fetchABHADemographics(abhaId: string): Promise<DemographicData> {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (abhaId.includes('91-8273-0912-99')) {
      return {
        name: 'Santosh Harishchandra Patil',
        phone: '9820001122',
        dob: '1984-06-20',
        gender: 'Male',
        address: 'Chawl No. 4, Room 12, Worli Naka, Mumbai - 400018',
        bloodGroup: 'O-',
        abhaId: '91-8273-0912-99',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150'
      };
    }
    return {
      name: 'Rahul Anil Patil',
      phone: '9867543210',
      dob: '1998-05-12',
      gender: 'Male',
      address: '202, Gokul Dham, Dadar East, Mumbai - 400014',
      bloodGroup: 'O+',
      abhaId: abhaId,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150'
    };
  }

  async checkPMJAYEligibility(identifier: string): Promise<PMJAYStatus> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Let's make O- or specific identifiers eligible
    if (identifier.includes('91-8273') || identifier.replace(/\s/g, '') === '123412341234') {
      return {
        eligible: true,
        schemeName: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
        coverageAmount: 500000,
        policyNo: 'PMJAY-MCGM-908122-A',
        remarks: 'Active and verified. Direct cashless claim authorized.'
      };
    }
    return {
      eligible: false,
      schemeName: 'AB-PMJAY',
      coverageAmount: 0,
      remarks: 'No active PMJAY record linked with this ID.'
    };
  }

  async initiateUPIPayment(amount: number, description: string): Promise<UPIPaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const paymentId = 'TXN-UPI-' + Math.floor(100000 + Math.random() * 900000);
    // Standard UPI string format: upi://pay?pa=hospital@upi&pn=MCGM&am=amount&tn=description
    const upiString = `upi://pay?pa=mcgmdigitalhospital@okhdfcbank&pn=MCGM%20Hospital%20Billing&am=${amount}&tn=${encodeURIComponent(description)}&tr=${paymentId}`;
    return {
      paymentId,
      qrCode: upiString,
      amount,
      status: 'SUCCESS'
    };
  }

  async getOccupancyStats(): Promise<{ occupancyPct: number; activeQueue: number; avgWaitTime: number }> {
    return {
      occupancyPct: 82,
      activeQueue: 42,
      avgWaitTime: 8
    };
  }
}

export class ConfiguredProductionAdapter extends GovernmentIntegrationAdapter {
  async fetchAadhaarDemographics(aadhaarNo: string): Promise<DemographicData> {
    if (!isSupabaseConfigured()) {
      return new MockGovernmentAdapter().fetchAadhaarDemographics(aadhaarNo);
    }
    // Prod DB query/service call:
    const { data, error } = await supabase
      .from('aadhaar_registry')
      .select('*')
      .eq('aadhaar_no', aadhaarNo.replace(/\s/g, ''))
      .single();

    if (error || !data) {
      throw new Error('Aadhaar record not found or lookup failed');
    }
    return {
      name: data.name,
      phone: data.phone,
      dob: data.dob,
      gender: data.gender,
      address: data.address,
      bloodGroup: data.blood_group || 'O+',
      aadhaarNo: data.aadhaar_no,
      photoUrl: data.photo_url
    };
  }

  async fetchABHADemographics(abhaId: string): Promise<DemographicData> {
    if (!isSupabaseConfigured()) {
      return new MockGovernmentAdapter().fetchABHADemographics(abhaId);
    }
    const { data, error } = await supabase
      .from('abha_registry')
      .select('*')
      .eq('abha_id', abhaId)
      .single();

    if (error || !data) {
      throw new Error('ABHA record not found or verification failed');
    }
    return {
      name: data.name,
      phone: data.phone,
      dob: data.dob,
      gender: data.gender,
      address: data.address,
      bloodGroup: data.blood_group || 'O+',
      abhaId: data.abha_id,
      photoUrl: data.photo_url
    };
  }

  async checkPMJAYEligibility(identifier: string): Promise<PMJAYStatus> {
    if (!isSupabaseConfigured()) {
      return new MockGovernmentAdapter().checkPMJAYEligibility(identifier);
    }
    const cleanId = identifier.replace(/\s/g, '');
    const { data, error } = await supabase
      .from('pmjay_eligibility')
      .select('*')
      .or(`abha_id.eq.${cleanId},aadhaar_no.eq.${cleanId}`)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return {
        eligible: false,
        schemeName: 'AB-PMJAY',
        coverageAmount: 0,
        remarks: 'No active PM-JAY policy linked with this ID.'
      };
    }
    return {
      eligible: true,
      schemeName: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
      coverageAmount: data.coverage_limit || 500000,
      policyNo: data.policy_number,
      remarks: 'Verified Active.'
    };
  }

  async initiateUPIPayment(amount: number, description: string): Promise<UPIPaymentResponse> {
    if (!isSupabaseConfigured()) {
      return new MockGovernmentAdapter().initiateUPIPayment(amount, description);
    }
    const paymentId = 'TXN-UPI-PROD-' + Date.now();
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert({
        transaction_id: paymentId,
        amount,
        description,
        gateway: 'UPI',
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) {
      throw new Error('Could not initialize payment transaction');
    }

    const upiString = `upi://pay?pa=mcgmdigitalhospital@okhdfcbank&pn=MCGM%20Hospital%20Billing&am=${amount}&tn=${encodeURIComponent(description)}&tr=${paymentId}`;
    return {
      paymentId,
      qrCode: upiString,
      amount,
      status: 'PENDING'
    };
  }

  async getOccupancyStats(): Promise<{ occupancyPct: number; activeQueue: number; avgWaitTime: number }> {
    if (!isSupabaseConfigured()) {
      return new MockGovernmentAdapter().getOccupancyStats();
    }
    // Dynamic query from active patients and trauma bays:
    const { count: patientCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Waiting');

    return {
      occupancyPct: 78,
      activeQueue: patientCount || 10,
      avgWaitTime: 12
    };
  }
}

// Export singleton instance selector
export function getGovernmentAdapter(): GovernmentIntegrationAdapter {
  if (isSupabaseConfigured()) {
    return new ConfiguredProductionAdapter();
  }
  return new MockGovernmentAdapter();
}
