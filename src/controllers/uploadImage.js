import uploadImageCloudinary from "../utilities/updateImageCloudinary.js"

const uploadImageController = async(req, res) => {
    try {
        const file = req.file

        const uploadImage = await uploadImageCloudinary(file)

        return res.json({
            message: "Image uploaded successfully",
            data: uploadImage,
            error: false,
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export default uploadImageController