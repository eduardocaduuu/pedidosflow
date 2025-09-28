import FileUpload from '../FileUpload';

export default function FileUploadExample() {
  const handleFileProcessed = () => {
    console.log('File processed successfully');
  };

  return (
    <div className="p-6 max-w-2xl">
      <FileUpload onFileProcessed={handleFileProcessed} />
    </div>
  );
}