'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  size?: number;
  data?: string;
  queueName?: string;
  location?: string;
}

const QRCode: React.FC<QRCodeProps> = ({ 
  size = 250, 
  data, 
  queueName = 'Default Queue',
  location = 'Default Location'
}) => {
  const [qrValue, setQrValue] = useState('');
  
  useEffect(() => {
    // Generate a new QR code value based on the current date
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    // Format date for display if needed in the future
    // const formattedDate = today.toLocaleDateString('en-US', { 
    //   month: 'long', 
    //   day: 'numeric', 
    //   year: 'numeric' 
    // });
    
    // Create a unique value for the QR code that changes daily
    const uniqueValue = data ? 
      `${data}-${dateString}` : 
      `${queueName}-${location}-${dateString}`;
      
    setQrValue(uniqueValue);
  }, [data, queueName, location]);
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="border-4 border-black bg-white p-4 mx-auto"
        style={{ width: size, height: size }}
        id="qr-code-container"
      >
        <QRCodeSVG 
          value={qrValue} 
          size={size - 32} // Account for padding
          level="H" // High error correction
          includeMargin={true}
        />
      </div>
    </div>
  );
};

export default QRCode;
