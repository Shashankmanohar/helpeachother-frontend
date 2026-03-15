import { Icon } from '@iconify/react';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { useState, useEffect, useCallback, useRef } from 'react';

const CLOUD_NAME = 'dvjmqcith';

const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'heo_kyc');
  formData.append('cloud_name', CLOUD_NAME);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.secure_url;
};

const KYCView = () => {
  const { showToast, dispatch } = useApp();
  const api = useApi();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState('pending');
  const [kycData, setKycData] = useState<any>(null);

  // Form state
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);

  const aadhaarFrontRef = useRef<HTMLInputElement>(null);
  const aadhaarBackRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<HTMLInputElement>(null);

  const fetchKYC = useCallback(async () => {
    try {
      const data = await api.get('/api/user/kyc-data');
      setKycStatus(data.kycStatus || 'pending');
      if (data.kycData) {
        setKycData(data.kycData);
        setAccountHolder(data.kycData.accountHolder || '');
        setAccountNumber(data.kycData.accountNumber || '');
        setConfirmAccountNumber(data.kycData.accountNumber || '');
        setIfscCode(data.kycData.ifscCode || '');
        setBankName(data.kycData.bankName || '');
      }
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKYC(); }, [fetchKYC]);

  const handleFile = (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large. Max 5MB', 'error');
      return;
    }
    setter(file);
  };

  const submitKYC = async () => {
    if (!accountHolder.trim()) return showToast('Account holder name is required', 'error');
    if (!accountNumber.trim()) return showToast('Account number is required', 'error');
    if (accountNumber !== confirmAccountNumber) return showToast('Account numbers do not match', 'error');
    if (!ifscCode.trim()) return showToast('IFSC code is required', 'error');
    if (!bankName.trim()) return showToast('Bank name is required', 'error');

    setSubmitting(true);
    try {
      // Upload photos directly to Cloudinary
      let aadhaarFrontUrl = '';
      let aadhaarBackUrl = '';
      let panPhotoUrl = '';

      if (aadhaarFrontFile) {
        showToast('Uploading Aadhaar front...');
        aadhaarFrontUrl = await uploadToCloudinary(aadhaarFrontFile);
      }
      if (aadhaarBackFile) {
        showToast('Uploading Aadhaar back...');
        aadhaarBackUrl = await uploadToCloudinary(aadhaarBackFile);
      }
      if (panFile) {
        showToast('Uploading PAN...');
        panPhotoUrl = await uploadToCloudinary(panFile);
      }

      // Send only URLs to backend
      const data = await api.post('/api/user/submit-kyc', {
        accountHolder: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
        bankName: bankName.trim(),
        aadhaarFront: aadhaarFrontUrl,
        aadhaarBack: aadhaarBackUrl,
        panPhoto: panPhotoUrl,
      });
      showToast(data.message || 'KYC submitted successfully!');
      setKycStatus('approved');
      dispatch({ type: 'SET_KYC', value: true });
    } catch (err: any) {
      showToast(err?.message || 'KYC submission failed', 'error');
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon icon="svg-spinners:ring-resize" width={32} className="text-primary" />
      </div>
    );
  }

  // Already submitted
  if (kycStatus === 'approved' && kycData) {
    return (
      <div className="space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">KYC Verification</h1>
          <p className="text-sm text-muted-foreground mt-1">Your KYC has been verified.</p>
        </div>
        <div className="max-w-lg mx-auto bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-success-light flex items-center justify-center">
              <Icon icon="solar:verified-check-bold" width={24} className="text-success" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">KYC Approved</p>
              <p className="text-xs text-muted-foreground">Auto-verified on submission</p>
            </div>
          </div>
          <div className="space-y-3 border-t border-border pt-4">
            {[
              ['Account Holder', kycData.accountHolder],
              ['Account Number', kycData.accountNumber ? `****${kycData.accountNumber.slice(-4)}` : ''],
              ['IFSC Code', kycData.ifscCode],
              ['Bank Name', kycData.bankName],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground">{val}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Documents</span>
              <div className="flex gap-2">
                {kycData.hasAadhaarFront && <span className="text-[10px] bg-secondary px-2 py-0.5 rounded border border-border">Aadhaar Front ✓</span>}
                {kycData.hasAadhaarBack && <span className="text-[10px] bg-secondary px-2 py-0.5 rounded border border-border">Aadhaar Back ✓</span>}
                {kycData.hasPanPhoto && <span className="text-[10px] bg-secondary px-2 py-0.5 rounded border border-border">PAN ✓</span>}
                {!kycData.hasAadhaarFront && !kycData.hasAadhaarBack && !kycData.hasPanPhoto && (
                  <span className="text-[10px] text-muted-foreground">None uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-medium text-foreground tracking-tight">KYC Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete your KYC to enable withdrawals.</p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Bank Details (Compulsory) */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:bank-linear" width={20} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Bank Details <span className="text-destructive">*</span></h2>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Account Holder Name</label>
            <input type="text" value={accountHolder} onChange={e => setAccountHolder(e.target.value)}
              placeholder="As per bank records" className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring focus:border-ring outline-none" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Account Number</label>
            <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
              placeholder="Enter account number" className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring focus:border-ring outline-none" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Confirm Account Number</label>
            <input type="text" value={confirmAccountNumber} onChange={e => setConfirmAccountNumber(e.target.value)}
              placeholder="Re-enter account number" className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring focus:border-ring outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">IFSC Code</label>
              <input type="text" value={ifscCode} onChange={e => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234" className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring focus:border-ring outline-none uppercase" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Bank Name</label>
              <input type="text" value={bankName} onChange={e => setBankName(e.target.value)}
                placeholder="e.g. State Bank of India" className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring focus:border-ring outline-none" />
            </div>
          </div>
        </div>

        {/* Documents (Optional) */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:document-linear" width={20} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Documents <span className="text-muted-foreground font-normal">(Optional)</span></h2>
          </div>

          {/* Aadhaar Front */}
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Aadhaar Card - Front</label>
            <input ref={aadhaarFrontRef} type="file" accept="image/*" onChange={handleFile(setAadhaarFrontFile)} className="hidden" />
            <button onClick={() => aadhaarFrontRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-lg p-4 text-center transition-colors ${aadhaarFrontFile ? 'border-success/30 bg-success-light/30' : 'border-border hover:border-primary/30 hover:bg-secondary/50'}`}>
              {aadhaarFrontFile ? (
                <div className="flex items-center justify-center gap-2 text-success text-sm"><Icon icon="solar:check-circle-linear" width={18} /> {aadhaarFrontFile.name}</div>
              ) : (
                <div className="text-xs text-muted-foreground"><Icon icon="solar:upload-linear" width={20} className="mx-auto mb-1" />Click to upload (max 5MB)</div>
              )}
            </button>
          </div>

          {/* Aadhaar Back */}
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Aadhaar Card - Back</label>
            <input ref={aadhaarBackRef} type="file" accept="image/*" onChange={handleFile(setAadhaarBackFile)} className="hidden" />
            <button onClick={() => aadhaarBackRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-lg p-4 text-center transition-colors ${aadhaarBackFile ? 'border-success/30 bg-success-light/30' : 'border-border hover:border-primary/30 hover:bg-secondary/50'}`}>
              {aadhaarBackFile ? (
                <div className="flex items-center justify-center gap-2 text-success text-sm"><Icon icon="solar:check-circle-linear" width={18} /> {aadhaarBackFile.name}</div>
              ) : (
                <div className="text-xs text-muted-foreground"><Icon icon="solar:upload-linear" width={20} className="mx-auto mb-1" />Click to upload (max 5MB)</div>
              )}
            </button>
          </div>

          {/* PAN */}
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">PAN Card</label>
            <input ref={panRef} type="file" accept="image/*" onChange={handleFile(setPanFile)} className="hidden" />
            <button onClick={() => panRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-lg p-4 text-center transition-colors ${panFile ? 'border-success/30 bg-success-light/30' : 'border-border hover:border-primary/30 hover:bg-secondary/50'}`}>
              {panFile ? (
                <div className="flex items-center justify-center gap-2 text-success text-sm"><Icon icon="solar:check-circle-linear" width={18} /> {panFile.name}</div>
              ) : (
                <div className="text-xs text-muted-foreground"><Icon icon="solar:upload-linear" width={20} className="mx-auto mb-1" />Click to upload (max 5MB)</div>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button onClick={submitKYC} disabled={submitting}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm click-scale disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <><Icon icon="svg-spinners:ring-resize" width={18} /> Uploading & Submitting...</> : 'Submit KYC'}
        </button>
      </div>
    </div>
  );
};

export default KYCView;
