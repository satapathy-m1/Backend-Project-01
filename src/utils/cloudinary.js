import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("File has been successfully uploaded..", response.url);

        await fs.unlink(localFilePath); 
        return response;

    } catch (error) {
        console.log("Cloudinary upload error:-", error);
        
        try {
            await fs.unlink(localFilePath); 
        } catch (unlinkErr) {
            console.error("Failed to delete local file after error:", unlinkErr);
        }

        return null;
    }
};

export { uploadOnCloudinary };
