const processDocuments = (documents) => {
  if (!documents || !Array.isArray(documents)) return [];

  return documents
    .map((doc) => {
      if (typeof doc === "string") return doc;
      if (doc.fileUrl) return doc.fileUrl;
      if (doc.link) return doc.link;
      return null;
    })
    .filter(Boolean);
};


export default processDocuments;