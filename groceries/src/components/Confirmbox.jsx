
import { IoClose } from 'react-icons/io5'

function Confirmbox({cancel, confirm, close}) {
  return (
    <div className='fixed top-0 right-0 bottom-0 left-0 z-50 bg-neutral-800 bg-opacity-70 p-4 flex justify-center items-center'>
        <div className='bg-white w-full max-w-md p-4 rounded'>
            <div className='flex justify-between items-center gap-3'>
                <h1 className='font-semibold'>Delete Permanently</h1>
                <button>
                    <IoClose size={25} onClick={close}/>
                </button>
            </div>
            <p className='my-4'>Are you sure you want to delete this item?</p>
            <div className='w-fit ml-auto flex items-center gap-3'>
                <button onClick={cancel} className='px-4 py-2 border rounded border-red-500 text-red-500 hover:bg-red-500 hover:text-white'>Cancel</button>
                <button onClick={confirm} className='px-4 py-2 border rounded border-green-500 text-green-500 hover:bg-green-500 hover:text-white'>Confirm</button>
            </div>
        </div>
    </div>
  )
}

export default Confirmbox