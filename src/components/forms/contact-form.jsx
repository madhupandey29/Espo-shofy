'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  useCreateContactDraftMutation,
  useUpdateContactDraftMutation,
  useSubmitContactFormMutation,
  useGetContactDraftQuery,
  useGetOfficeInfoQuery,
} from '@/redux/features/contactApi';

const DEFAULT_DRAFT_KEY = 'contact_draft_id';
const DEFAULT_STORAGE_KEY = 'fabricpro_contact_form';

function mapToBackend(f) {
  return {
    companyName: f.companyName,
    contactPerson: f.contactPerson,
    email: f.email,
    phoneNumber: f.phone,
    businessType: f.businessType,
    annualFabricVolume: f.annualVolume,
    primaryMarkets: f.primaryMarkets,
    fabricTypesOfInterest: f.fabricTypes,
    specificationsRequirements: f.specifications,
    timeline: f.timeline,
    additionalMessage: f.message,
  };
}

const EMPTY = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  businessType: '',
  annualVolume: '',
  primaryMarkets: '',
  fabricTypes: [],
  specifications: '',
  timeline: '',
  message: '',
};

export default function ContactForm({ onSuccess, draftKey = DEFAULT_DRAFT_KEY, storageKey = DEFAULT_STORAGE_KEY }) {
  // Initial load
  const initialSnapshot = (() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [formData, setFormData] = useState(() => ({
    ...EMPTY,
    ...(initialSnapshot?.formData ?? {}),
  }));
  const [currentStep, setCurrentStep] = useState(() => {
    const s = Number(initialSnapshot?.currentStep);
    return s >= 1 && s <= 3 ? s : 1;
  });
  const [draftId, setDraftId] = useState(() => initialSnapshot?.draftId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const saveTimer = useRef(null);
  const isSavingRef = useRef(false);
  const honeypotRef = useRef(null);
  const hasHydrated = useRef(false);

  const [createDraft] = useCreateContactDraftMutation();
  const [updateDraft] = useUpdateContactDraftMutation();
  const [submitForm, { isLoading: isSubmittingMutation, error: submitError }] = useSubmitContactFormMutation();
  const { data: hydrated } = useGetContactDraftQuery(draftId, { skip: !draftId });
  useGetOfficeInfoQuery(undefined, { skip: false });

  // Debug Redux state
  console.log('Redux mutation state:', {
    isSubmittingMutation,
    submitError,
    isSubmitting
  });

  useEffect(() => {
    if (hydrated?.data && !hasHydrated.current) {
      const d = hydrated.data;
      setFormData({
        companyName: d.companyName ?? '',
        contactPerson: d.contactPerson ?? '',
        email: d.email ?? '',
        phone: d.phoneNumber ?? '',
        businessType: d.businessType ?? '',
        annualVolume: d.annualFabricVolume ?? '',
        primaryMarkets: d.primaryMarkets ?? '',
        fabricTypes: Array.isArray(d.fabricTypesOfInterest) ? d.fabricTypesOfInterest : [],
        specifications: d.specificationsRequirements ?? '',
        timeline: d.timeline ?? '',
        message: d.additionalMessage ?? '',
      });
      hasHydrated.current = true;
    }
  }, [hydrated]);

  const persistDraft = useCallback(async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      const payload = mapToBackend(formData);
      let newId = draftId;

      if (!draftId) {
        const res = await createDraft(payload).unwrap();
        newId = res?.data?._id;
        if (newId) {
          setDraftId(newId);
          localStorage.setItem(draftKey, newId);
        }
      } else {
        await updateDraft({ id: draftId, payload }).unwrap();
      }

      localStorage.setItem(storageKey, JSON.stringify({
        formData,
        currentStep,
        draftId: newId,
      }));
    } catch (e) {
      console.error('Autosave error:', e);
    } finally {
      isSavingRef.current = false;
    }
  }, [formData, draftId, createDraft, updateDraft, draftKey, storageKey, currentStep]);

  const scheduleAutosave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void persistDraft(), 600);
  }, [persistDraft]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    
    // Clear validation errors when user starts typing
    if (validationErrors[name] || validationErrors.contact) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        // Clear contact error if user provides email or phone
        if ((name === 'email' || name === 'phone') && value.trim()) {
          delete newErrors.contact;
        }
        return newErrors;
      });
    }
    
    scheduleAutosave();
  };

  const toggleFabric = (fabric) => {
    setFormData((prev) => {
      const exists = prev.fabricTypes.includes(fabric);
      const next = exists ? prev.fabricTypes.filter((x) => x !== fabric) : [...prev.fabricTypes, fabric];
      return { ...prev, fabricTypes: next };
    });
    scheduleAutosave();
  };

  // Validation functions
  const validateStep1 = () => {
    const errors = {};
    
    // Require either email or phone
    if (!formData.email && !formData.phone) {
      errors.contact = 'Please provide either an email address or phone number';
    }
    
    // Basic email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Basic phone validation if provided
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    return errors;
  };

  const goNext = () => {
    if (currentStep === 1) {
      const errors = validateStep1();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      setValidationErrors({});
    }
    setCurrentStep((s) => Math.min(3, s + 1));
  };
  
  const goBack = () => {
    setValidationErrors({});
    setCurrentStep((s) => Math.max(1, s - 1));
  };
  
  const goToStep = (step) => {
    if (step < 1 || step > 3) return;
    if (step > currentStep && currentStep === 1) {
      // Validate step 1 before allowing navigation
      const errors = validateStep1();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
    }
    setValidationErrors({});
    setCurrentStep(step);
  };

  const resetAll = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(draftKey);
    setFormData({ ...EMPTY });
    setCurrentStep(1);
    setDraftId('');
    hasHydrated.current = false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypotRef.current?.value) {
      alert('Spam detected');
      return;
    }

    // Final validation
    const errors = validateStep1();
    console.log('Final validation errors:', errors);
    console.log('Current form data:', formData);
    
    if (Object.keys(errors).length > 0) {
      console.log('Validation failed, not submitting');
      setValidationErrors(errors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    console.log('Validation passed, proceeding with submission');

    setIsSubmitting(true);
    try {
      clearTimeout(saveTimer.current);
      
      // Submit the final form
      const payload = mapToBackend(formData);
      console.log('Form data before mapping:', formData);
      console.log('Payload being submitted:', payload);
      console.log('API endpoint will be called with:', {
        url: '/contacts',
        method: 'POST',
        body: { ...payload, isSubmitted: true }
      });
      
      // Try the Redux mutation first
      try {
        const result = await submitForm(payload).unwrap();
        console.log('Form submitted successfully via Redux:', result);
      } catch (reduxError) {
        console.log('Redux mutation failed, trying direct API call:', reduxError);
        
        // Fallback to direct API call
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.amrita-fashions.com/shopy';
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        
        console.log('Direct API call details:', {
          apiBaseUrl,
          hasApiKey: !!apiKey,
          payload: { ...payload, isSubmitted: true }
        });
        
        const response = await fetch(`${apiBaseUrl}/contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey && { 'x-api-key': apiKey })
          },
          body: JSON.stringify({ ...payload, isSubmitted: true })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Form submitted successfully via direct API:', result);
      }
      
      resetAll();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Submission error:', err);
      console.error('Error details:', {
        status: err?.status,
        data: err?.data,
        message: err?.message,
        originalStatus: err?.originalStatus
      });
      
      // Show user-friendly error message
      let errorMessage = 'Failed to submit form. Please try again.';
      
      if (err?.status === 404) {
        errorMessage = 'Submission endpoint not found. Please contact support.';
      } else if (err?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
      
      // If submission fails, try to save as draft at least
      try {
        console.log('Attempting to save as draft after submission failure...');
        await persistDraft();
        console.log('Form saved as draft after submission failure');
        alert('Form submission failed, but your data has been saved as a draft.');
      } catch (draftError) {
        console.error('Failed to save draft:', draftError);
        alert('Form submission failed and could not save as draft. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inline styles for compact design
  const progressBarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    position: 'relative',
    padding: '0 20px'
  };

  const circleStyle = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#FFFFFF',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#E6ECF2',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2,
    fontWeight: '600',
    fontSize: '12px',
    transition: 'all .3s ease',
    position: 'relative'
  };

  const activeCircleStyle = {
    ...circleStyle,
    background: '#2C4C97',
    borderColor: '#2C4C97',
    color: '#fff',
    transform: 'scale(1.1)',
    boxShadow: '0 4px 12px rgba(44,76,151,.3)'
  };

  const lineStyle = {
    position: 'absolute',
    top: '50%',
    left: '20%',
    right: '20%',
    height: '2px',
    background: '#E6ECF2',
    transform: 'translateY(-50%)',
    zIndex: 1,
    borderRadius: '2px'
  };

  const stepLabelStyle = {
    fontSize: '12px',
    color: '#475569',
    marginBottom: '16px',
    textAlign: 'center',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const stepContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0F2235',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  };

  const inputStyle = {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#E6ECF2',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '14px',
    color: '#0F2235',
    background: '#FFFFFF',
    transition: 'all .3s ease',
    fontFamily: 'inherit'
  };

  const inputErrorStyle = {
    ...inputStyle,
    borderColor: '#dc2626',
    boxShadow: '0 0 0 3px rgba(220,38,38,.1)'
  };

  const errorTextStyle = {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
    fontWeight: '500'
  };

  const validationMessageStyle = {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '8px 12px',
    color: '#dc2626',
    fontSize: '12px',
    marginBottom: '12px',
    fontWeight: '500'
  };

  const inputFocusStyle = {
    ...inputStyle,
    borderColor: '#2C4C97',
    boxShadow: '0 0 0 3px rgba(44,76,151,.1)',
    outline: 'none'
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: '70px'
  };

  const pillGroupStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '6px'
  };

  const pillStyle = {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#E6ECF2',
    borderRadius: '16px',
    padding: '6px 12px',
    background: '#FFFFFF',
    color: '#0F2235',
    cursor: 'pointer',
    transition: 'all .3s ease',
    fontWeight: '500',
    fontSize: '12px'
  };

  const activePillStyle = {
    ...pillStyle,
    background: '#2C4C97',
    color: '#fff',
    borderColor: '#2C4C97',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(44,76,151,.3)'
  };

  const actionsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginTop: '20px'
  };

  const btnStyle = {
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    transition: 'all .3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    minWidth: '90px'
  };

  const primaryBtnStyle = {
    ...btnStyle,
    background: '#2C4C97',
    color: '#fff',
    borderColor: '#2C4C97'
  };

  const ghostBtnStyle = {
    ...btnStyle,
    background: 'transparent',
    color: '#0F2235',
    borderColor: '#E6ECF2'
  };

  if (showSuccess) {
    return (
      <div style={{width: '100%'}}>
        <div style={{
          textAlign: 'center',
          padding: '40px 24px',
          background: '#FFFFFF',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: '#E6ECF2',
          borderRadius: '12px',
          boxShadow: '0 10px 24px rgba(15,34,53,.08)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>✓</div>
          <h3 style={{color: '#0F2235', fontSize: '20px', fontWeight: '700', margin: '0 0 6px'}}>Request Submitted</h3>
          <p style={{color: '#475569', margin: '0', fontSize: '14px'}}>Thank you! We'll contact you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{width: '100%'}}>
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-6px); }
          40%, 60% { transform: translateX(6px); }
        }
      `}</style>
      <div style={{background: 'transparent', borderWidth: '0', borderStyle: 'none', borderColor: 'transparent', borderRadius: '0', maxWidth: '100%', width: '100%', padding: '0', boxShadow: 'none'}}>
        <div style={progressBarStyle}>
          <div style={currentStep >= 1 ? activeCircleStyle : circleStyle} onClick={() => goToStep(1)}>1</div>
          <div style={lineStyle}></div>
          <div style={currentStep >= 2 ? activeCircleStyle : circleStyle} onClick={() => goToStep(2)}>2</div>
          <div style={lineStyle}></div>
          <div style={currentStep >= 3 ? activeCircleStyle : circleStyle} onClick={() => goToStep(3)}>3</div>
        </div>
        <div style={stepLabelStyle}>Step {currentStep} of 3</div>
        <form onSubmit={handleSubmit} noValidate style={shake ? {animation: 'shake 0.5s ease-in-out'} : {}}>
          <div style={{ visibility: 'hidden', height: 0 }}>
            <input ref={honeypotRef} name="hp" type="text" autoComplete="off" />
          </div>

          {currentStep === 1 && (
            <div style={stepContentStyle}>
              {validationErrors.contact && (
                <div style={validationMessageStyle}>
                  {validationErrors.contact}
                </div>
              )}
              
              <InputField
                label="Company Name"
                name="companyName"
                placeholder="Your company name"
                value={formData.companyName}
                onChange={handleInputChange}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
                inputGroupStyle={inputGroupStyle}
              />
              <InputField
                label="Contact Person"
                name="contactPerson"
                placeholder="Your full name"
                value={formData.contactPerson}
                onChange={handleInputChange}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
                inputGroupStyle={inputGroupStyle}
              />
              <InputField
                label="Email Address *"
                name="email"
                type="email"
                placeholder="your@company.com"
                value={formData.email}
                onChange={handleInputChange}
                inputStyle={validationErrors.email ? inputErrorStyle : inputStyle}
                labelStyle={labelStyle}
                inputGroupStyle={inputGroupStyle}
                error={validationErrors.email}
                errorTextStyle={errorTextStyle}
              />
              <InputField
                label="Phone Number *"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleInputChange}
                inputStyle={validationErrors.phone ? inputErrorStyle : inputStyle}
                labelStyle={labelStyle}
                inputGroupStyle={inputGroupStyle}
                error={validationErrors.phone}
                errorTextStyle={errorTextStyle}
              />
              <div style={{fontSize: '12px', color: '#475569', fontStyle: 'italic', marginTop: '8px'}}>
                * Please provide either an email address or phone number
              </div>
              <div style={actionsStyle}>
                <div></div>
                <button type="button" style={primaryBtnStyle} onClick={goNext}>
                  Next Step
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div style={stepContentStyle}>
              <InputSelect
                label="Business Type"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                options={[
                  ['', 'Select business type'],
                  ['garment-manufacturer', 'Garment Manufacturer'],
                  ['clothing-retailer', 'Clothing Retailer'],
                  ['fabric-importer', 'Fabric Importer'],
                  ['trading-company', 'Trading Company'],
                  ['other', 'Other'],
                ]}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
                inputGroupStyle={inputGroupStyle}
              />
              <InputSelect
                label="Annual Fabric Volume"
                name="annualVolume"
                value={formData.annualVolume}
                onChange={handleInputChange}
                options={[
                  ['', 'Select volume range'],
                  ['under-10k', 'Under 10,000 m'],
                  ['10k-50k', '10,000–50,000 m'],
                  ['50k-100k', '50,000–100,000 m'],
                  ['100k-500k', '100,000–500,000 m'],
                  ['over-500k', '500,000+ m'],
                ]}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
                inputGroupStyle={inputGroupStyle}
              />
              <InputField
                label="Primary Markets"
                name="primaryMarkets"
                placeholder="e.g., North America, Europe, Asia"
                value={formData.primaryMarkets}
                onChange={handleInputChange}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
                inputGroupStyle={inputGroupStyle}
              />
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={labelStyle}>Fabric Types of Interest</span>
                <div style={pillGroupStyle}>
                  {['Cotton','Silk','Polyester','Blends','Linen','Wool','Technical','Denim'].map((f) => (
                    <button
                      type="button"
                      key={f}
                      style={formData.fabricTypes.includes(f) ? activePillStyle : pillStyle}
                      onClick={() => toggleFabric(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div style={actionsStyle}>
                <button type="button" style={ghostBtnStyle} onClick={goBack}>
                  Previous
                </button>
                <button type="button" style={primaryBtnStyle} onClick={goNext}>
                  Next Step
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div style={stepContentStyle}>
              <InputTextArea
                label="Specifications & Requirements"
                name="specifications"
                placeholder="Weight, width, color requirements, etc."
                value={formData.specifications}
                onChange={handleInputChange}
                inputStyle={textareaStyle}
                labelStyle={labelStyle}
                inputGroupStyle={inputGroupStyle}
              />
              <InputTextArea
                label="Additional Message"
                name="message"
                placeholder="Any additional requirements or questions"
                value={formData.message}
                onChange={handleInputChange}
                inputStyle={textareaStyle}
                labelStyle={labelStyle}
                inputGroupStyle={inputGroupStyle}
              />
              <InputSelect
                label="Timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
                options={[
                  ['', 'Select timeline'],
                  ['immediate', 'Within 1 month'],
                  ['1-3-months', '1–3 months'],
                  ['3-6-months', '3–6 months'],
                  ['6-months-plus', '6+ months'],
                ]}
                inputStyle={inputStyle}
                labelStyle={labelStyle}
                inputGroupStyle={inputGroupStyle}
              />
              <div style={actionsStyle}>
                <button type="button" style={ghostBtnStyle} onClick={goBack}>
                  Previous
                </button>
                <button type="submit" style={{...primaryBtnStyle, opacity: isSubmitting ? 0.7 : 1}} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Subcomponents with inline styles
function InputField({ label, name, value, onChange, placeholder, type = 'text', inputStyle, labelStyle, inputGroupStyle, error, errorTextStyle }) {
  return (
    <div style={inputGroupStyle}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
      {error && <div style={errorTextStyle}>{error}</div>}
    </div>
  );
}

function InputSelect({ label, name, value, onChange, options, inputStyle, labelStyle, inputGroupStyle }) {
  return (
    <div style={inputGroupStyle}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        style={inputStyle}
      >
        {options.map(([v, text]) => (
          <option key={v + text} value={v}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

function InputTextArea({ label, name, value, onChange, placeholder, inputStyle, labelStyle, inputGroupStyle }) {
  return (
    <div style={inputGroupStyle}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={3}
        style={inputStyle}
      />
    </div>
  );
}