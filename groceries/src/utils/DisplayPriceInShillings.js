export const DisplayPriceInShillings = (price)=>{
    return new Intl.NumberFormat('en-UG',{
        style : 'currency',
        currency : 'UGX'
    }).format(price)
}