import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'

const AddAddress = ({close}) => {
    const { register, handleSubmit, reset, setValue } = useForm()
    const { fetchAddress } = useGlobalContext()
    const [isDetectingLocation, setIsDetectingLocation] = useState(false)
    const [coordinates, setCoordinates] = useState(null)

    const detectCurrentLocation = () => {
        setIsDetectingLocation(true)
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                    setCoordinates(coords)
                    
                    if (window.google && window.google.maps) {
                        const geocoder = new google.maps.Geocoder()
                        const latlng = new google.maps.LatLng(coords.lat, coords.lng)
                        
                        geocoder.geocode({ location: latlng }, (results, status) => {
                            if (status === 'OK' && results[0]) {
                                const addressComponents = results[0].address_components
                                const formattedAddress = results[0].formatted_address
                                
                                let city = '', country = '', pincode = ''
                                
                                addressComponents.forEach(component => {
                                    const types = component.types
                                    if (types.includes('locality')) city = component.long_name
                                    if (types.includes('country')) country = component.long_name
                                    if (types.includes('postal_code')) pincode = component.long_name
                                })
                                
                                setValue('addressline', formattedAddress)
                                setValue('city', city)
                                setValue('country', country)
                                setValue('pincode', pincode)
                                
                                toast.success('Location detected successfully!')
                            }
                            setIsDetectingLocation(false)
                        })
                    } else {
                        toast.error('Google Maps not loaded')
                        setIsDetectingLocation(false)
                    }
                },
                (error) => {
                    toast.error('Could not detect location. Please enable location services.')
                    setIsDetectingLocation(false)
                }
            )
        } else {
            toast.error('Geolocation is not supported by this browser')
            setIsDetectingLocation(false)
        }
    }

    const onSubmit = async(data)=>{
        try {
            const response = await Axios({
                ...SummaryApi.createAddress,
                data : {
                    address_line :data.addressline,
                    city : data.city,
                    address1 : data.address1,
                    address2 : data.address2,
                    country : data.country,
                    pincode : data.pincode,
                    mobile : data.mobile,
                    coordinates: coordinates
                }
            })

            const { data : responseData } = response
            
            if(responseData.success){
                toast.success(responseData.message)
                if(close){
                    close()
                    reset()
                    fetchAddress()
                }
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }
  return (
    <section className='bg-black fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-70 h-screen overflow-auto'>
        <div className='bg-white p-4 w-full max-w-lg mt-8 mx-auto rounded'>
            <div className='flex justify-between items-center gap-4'>
                <h2 className='font-semibold'>Add Address</h2>
                <button onClick={close} className='hover:text-red-500'>
                    <IoClose  size={25}/>
                </button>
            </div>
            <form className='mt-4 grid gap-4' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid gap-1'>
                    <div className='flex justify-between items-center'>
                        <label htmlFor='addressline'>Address Line :</label>
                        <button
                            type='button'
                            onClick={detectCurrentLocation}
                            disabled={isDetectingLocation}
                            className='text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-400'
                        >
                            {isDetectingLocation ? 'Detecting...' : '📍 Use Current Location'}
                        </button>
                    </div>
                    <input
                        type='text'
                        id='addressline' 
                        className='border bg-blue-50 p-2 rounded'
                        {...register("addressline",{required : true})}
                    />
                    {coordinates && (
                        <p className='text-xs text-green-600'>
                            📍 Location detected - Delivery fee will be calculated based on distance
                        </p>
                    )}
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='city'>City :</label>
                    <input
                        type='text'
                        id='city' 
                        className='border bg-blue-50 p-2 rounded'
                        {...register("city",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='Address1'>Address 1 :</label>
                    <input
                        type='text'
                        id='Address1' 
                        className='border bg-blue-50 p-2 rounded'
                        {...register("address1",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='address2'>Address 2 :</label>
                    <input
                        type='text'
                        id='address2' 
                        className='border bg-blue-50 p-2 rounded'
                        {...register("address2",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='pincode'>Pincode :</label>
                    <input
                        type='text'
                        id='pincode' 
                        className='border bg-blue-50 p-2 rounded'
                        {...register("pincode",{required : false})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='country'>Country :</label>
                    <input
                        type='text'
                        id='country' 
                        className='border bg-blue-50 p-2 rounded'
                        {...register("country",{required : true})}
                    />
                </div>
                <div className='grid gap-1'>
                    <label htmlFor='mobile'>Mobile No. :</label>
                    <input
                        type='text'
                        id='mobile' 
                        className='border bg-blue-50 p-2 rounded'
                        {...register("mobile",{required : true})}
                    />
                </div>

                <button type='submit' className='bg-primary-200 w-full  py-2 font-semibold mt-4 hover:bg-primary-100'>Submit</button>
            </form>
        </div>
    </section>
  )
}

export default AddAddress