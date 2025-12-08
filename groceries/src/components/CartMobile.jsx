
import { useGlobalContext } from '../provider/GlobalProvider'
import { FaCartShopping } from 'react-icons/fa6'
import { DisplayPriceInShillings } from '../utils/DisplayPriceInShillings'
import { Link } from 'react-router-dom'
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux'

const CartMobileLink = () => {
    const { totalPrice, totalQty, guestCartItems } = useGlobalContext()
    const cartItem = useSelector(state => state.cartItem.cart)
    const user = useSelector(state => state.user)
    
    // Use guest cart items if user is not logged in
    const currentCartItems = user?._id ? cartItem : guestCartItems

  return (
    <>
        {
            currentCartItems[0] && (
            <div className='fixed bottom-4 left-4 right-4 p-2 z-40 pb-safe'>
            <div className='bg-green-600 px-4 py-3 rounded-lg text-neutral-100 text-sm flex items-center justify-between gap-3 lg:hidden shadow-lg mb-2'>
                    <div className='flex items-center gap-2'>
                        <div className='p-2 bg-green-500 rounded w-fit'>
                            <FaCartShopping/>
                        </div>
                        <div className='text-xs'>
                                <p>{totalQty} items</p>
                                <p>{DisplayPriceInShillings(totalPrice)}</p>
                        </div>
                    </div>

                    <Link to={"/cart"} className='flex items-center gap-1'>
                        <span className='text-sm'>View Cart</span>
                        <FaCaretRight/>
                    </Link>
                </div>
            </div>
            )
        }
    </>
    
  )
}

export default CartMobileLink