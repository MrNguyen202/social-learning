const getFileIconUrl = (file: File) => {
    const name = file.name.toLowerCase();
    const type = file.type;

    if (name.endsWith(".pdf")) return "/iconFiles/2133056_document_eps_file_format_pdf_icon.png";
    if (name.endsWith(".doc") || name.endsWith(".docx"))
        return "/iconFiles/6296673_microsoft_office_office365_word_icon.png";
    if (name.endsWith(".xls") || name.endsWith(".xlsx"))
        return "/iconFiles/7267724_ext_csv_file_document_format_icon.png";
    if (name.endsWith(".zip") || name.endsWith(".rar"))
        return "/iconFiles/zip_file_icon.png";
    if (name.endsWith(".ppt") || name.endsWith(".pptx"))
        return "/iconFiles/6296672_microsoft_office_office365_powerpoint_icon.png";

    return "/iconFiles/211656_text_document_icon.png";
};

export default getFileIconUrl;