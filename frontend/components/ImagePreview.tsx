import { useState, useEffect } from 'react';

interface ImagePreviewProps {
    file: File;
}

export function ImagePreview({ file }: ImagePreviewProps) {
    const [preview, setPreview] = useState<string>();

    useEffect(() => {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        return () => reader.abort();
    }, [file]);

    if (!preview) return null;

    return (
        <div className="mt-4">
            <img
                src={preview}
                alt="Scan preview"
                className="max-w-full h-auto rounded-lg"
            />
        </div>
    );
} 