import React from 'react';

const Descarga = ({ month, year }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/export?month=${month}&year=${year}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'exported_data.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('Failed to download file');
        alert('Failed to download the file.');
      }
    } catch (error) {
      console.error('Error downloading the file', error);
      alert('Error downloading the file.');
    }
  };

  return (
    <div className="text-center items-center">
      <button
        onClick={handleDownload}
        className="button button--flex btn-contact mt-3"
      >
        Excel TC Master
      </button>
    </div>
  );
};

export default Descarga;
