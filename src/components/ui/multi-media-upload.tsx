"use client"

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Video, Play } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface MediaUploadProps {
  onImagesChange: (urls: string[]) => void;
  onVideoChange: (url: string | null) => void;
  initialImages?: string[];
  initialVideo?: string;
  className?: string;
}

export function MultiMediaUpload({ 
  onImagesChange, 
  onVideoChange, 
  initialImages = [], 
  initialVideo = "",
  className 
}: MediaUploadProps) {
  const [uploading, setUploading] = useState<'image' | 'video' | null>(null);
  const [images, setImages] = useState<string[]>(initialImages);
  const [video, setVideo] = useState<string | null>(initialVideo || null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, type: 'image' | 'video'): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = type === 'image' ? `products/images/${fileName}` : `products/videos/${fileName}`;
    const storageRef = ref(storage, filePath);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (storageError) {
      console.error('Firebase Storage error:', storageError);
      
      // Fallback: Use base64 encoding for now
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading('image');
    const newImages: string[] = [];

    try {
      for (let i = 0; i < Math.min(files.length, 3 - images.length); i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select only image files');
          continue;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB');
          continue;
        }

        const url = await uploadFile(file, 'image');
        newImages.push(url);
      }

      const updatedImages = [...images, ...newImages].slice(0, 3);
      setImages(updatedImages);
      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Video size should be less than 50MB');
      return;
    }

    setUploading('video');

    try {
      const url = await uploadFile(file, 'video');
      setVideo(url);
      onVideoChange(url);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video');
    } finally {
      setUploading(null);
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const removeVideo = () => {
    setVideo(null);
    onVideoChange(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Images Upload */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Product Images (Up to 3)</h3>
        
        {/* Current Images */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
            
            {/* Empty slots */}
            {[...Array(3 - images.length)].map((_, index) => (
              <div key={`empty-${index}`} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Add Image</span>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading === 'image' || images.length >= 3}
            className="w-full"
          >
            {uploading === 'image' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {images.length >= 3 ? 'Max Images Reached' : `Add Image${images.length > 0 ? `s (${images.length}/3)` : ''}`}
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Upload up to 3 high-quality images. Max 5MB per image.
          </p>
        </div>
      </div>

      {/* Video Upload */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Product Video (Optional)</h3>
        
        {/* Current Video */}
        {video ? (
          <div className="relative group mb-4">
            <video
              src={video}
              className="w-full h-48 object-cover rounded-lg border"
              controls
            />
            <button
              type="button"
              onClick={removeVideo}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center">
              <Play className="h-3 w-3 mr-1" />
              Product Video
            </div>
          </div>
        ) : (
          <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 mb-4">
            <Video className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">No video uploaded</span>
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading === 'video'}
            className="w-full"
          >
            {uploading === 'video' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {video ? 'Change Video' : 'Add Video'}
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Upload a product video to build trust. Max 50MB.
          </p>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">📸 Why Multiple Media Matters</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Show product from different angles</li>
          <li>• Demonstrate product features with video</li>
          <li>• Build customer trust and confidence</li>
          <li>• Increase conversion rates by 30%</li>
        </ul>
      </div>
    </div>
  );
}
