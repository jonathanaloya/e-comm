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

        // If session expired, clear local state immediately
        if (error.response?.status === 401 && error.response?.data?.sessionExpired) {
            console.log('Session expired during user details fetch - clearing local state')
            // Import store and actions dynamically to avoid circular dependencies
            import('../store/store').then(({ store }) => {
                import('../store/userSlice').then(({ logout }) => {
                    import('../store/cartProduct').then(({ handleAddItemCart }) => {
                        import('../store/orderSlice').then(({ setOrder }) => {
                            store.dispatch(logout())
                            store.dispatch(handleAddItemCart([]))
                            store.dispatch(setOrder([]))
                        })
                    })
                })
            })
        }

        return { data: null, error: true }
    }
}

export default fetchUserDetails