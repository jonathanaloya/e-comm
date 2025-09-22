import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    address_line : {
        type: String,
        default: ""
    },

    city : {
        type: String,
        default: ""
    },

    state : {
        type: String,
        default: ""
    },

    address1 : {
        type: String,
        default: ""
    },

    address2 : {
        type: String,
        default: ""
    },

    pincode : {
        type: String,
    },

    country : {
        type: String,
    },

    mobile : {
        type: Number,
        default: null
    },

    status : {
        type: Boolean,
        default: true
    },

    userId : {
        type : mongoose.Schema.ObjectId,
        default : ""
    },

    coordinates : {
        lat: {
            type: Number,
            default: null
        },
        lng: {
            type: Number,
            default: null
        }
    },

    distance : {
        type: Number,
        default: null // Distance in kilometers from store
    }
},{
    timestamps : true
})

const Address = mongoose.model('address', addressSchema)

export default Address