import React, { useState } from 'react';
import { API_BASE_URL } from '../constants';

const AddSO: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setMessage(null);
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}?action=add_so`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const responseText = await response.text();
                console.error("Received non-JSON response:", responseText);
                throw new TypeError(`Expected JSON, but got ${contentType}. Response body: ${responseText.substring(0, 500)}...`);
            }

            const result = await response.json();
            
            if (result.success) {
                setMessage({ type: 'success', text: 'Sales order added successfully!' });
                formRef.current?.reset();
            } else {
                throw new Error(result.error || 'An unknown error occurred.');
            }
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: `Failed to add sales order: ${error.message}` });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred.' });
            }
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const inputFields = [
        { name: 'salesman', label: 'Salesman', type: 'text', required: true },
        { name: 'date_so_approved', label: 'Date S.O. Approved', type: 'date', required: true },
        { name: 'client', label: 'Client', type: 'text', required: true },
        { name: 'product_type', label: 'Product Type', type: 'text', required: true },
        { name: 'item_description', label: 'Item Description', type: 'text', required: true, colSpan: 2 },
        { name: 'quantity', label: 'Quantity', type: 'number', step: 'any', required: true },
        { name: 'uom', label: 'UOM', type: 'text', required: true },
        { name: 'gross_price', label: 'Gross Price', type: 'number', step: 'any', required: true },
        { name: 'delivery_date', label: 'Delivery Date', type: 'date' },
        { name: 'remarks', label: 'Remarks', type: 'text', colSpan: 2 },
    ];


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Add SO Approved</h1>
            <div className="bg-white dark:bg-card-dark p-8 rounded-xl shadow-md max-w-4xl mx-auto">
                {message && (
                    <div className={`p-4 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleSubmit} ref={formRef}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {inputFields.map(field => (
                            <div key={field.name} className={`${field.colSpan === 2 ? 'md:col-span-2' : ''}`}>
                                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                                <input
                                    type={field.type}
                                    id={field.name}
                                    name={field.name}
                                    step={field.step}
                                    required={field.required}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-slate-700 dark:text-gray-200"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 dark:focus:ring-offset-dark-bg">
                            {isSubmitting ? 'Saving...' : 'Add Sales Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSO;