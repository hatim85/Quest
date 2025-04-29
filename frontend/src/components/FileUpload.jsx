const FileUpload = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
  
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile && selectedFile.type.startsWith("image")) {
        setFile(selectedFile);
        onUploadComplete(selectedFile);
      } else {
        alert("Please upload a valid image file (JPG, PNG, etc.)");
      }
    };
  
    return (
      <div className="border p-4 rounded-lg">
        <label htmlFor="file-upload" className="block text-lg font-medium">
          Upload Proof of Activity (e.g., Screenshot)
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="mt-2"
        />
        {file && <p className="text-sm mt-2 text-green-500">File Uploaded: {file.name}</p>}
      </div>
    );
  };

export default FileUpload;
  