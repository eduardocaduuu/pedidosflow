import FileUpload from '../FileUpload';

export default function FileUploadExample() {
  const handleFileProcessed = (orders: any[]) => {
    console.log('Orders processed:', orders);
  };

  return (
    <div className="p-6 max-w-2xl">
      <FileUpload onFileProcessed={handleFileProcessed} />
    </div>
  );
}