import Axios from "./Axios"
import SummaryApi from "../common/SummaryApi"

const fetchUserDetails = async() => {
    try {
        const response = await Axios({
            ...SummaryApi.getUserLoginDetails
        })
        return response.data
    } catch (error) {
        console.log('User not authenticated:', error.response?.status)
        return { data: null, error: true }
    }
}

export default fetchUserDetails