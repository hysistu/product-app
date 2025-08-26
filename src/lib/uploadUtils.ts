// Utility functions for handling image uploads and FormData

export interface UploadData {
  [key: string]: string | number | boolean | File | null;
}

/**
 * Convert form data to FormData for file uploads
 */
export const createFormData = (data: any, token?: string): FormData => {
  const formData = new FormData();

  // Append each field
  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  // Add token if provided
  if (token) {
    formData.append("token", token);
  }

  return formData;
};

/**
 * Submit form data with file uploads or as JSON
 */
export const submitWithUpload = async (
  url: string,
  data: UploadData,
  token?: string,
  method: "POST" | "PUT" | "PATCH" = "POST"
): Promise<Response> => {
  // Check if there are any files to upload
  const hasFiles = Object.values(data).some((value) => value instanceof File);

  let headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (hasFiles) {
    // Use FormData for file uploads
    const formData = createFormData(data, token);

    console.log("Sending FormData with headers:", headers);
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    return fetch(url, {
      method,
      headers,
      body: formData,
    });
  } else {
    // Use JSON for text-only data
    headers["Content-Type"] = "application/json";

    return fetch(url, {
      method,
      headers,
      body: JSON.stringify(data),
    });
  }
};

/**
 * Check if a value is a File object
 */
export const isFile = (value: any): value is File => {
  return value instanceof File;
};

/**
 * Check if a value is a URL string
 */
export const isUrl = (value: any): value is string => {
  return (
    typeof value === "string" &&
    (value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("uploads/"))
  );
};

/**
 * Get image source for display (File, URL, or fallback)
 */
export const getImageSource = (value: string | File | null): string => {
  if (!value) return "";

  if (value instanceof File) {
    return URL.createObjectURL(value);
  }

  if (typeof value === "string") {
    if (isUrl(value)) {
      return value;
    }
    // If it's a local path, return as is
    return value;
  }

  return ""; // Return empty string instead of placeholder
};

/**
 * Clean up object URLs to prevent memory leaks
 */
export const revokeObjectURL = (url: string) => {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

/**
 * Validate file type
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.some((type) => file.type.startsWith(type));
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf(".") - 1 + 2) * 2);
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = getFileExtension(originalName);
  return `${timestamp}-${random}${extension}`;
};

/**
 * Get the proxied image URL to avoid CORS issues
 * @param imagePath - The image path from the API response
 * @returns The proxied URL that will work in the frontend
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "";

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Remove leading slash from imagePath if it exists
  const cleanImagePath = imagePath.startsWith("/")
    ? imagePath.slice(1)
    : imagePath;

  // Use the Next.js API route to proxy images and avoid CORS issues
  return `/api/images/${cleanImagePath}`;
};
