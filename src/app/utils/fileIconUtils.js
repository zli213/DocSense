const getFileIcon = (uri) => {
  const fileExtension = uri.split(".").pop().toLowerCase();
  switch (fileExtension) {
    case "pdf":
      return "/picture/PdfIcon.svg";
    case "doc":
    case "docx":
      return "/picture/WordIcon.svg";
    case "xls":
    case "xlsx":
      return "/picture/ExcelIcon.svg";
    case "ppt":
    case "pptx":
      return "/picture/PptIcon.svg";
    default:
      return null;
  }
};

export default getFileIcon;
