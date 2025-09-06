import React from 'react';

const LeadForm = ({ 
  showLeadForm, 
  setShowLeadForm, 
  leadData, 
  setLeadData, 
  messages, 
  setMessages 
}) => {
  const submitLeadForm = async (e) => {
    e.preventDefault();
    
    try {
      // Get the last question from messages
      const lastQuestion = messages.length > 0 ? messages[messages.length - 1].text : 'No question asked';
      
      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.text
      }));

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          action: leadData.action,
          conversationHistory,
          lastQuestion
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowLeadForm(false);
        setLeadData({ name: '', email: '', phone: '', action: '' });
        setMessages((m) => [...m, { 
          id: Date.now(), 
          role: 'assistant', 
          text: `Thank you! Our team will contact you within 24 hours. Your reference ID: ${data.leadId}`
        }]);
      } else {
        alert('Error saving lead. Please try again.');
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Error saving lead. Please try again.');
    }
  };

  if (!showLeadForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000] backdrop-blur-sm" onClick={() => setShowLeadForm(false)}>
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-[90%] mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-semibold mb-2 text-gray-800">Get Detailed Information</h3>
        <p className="text-gray-600 mb-6">Fill in your details and our counselor will contact you within 24 hours.</p>
        <form onSubmit={submitLeadForm} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Name"
            value={leadData.name}
            onChange={(e) => setLeadData({...leadData, name: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm outline-none transition-colors focus:border-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={leadData.email}
            onChange={(e) => setLeadData({...leadData, email: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm outline-none transition-colors focus:border-blue-500"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={leadData.phone}
            onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm outline-none transition-colors focus:border-blue-500"
            required
          />
          <button 
            type="submit" 
            className="bg-emerald-600 text-white border-0 px-6 py-3.5 rounded-lg font-semibold cursor-pointer transition-colors hover:bg-emerald-700"
          >
            Submit & Get Brochure
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
