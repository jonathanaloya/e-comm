import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addAddressController, deleteAddresscontroller, getAddressController, updateAddressController } from '../controllers/addressController.js'

const addressRouter = Router()

addressRouter.post('/create',authMiddleware,addAddressController)
addressRouter.get("/get",authMiddleware,getAddressController)
addressRouter.put('/update',authMiddleware,updateAddressController)
addressRouter.delete("/disable",authMiddleware,deleteAddresscontroller)

export default addressRouter