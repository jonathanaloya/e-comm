import Address from "../models/addressModel.js";
import User from "../models/userModel.js"; 

export const addAddressController = async(req, res)=>{
    try {
        const userId = req.userId // middleware
        const { address_line , city, address1, address2, pincode, country, mobile } = req.body

        const createAddress = new Address({
            address_line,
            city,
            address1,
            address2,
            country,
            pincode,
            mobile,
            userId : userId 
        })
        const saveAddress = await createAddress.save()

        const addUserAddressId = await User.findByIdAndUpdate(userId,{
            $push : {
                address_details : saveAddress._id
            }
        })

        return res.json({
            message : "Address Created Successfully",
            error : false,
            success : true,
            data : saveAddress
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getAddressController = async(req,res)=>{
    try {
        const userId = req.userId // middleware auth

        const data = await Address.find({ userId : userId }).sort({ createdAt : -1})
        console.log('Backend: Fetched addresses for user', userId, ':', data.length, 'addresses')
        console.log('Backend: Address statuses:', data.map(addr => ({ id: addr._id, status: addr.status })))

        return res.json({
            data : data,
            message : "Address Fetched Successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const updateAddressController = async(req,res)=>{
    try {
        const userId = req.userId // middleware auth 
        const { _id, address_line,city,Address1, Address2,country,pincode, mobile } = req.body 

        const updateAddress = await Address.updateOne({ _id : _id, userId : userId },{
            address_line,
            city,
            Address1,
            Address2,
            country,
            mobile,
            pincode
        })

        return res.json({
            message : "Address Updated Successfully",
            error : false,
            success : true,
            data : updateAddress
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteAddresscontroller = async(req,res)=>{
    try {
        const userId = req.userId // auth middleware
        const { _id } = req.body

        console.log('Backend: Disabling address', _id, 'for user', userId)

        const disableAddress = await Address.updateOne({ _id : _id, userId},{
            status : false
        })

        console.log('Backend: Address disable result:', disableAddress)

        return res.json({
            message : "Address Deleted Successfully",
            error : false,
            success : true,
            data : disableAddress
        })
    } catch (error) {
        console.error('Backend: Error disabling address:', error)
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
