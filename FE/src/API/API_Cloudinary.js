import axiosInstance from "./axiosInstance";

export const uploadImage = (file, folder = "") => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post(
    `/api/Cloudinary/upload${folder ? `?folder=${encodeURIComponent(folder)}` : ""}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const uploadMultipleImages = (files, folder = "") => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return axiosInstance.post(
    `/api/Cloudinary/upload-multiple${folder ? `?folder=${encodeURIComponent(folder)}` : ""}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deleteImage = (publicId) => {
  return axiosInstance.delete(`/api/Cloudinary?publicId=${encodeURIComponent(publicId)}`);
};
