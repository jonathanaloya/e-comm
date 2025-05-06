export const DisplayPriceInShillings = (price)=>{
    return new Intl.NumberFormat('en-IN',{
        style : 'currency',
        currency : 'UGX'
    }).format(price)
}