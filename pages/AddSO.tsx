import React, { useState } from 'react';
import { API_BASE_URL } from '../constants';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const AddSO: React.FC = () => {
  const [formData, setFormData] = useState({
    so_number: '',
    date_so_approved: new Date().toISOString().split('T')[0],
    salesman: '',
    client: '',
    product_type: '',
    item_description: '',
    quantity: '',
    uom: '',
    gross_price: '',
    delivery_date: '',
    remarks: '',
  });
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    setStatusMessage('');

    // Basic validation
    for (const key in formData) {
      if (key !== 'delivery_date' && key !== 'remarks' && !formData[key as keyof typeof formData]) {
        setFormStatus('error');
        setStatusMessage(`Please fill in the '${key.replace(/_/g, ' ')}' field.`);
        return;
      }
    }

    const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity) || 0,
        gross_price: parseFloat(formData.gross_price) || 0,
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}?action=add_so`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFormStatus('success');
        setStatusMessage('Sales Order added successfully!');
        // Reset form
        setFormData({
            so_number: '',
            date_so_approved: new Date().toISOString().split('T')[0],
            salesman: '',
            client: '',
            product_type: '',
            item_description: '',
            quantity: '',
            uom: '',
            gross_price: '',
            delivery_date: '',
            remarks: '',
        });
      } else {
        throw new Error(result.error || 'Failed to add sales order.');
      }
    } catch (err) {
      setFormStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };
  
  const FormField: React.FC<{ name: string, label: string, type?: string, required?: boolean, children?: React.ReactNode }> =
    ({ name, label, type = 'text', required = true, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">
            {children ? children :
            <input
                type={type}
                name={name}
                id={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
                required={required}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-slate-700"
            />
            }
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="p-8 bg-white dark:bg-card-dark rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Sales Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField name="so_number" label="SO Number" />
            <FormField name="date_so_approved" label="Date Approved" type="date" />
            <FormField name="salesman" label="Salesman" />
            <FormField name="client" label="Client" />
            <FormField name="product_type" label="Product Type" />
            <FormField name="item_description" label="Item Description" />
            <FormField name="quantity" label="Quantity" type="number" />
            <FormField name="uom" label="Unit of Measure (UOM)" />
            <FormField name="gross_price" label="Gross Price" type="number" />
            <FormField name="delivery_date" label="Delivery Date" type="date" required={false} />
        </div>
        <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remarks</label>
            <textarea
                name="remarks"
                id="remarks"
                rows={3}
                value={formData.remarks}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-slate-700"
            />
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-md text-sm ${
            formStatus === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            formStatus === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''
          }`}>
            {statusMessage}
          </div>
        )}

        <div className="flex justify-end">
            <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {formStatus === 'submitting' ? 'Submitting...' : 'Add Sales Order'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddSO;
