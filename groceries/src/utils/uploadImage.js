import Axios from "./Axios"
import SummaryApi from "../common/summaryApi"


const uploadImage = async(Image) => {
    try {
        const formData = new FormData()
        formData.append('image', Image)

        const response = await Axios({
            ...SummaryApi.uploadImage,
            data : formData
        })
        return response
    } catch (error) {
        return error
    }
}

export default uploadImage