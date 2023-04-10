const mongoose = require('mongoose');


const SanPhamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    img: {
        data: Buffer,
        contentType: String
    },
    color: {
        type: String
    },
    typePr: {
        type: String,
        require: true
    },
    idKh:{
        type: String,
        require: true
    }
})

const SanPhamModel = new mongoose.model('sanpham',  SanPhamSchema);

module.exports = SanPhamModel;