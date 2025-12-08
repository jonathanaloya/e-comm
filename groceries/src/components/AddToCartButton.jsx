import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from './Loading'
import { useSelector } from 'react-redux'
import { FaMinus, FaPlus } from "react-icons/fa6";

const AddToCartButton = ({ data }) => {
    const { fetchCartItem, updateCartItem, deleteCartItem, guestCartItems, setGuestCartItems } = useGlobalContext()
    const [loading, setLoading] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const user = useSelector(state => state.user)
    const [isAvailableCart, setIsAvailableCart] = useState(false)
    const [qty, setQty] = useState(0)
    const [cartItemDetails,setCartItemsDetails] = useState()
    
    const currentCartItems = user?._id ? cartItem : guestCartItems

    const handleADDTocart = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user?._id) {
            // Guest user - add to localStorage
            const existingItem = guestCartItems.find(item => item._id === data._id)
            if (existingItem) {
                toast.error("Item already in cart")
                return
            }
            
            const newCartItem = { ...data, quantity: 1 }
            const updatedCart = [...guestCartItems, newCartItem]
            setGuestCartItems(updatedCart)
            localStorage.setItem('guestCart', JSON.stringify(updatedCart))
            toast.success("Item added to cart")
            return
        }

        try {
            setLoading(true)

            const response = await Axios({
                ...SummaryApi.addTocart,
                data: {
                    productId: data?._id
                }
            })

            const { data: responseData } = response

            if (responseData.success) {
                toast.success(responseData.message)
                if (fetchCartItem) {
                    fetchCartItem()
                }
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }

    }

    //checking this item in cart or not
    useEffect(() => {
        if (user?._id) {
            const checkingitem = cartItem.some(item => item.productId._id === data._id)
            setIsAvailableCart(checkingitem)
            const product = cartItem.find(item => item.productId._id === data._id)
            setQty(product?.quantity)
            setCartItemsDetails(product)
        } else {
            const checkingitem = guestCartItems.some(item => item._id === data._id)
            setIsAvailableCart(checkingitem)
            const product = guestCartItems.find(item => item._id === data._id)
            setQty(product?.quantity)
            setCartItemsDetails(product)
        }
    }, [data, cartItem, guestCartItems, user])


    const increaseQty = async(e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (!user?._id) {
            // Guest user - update localStorage
            const updatedCart = guestCartItems.map(item => 
                item._id === data._id ? { ...item, quantity: item.quantity + 1 } : item
            )
            setGuestCartItems(updatedCart)
            localStorage.setItem('guestCart', JSON.stringify(updatedCart))
            toast.success("Item added")
            return
        }
    
       const response = await  updateCartItem(cartItemDetails?._id,qty+1)
        
       if(response.success){
        toast.success("Item added")
       }
    }

    const decreaseQty = async(e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (!user?._id) {
            // Guest user - update localStorage
            if(qty === 1){
                const updatedCart = guestCartItems.filter(item => item._id !== data._id)
                setGuestCartItems(updatedCart)
                localStorage.setItem('guestCart', JSON.stringify(updatedCart))
                toast.success("Item removed")
            } else {
                const updatedCart = guestCartItems.map(item => 
                    item._id === data._id ? { ...item, quantity: item.quantity - 1 } : item
                )
                setGuestCartItems(updatedCart)
                localStorage.setItem('guestCart', JSON.stringify(updatedCart))
                toast.success("Item removed")
            }
            return
        }
        
        if(qty === 1){
            deleteCartItem(cartItemDetails?._id)
        }else{
            const response = await updateCartItem(cartItemDetails?._id,qty-1)

            if(response.success){
                toast.success("Item removed")
            }
        }
    }
    return (
        <div className='w-full max-w-[150px]'>
            {
                isAvailableCart ? (
                    <div className='flex w-full h-full'>
                        <button onClick={decreaseQty} className='bg-green-600 hover:bg-green-700 text-white flex-1 w-full p-1 rounded flex items-center justify-center'><FaMinus /></button>

                        <p className='flex-1 w-full font-semibold px-1 flex items-center justify-center'>{qty}</p>

                        <button onClick={increaseQty} className='bg-green-600 hover:bg-green-700 text-white flex-1 w-full p-1 rounded flex items-center justify-center'><FaPlus /></button>
                    </div>
                ) : (
                    <button onClick={handleADDTocart} className='bg-green-600 hover:bg-green-700 text-white px-2 lg:px-4 py-1 rounded'>
                        {loading ? <Loading /> : "Add"}
                    </button>
                )
            }

        </div>
    )
}

export default AddToCartButton