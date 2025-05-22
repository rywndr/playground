declare namespace CloudinaryTypes {
  interface CloudinaryUploadResult {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    url: string;
    secure_url: string;
    original_filename: string;
  }
  
  interface CloudinaryError {
    message: string;
    http_code?: number;
  }
}

export = CloudinaryTypes;
