import React from "react";

function AddressForm({ initialValues, onChange, showSubmitButton = true, onSubmit, submitButtonText = "Save Address" }) {
  const [address, setAddress] = React.useState(
    initialValues || {
      id: null,
      street: "",
      city: "",
      state: "",
      postalCode: "",
      phone: ""
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedAddress = {
      ...address,
      [name]: value
    };
    setAddress(updatedAddress);
    if (onChange) {
      onChange(updatedAddress);
    }
  };

  const validateForm = () => {
    if (!address.street || !address.city || !address.state || !address.postalCode || !address.phone) {
      alert("Please fill all address fields");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm() && onSubmit) {
      onSubmit(address);
    }
  };

  return (
    <form>
      <div className="mb-3">
        <label className="form-label">Street Address</label>
        <input
          type="text"
          className="form-control"
          name="street"
          value={address.street}
          onChange={handleChange}
          placeholder="Enter street address"
        />
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-control"
              name="city"
              value={address.city}
              onChange={handleChange}
              placeholder="Enter city"
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">State</label>
            <input
              type="text"
              className="form-control"
              name="state"
              value={address.state}
              onChange={handleChange}
              placeholder="Enter state"
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Postal Code</label>
            <input
              type="text"
              className="form-control"
              name="postalCode"
              value={address.postalCode}
              onChange={handleChange}
              placeholder="Enter postal code"
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={address.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </div>

      {showSubmitButton && (
        <button
          type="button"
          className="btn btn-primary w-100"
          onClick={handleSubmit}
        >
          {submitButtonText}
        </button>
      )}
    </form>
  );
}

export default AddressForm;