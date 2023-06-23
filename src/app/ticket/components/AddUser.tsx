
import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import { RxCross2 } from 'react-icons/rx';
const FormData = require("form-data");

interface user_detail {
    ticket_id: string
}

const AddUser = (props: { _userdetail: user_detail }) => {

    const [userOptions, setUserOptions] = useState([{ value: "", label: "" }]);
    const [allreadyusermap, setAllreadyusermap] = useState(new Map());
    const viewTicketDetail = async () => {

        const response = await fetch(`http://localhost:3500/v1/ticketroutes/ticket_detail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticket_id: "645f25330a19047f7c02237d"
            })
        });
        const json = await response.json()
    }

    const [selectedOptions, setSelectedOptions] = useState([{ value: "", label: "" }]);

    const handleSelectChange = (selectedOption: any) => {
        setSelectedOptions(selectedOptions);
        console.log(selectedOption)
    };

    const [alreadyArrayAssingedUser, setAlreadyArrayAssingedUser] = useState([{ value: "", label: "" }]);
    // const show_assigned = (To: any) => {
    //     if (showAssigned) {
    //         setShowAssigned(false);
    //     }
    //     else {
    //         let l = [{ value: "", label: "" }];
    //         for (let i = 0; i < To.length; i++) {
    //             l.push(allreadyusermap.get(To[i]))
    //         }
    //         l.shift();
    //         setAlreadyArrayAssingedUser(l);
    //         setShowAssigned(true);
    //     }
    // }

    const getAllUser = async () => {

        const response = await fetch(`http://localhost:3500/v1/ticketroutes/get_user`, {
            method: 'Get'
        });
        const json = await response.json()
        setUserOptions(json.all_user);
    }

    useEffect(() => {
        // viewTicketDetail();
        getAllUser();
    }, [])
    return (
        <div className="modal fade" tabIndex={-1} id="kt_modal_5">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add User</h5>
                        <div
                            className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        >
                        </div>
                    </div>
                    <div className="modal-body">
                        <Select
                            defaultValue={alreadyArrayAssingedUser}
                            isMulti
                            name="name"
                            onChange={handleSelectChange}
                            options={userOptions}
                            className="basic-multi-select"
                            classNamePrefix="select"
                        />
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-light"
                            data-bs-dismiss="modal"
                        >
                            Close
                        </button>
                        <button type="button" className="btn btn-primary">
                            Save changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
        // <div className="modal fade my-5" tabIndex={-1} id="kt_modal_5">

        //     <div className="modal-dialog">
        //         <div className="modal-content" style={{ width: "750px" }}>
        //             <div className="modal-header">
        //                 <h5 className="modal-title">Add User</h5>
        //                 <div
        //                     className="btn btn-icon btn-sm btn-active-light-primary ms-2"
        //                     data-bs-dismiss="modal"
        //                     aria-label="Close"
        //                 >
        //                     <RxCross2 style={{ width: "20px", height: "20px" }} />
        //                 </div>
        //             </div>
        //             <div className="modal-body">
        //                 <div>
        //                     <div className="card">
        //                         <div className="card-body">
        //                             {/* ------------- */}
        //                             <div className="container my-5" style={{ width: "680px" }}>
        //                                 {/* <p>Ticket Id - {props._userdetail.ticket_id}</p> */}
        //                                 {/* begin::Form group groupname */}
        //                                 <div className='row fv-row mb-7'>
        //                                     <div className='col-xl-6'>
        //                                         <div className="mb-10">
        //                                             <label className="required form-label my-2">Enter User Name</label>
        //                                             <select className="form-select" name="_sortstatus" defaultValue={'DEFAULT'} aria-label="Default select example">
        //                                                 <option value="Default">Add To</option>
        //                                                 <option value="value">Open</option>
        //                                                 <option value="value">Progress</option>
        //                                                 <option value="value">Close</option>
        //                                             </select>
        //                                         </div>
        //                                     </div>
        //                                     <div className='col-xl-6 my-5'>
        //                                         <div className="mb-10">
        //                                             <button style={{ width: "90px" }} className="btn btn-primary text-center my-5">ADD</button>
        //                                         </div>
        //                                     </div>
        //                                 </div>
        //                                 {/* end::Form group */}
        //                             </div >
        //                             {/* ------------- */}
        //                         </div>
        //                     </div>
        //                     <button
        //                         type="button"
        //                         className="btn btn-danger"
        //                         data-bs-dismiss="modal"
        //                     >
        //                         Close
        //                     </button>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div >
    )
}

export default AddUser


