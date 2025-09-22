import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  validateStatus: (status) => status >= 200 && status < 500,
});

export interface PatientData {
  name: string;
  age: number;
  gender: string;
  medicalHistory: string;
  symptoms: {
    current: string;
    duration: string;
    severity: string;
    previousTreatments: string;
    additionalNotes: string;
  };
}

export const createPatient = async (patientData: PatientData) => {
  try {
    const response = await api.post('/patients', patientData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create patient');
    }
    throw error;
  }
};

export const uploadScan = async (patientId: string, image: File) => {
  const formData = new FormData();
  formData.append('file', image);
  formData.append('patientId', patientId);
  
  try {
    console.log('Uploading scan...', { patientId, imageSize: image.size, url: `${API_URL}/upload` });
    
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
      validateStatus: (status) => status >= 200 && status < 500,
    });
    
    console.log('Raw server response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    if (!response.data.classification || !response.data.segmentation_mask) {
      console.error('Invalid response structure:', response.data);
      throw new Error('Invalid response format from server');
    }
    
    const transformedResponse = {
      success: true,
      tumorType: response.data.classification.class,
      confidence: response.data.classification.confidence,
      segmentationMask: response.data.segmentation_mask,
      hasTumor: response.data.classification.class !== 'No Tumour'
    };

    console.log('Transformed response:', transformedResponse);
    return transformedResponse;
    
  } catch (error: unknown) {
    console.error('Upload error details:', {
      error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      } : null,
      request: axios.isAxiosError(error) && error.request ? 
        'Request was made but no response received' : 
        'Request setup failed'
    });
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Failed to upload scan';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getScans = async (patientId: string) => {
  return api.get(`/scans/${patientId}`);
};

export default api;

