const normalizeDocuments = (images = []) => {
  return images.map((imageUrl, index) => {
    if (typeof imageUrl === "string") {
      return {
        id: `existing-${index}-${Date.now()}`,
        name: imageUrl.split("/").pop() || `image-${index + 1}`,
        fileUrl: imageUrl,
        type: "file",
        title: imageUrl.split("/").pop() || `image-${index + 1}`,
      };
    }
    return imageUrl;
  });
};

export default normalizeDocuments;
