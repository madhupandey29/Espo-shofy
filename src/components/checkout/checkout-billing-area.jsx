'use client';
import React from "react";
import ErrorMsg from "../common/error-msg";
import { useSelector } from "react-redux";

const CheckoutBillingArea = ({ register, errors }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <div className="modern-billing-area">
        <div className="billing-header">
          <h2 className="billing-title">Billing Details</h2>
          <p className="billing-subtitle">Please fill in your information to complete your order</p>
        </div>

        <div className="billing-form">
          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">
                First Name <span className="required">*</span>
              </label>
              <input
                {...register("firstName", {
                  required: `First name is required!`,
                })}
                name="firstName"
                id="firstName"
                type="text"
                className="field-input"
                placeholder="Enter your first name"
                defaultValue={user?.firstName}
              />
              <ErrorMsg msg={errors?.firstName?.message} />
            </div>

            <div className="form-field">
              <label className="field-label">
                Last Name <span className="required">*</span>
              </label>
              <input
                {...register("lastName", {
                  required: `Last name is required!`,
                })}
                name="lastName"
                id="lastName"
                type="text"
                className="field-input"
                placeholder="Enter your last name"
                defaultValue={user?.lastName}
              />
              <ErrorMsg msg={errors?.lastName?.message} />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">
                Phone <span className="required">*</span>
              </label>
              <input
                {...register("contactNo", {
                  required: `Phone number is required!`,
                })}
                name="contactNo"
                id="contactNo"
                type="tel"
                className="field-input"
                placeholder="Enter your phone number"
                defaultValue={user?.phone}
              />
              <ErrorMsg msg={errors?.contactNo?.message} />
            </div>

            <div className="form-field">
              <label className="field-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                {...register("email", { required: `Email is required!` })}
                name="email"
                id="email"
                type="email"
                className="field-input"
                placeholder="Enter your email address"
                defaultValue={user?.email}
              />
              <ErrorMsg msg={errors?.email?.message} />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">
              Country <span className="required">*</span>
            </label>
            <input
              {...register("country", { required: `Country is required!` })}
              name="country"
              id="country"
              type="text"
              className="field-input"
              placeholder="United States (US)"
              defaultValue="United States (US)"
            />
            <ErrorMsg msg={errors?.country?.message} />
          </div>

          <div className="form-field">
            <label className="field-label">
              Street Address <span className="required">*</span>
            </label>
            <input
              {...register("address", { required: `Address is required!` })}
              name="address"
              id="address"
              type="text"
              className="field-input"
              placeholder="House number and street name"
              defaultValue={user?.address}
            />
            <ErrorMsg msg={errors?.address?.message} />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">
                Town / City <span className="required">*</span>
              </label>
              <input
                {...register("city", { required: `City is required!` })}
                name="city"
                id="city"
                type="text"
                className="field-input"
                placeholder="Enter your city"
                defaultValue={user?.city}
              />
              <ErrorMsg msg={errors?.city?.message} />
            </div>

            <div className="form-field">
              <label className="field-label">
                Postcode / ZIP <span className="required">*</span>
              </label>
              <input
                {...register("zipCode", { required: `ZIP code is required!` })}
                name="zipCode"
                id="zipCode"
                type="text"
                className="field-input"
                placeholder="Enter ZIP code"
                defaultValue={user?.zipCode}
              />
              <ErrorMsg msg={errors?.zipCode?.message} />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">Order Notes (Optional)</label>
            <textarea
              {...register("orderNote", { required: false })}
              name="orderNote"
              id="orderNote"
              className="field-input field-textarea"
              rows={4}
              placeholder="Notes about your order, e.g. special notes for delivery."
            />
          </div>
        </div>
      </div>

      {/* Modern Styles */}
      <style jsx>{`
        .modern-billing-area {
          background: var(--tp-common-white);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .billing-header {
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--tp-grey-2);
        }

        .billing-title {
          font-size: 20px !important;
          font-weight: 700;
          color: var(--tp-text-1);
          margin-bottom: 8px;
        }

        .billing-subtitle {
          color: var(--tp-text-2);
          margin: 0;
          font-size: 14px !important;
        }

        .billing-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
        }

        .field-label {
          font-weight: 600;
          color: var(--tp-text-1);
          margin-bottom: 8px;
          font-size: 14px !important;
        }

        .required {
          color: #dc3545;
        }

        .field-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid var(--tp-grey-2);
          border-radius: 12px;
          font-size: 16px !important;
          transition: all 0.2s ease;
          background: var(--tp-common-white);
          color: var(--tp-text-1);
          font-family: inherit;
        }

        .field-input:focus {
          border-color: var(--tp-theme-primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(9, 137, 255, 0.1);
        }

        .field-input::placeholder {
          color: var(--tp-text-3);
          font-size: 14px;
        }

        .field-textarea {
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modern-billing-area {
            padding: 24px 20px;
            border-radius: 12px;
          }

          .billing-header {
            margin-bottom: 24px;
            padding-bottom: 16px;
          }

          .billing-title {
            font-size: 18px !important;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .billing-form {
            gap: 16px;
          }

          .field-input {
            padding: 12px 14px;
            font-size: 16px !important; /* Prevent zoom on iOS */
          }
        }

        @media (max-width: 480px) {
          .modern-billing-area {
            padding: 20px 16px;
          }

          .billing-title {
            font-size: 16px !important;
          }

          .billing-subtitle {
            font-size: 13px !important;
          }

          .field-label {
            font-size: 13px !important;
          }
        }
      `}</style>
    </>
  );
};

export default CheckoutBillingArea;
