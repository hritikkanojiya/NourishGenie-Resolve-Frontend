import React, { useEffect, useState } from 'react'
import clsx from "clsx";
import CreateTicket from './CreateTicket';
import SendRemainder from '../components/SendRemainder';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
// import Menu from '@material-ui/core/Menu';
// import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import { RxCross2 } from 'react-icons/rx';
import { FcHighPriority } from 'react-icons/fc';
import { FcLowPriority } from 'react-icons/fc';
import { FcMediumPriority } from 'react-icons/fc';
import { AiFillCaretDown } from 'react-icons/ai';
import Select from 'react-select';
import CopyToClipboard from "react-copy-to-clipboard";
import { PaginationComponent } from "../../common/components/pagination/PaginationComponent";
import { showToast } from "../../common/toastify/toastify.config";
import { ToastContainer, toast } from "react-toastify";
import { BiRefresh } from 'react-icons/bi';
import ButtonGroup from '@mui/material/ButtonGroup';
import Input from '@mui/material/Input';
import Tooltip from '@mui/material/Tooltip';
import { useParams } from 'react-router-dom';
import {
    REACT_APP_GENIE_RESOLVE_API,
    REACT_APP_GENIE_RESOLVE_VERSION,
    onChangeSortObj,
    sortObj,
} from "../../common/globals/common.constants";

const useStyles = makeStyles(theme => ({
    margin: {
      margin: theme.spacing(1),
    },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
  }));

  const ariaLabel = { 
    'aria-label': 'description',
    // endAdornment: (
    //     <InputAdornment>
    //       <IconButton>
    //         <SearchIcon />
    //       </IconButton>
    //     </InputAdornment>
    //   )
 };

const Home = () => {

    const classes = useStyles();

    const page = 1;
    const currentPage = 1;
    const [state, setState] = useState<{
        appAgents: string;
        agentsCount: number;
    }>({
        appAgents: '',
        agentsCount: 0,
    });
    const [paginationState, setPaginationState] = useState({
        itemsPerPage: 10,
        showingFrom: 1,
        showingTill: 10,
        page: page ? page : currentPage,
    });

    const [sortState, setSortState] = useState<sortObj>({
        sortBy: null,
        sortOn: null,
    });

    const params = useParams();

    const userId = params.userId;

    const [idsdetail, setIdsdetail] = useState({
        sender_id: userId,
        reciever_id: [],
        setUser: false
    });

    const [currentTicketId, setcurrentTicketId] = useState("");
    const [userOptions, setUserOptions] = useState([{ value: "", label: "" }]);
    const [selectedOptions, setSelectedOptions] = useState([{ value: "", label: "" }]);
    const [sortpriority, setSortpriority] = useState("");
    const [sortcategory, setSortcategory] = useState("");
    const [sortstatus, setSortstatus] = useState("");
    const [mappriority, setMappriority] = useState(new Map());
    // const [mapcategory, setMapcategory] = useState(new Map());
    const [mapstatus, setMapstatus] = useState(new Map());
    const [allreadyusermap, setAllreadyusermap] = useState(new Map());
    const [priority1, setPriority1] = useState([{ _id: "", name: "", color: "" }]);
    const [category1, setCategory1] = useState([{ _id: "", name: "" }]);
    const [status1, setStatus1] = useState([{ _id: "", name: "" }]);
    const [svalue, setSvalue] = useState("");
    const [allticket, setAllTicket] = useState([{ _id: "", subject: "", content: "", To: [], priority: "", category: "", status: "", complete: 0 }])
    const getAllTicket = async (page: number, limit: number, opt = 0) => {

        if (svalue) {
            searchTicket();
            return;
        }
        if ((sortpriority || sortstatus) && opt == 0) {
            sortPriority(page, limit);
            return;
        }

        // console.log(REACT_APP_GENIE_RESOLVE_API, REACT_APP_GENIE_RESOLVE_VERSION, "REACT_APP_GENIE_RESOLVE_VERSION");
        const response = await fetch(`${REACT_APP_GENIE_RESOLVE_API}/${REACT_APP_GENIE_RESOLVE_VERSION}/ticketroutes/all_ticket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                From: userId,
                page: page,
                limit: limit,
                sortOn: sortState.sortOn,
                sortBy: sortState.sortBy
            })
        });
        const json = await response.json()
        const ticket_priority = new Map();
        const ticket_category = new Map();
        const ticket_status = new Map();
        const ticket_priority1 = [];
        const ticket_category1 = [];
        const ticket_status1 = [];
        // const allready_user = [{ value: '', label: '' }];

        // setAllreadyuserOptions(allready_user);
        for (let i = 0; i < json.priority_detail.length; i++) {
            ticket_priority.set(json.priority_detail[i]._id, [json.priority_detail[i].name, json.priority_detail[i].color]);
            ticket_priority1.push({ _id: json.priority_detail[i]._id, name: json.priority_detail[i].name, color: json.priority_detail[i].color });
        }
        for (let i = 0; i < json.category_detail.length; i++) {
            ticket_category.set(json.category_detail[i]._id, [json.category_detail[i].name, json.category_detail[i].color]);
            ticket_category1.push({ _id: json.category_detail[i]._id, name: json.category_detail[i].name });
        }
        for (let i = 0; i < json.status_detail.length; i++) {
            ticket_status.set(json.status_detail[i]._id, [json.status_detail[i].name, json.status_detail[i].color]);
            ticket_status1.push({ _id: json.status_detail[i]._id, name: json.status_detail[i].name });
        }
        setMappriority(ticket_priority);
        setMapstatus(ticket_status);
        setPriority1(ticket_priority1);
        setCategory1(ticket_category1);
        setStatus1(ticket_status1);

        let totalRecords = json.all_ticket.length;
        setState((previousState: any) => {
            return {
                ...previousState,
                appAgents: showingFrom,
                agentsCount: json.total_ticket,
            };
        });
        let showingFrom = (page - 1) * limit + 1;
        let showingTill: any;
        if (totalRecords) {
            showingTill = Math.min(json.total_ticket, page * limit);
        }
        setPaginationState((previousState: any) => {
            return {
                ...previousState,
                showingFrom: showingFrom,
                showingTill: showingTill,
            };
        });
        setAllTicket(json.all_ticket);
    }

    const sortPriority = async (page: number, limit: number) => {
        const response = await fetch(`${REACT_APP_GENIE_RESOLVE_API}/${REACT_APP_GENIE_RESOLVE_VERSION}/ticketroutes/all_category_ticket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                From: userId,
                priority: sortpriority,
                status: sortstatus,
                page: page,
                limit: paginationState.itemsPerPage
            })
        });
        const json = await response.json()
        let totalRecords = json.all_category_ticket.length;
        setState((previousState: any) => {
            return {
                ...previousState,
                appAgents: showingFrom,
                agentsCount: json.total_ticket,
            };
        });
        let showingFrom = json.total_ticket > 0 ? (page - 1) * limit + 1 : 0;
        let showingTill: any;
        if (totalRecords) {
            showingTill = Math.min(json.total_ticket, page * limit);
        }
        setPaginationState((previousState: any) => {
            return {
                ...previousState,
                showingFrom: showingFrom,
                showingTill: showingTill,
            };
        });
        setAllTicket(json.all_category_ticket);
    }
    // const sortCategory = async (e: any) => {
    //     setSortcategory(e.target.value);
    //     const response = await fetch(`${REACT_APP_GENIE_RESOLVE_API}/${REACT_APP_GENIE_RESOLVE_VERSION}/ticketroutes/all_category_ticket`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             From: userId,
    //             category: e.target.value
    //         })
    //     });
    //     const json = await response.json()
    //     setAllTicket(json.all_category_ticket);
    // }
    // const sortStatus = async (e: any) => {
    //     setSortcategory(e.target.value);
    //     const response = await fetch(`${REACT_APP_GENIE_RESOLVE_API}/${REACT_APP_GENIE_RESOLVE_VERSION}/ticketroutes/all_status_ticket`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             From: userId,
    //             status: e.target.value
    //         })
    //     });
    //     const json = await response.json()
    //     setAllTicket(json.all_category_ticket);
    // }

    const sort_Priority = (e: any) => {
        setSortpriority(e.target.value);
    }

    const sort_Status = (e: any) => {
        setSortstatus(e.target.value);
    }
    const onChange = (e: any) => {
        setSvalue(e.target.value);
    }
    const searchTicket = async () => {
        const response = await fetch(
            `${REACT_APP_GENIE_RESOLVE_API}/${REACT_APP_GENIE_RESOLVE_VERSION}/ticketroutes/all_search_ticket`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    From: userId,
                    searchValue: svalue,
                    page: paginationState.page,
                    limit: paginationState.itemsPerPage
                })
            }
        );
        const json = await response.json();
        let totalRecords = json.all_search_ticket.length;
        setState((previousState: any) => {
            return {
                ...previousState,
                appAgents: showingFrom,
                agentsCount: json.total_ticket,
            };
        });
        let showingFrom = (paginationState.page - 1) * paginationState.itemsPerPage + 1;
        let showingTill: any;
        if (totalRecords) {
            showingTill = Math.min(json.total_ticket, paginationState.page * paginationState.itemsPerPage);
        }
        setPaginationState((previousState: any) => {
            return {
                ...previousState,
                showingFrom: showingFrom,
                showingTill: showingTill,
            };
        });
        setAllTicket(json.all_search_ticket);
    }

    const updatePriority = async (ticket_id: string, next_priority: any) => {
        const response = await fetch(
            `${REACT_APP_GENIE_RESOLVE_API}/${REACT_APP_GENIE_RESOLVE_VERSION}/ticketroutes/update_priority`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ticket_id: ticket_id,
                    next_priority: next_priority.target.value
                })
            }
        );
        const json = await response.json();
    }

    const updateCompletedPercent = async (ticket_id: string, next_completion: any) => {
        const response = await fetch(
            `${REACT_APP_GENIE_RESOLVE_API}/${REACT_APP_GENIE_RESOLVE_VERSION}/ticketroutes/update_completion`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ticket_id: ticket_id,
                    next_completion: Number(next_completion.target.value)
                })
            }
        );
        const json = await response.json();
        getAllTicket(paginationState.page, paginationState.itemsPerPage);
    }

    const [showFilter, setShowFilter] = useState(false)
    const show_filter = () => {
        if (showFilter) {
            setShowFilter(false);
        }
        else {
            setShowFilter(true);
        }
    }

    const [showAddUser, setShowAddUser] = useState(false)
    const [showAssigned, setShowAssigned] = useState(false)
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

    // const show_assigned_value = () => {

    // }

    const show_added_user = (To: any, ticket_id: any) => {
        if (showAddUser) {
            setShowAddUser(false);
        }
        else {
            let l = [{ value: "", label: "" }];
            for (let i = 0; i < To.length; i++) {
                l.push(allreadyusermap.get(To[i]))
            }
            l.shift();
            setAlreadyArrayAssingedUser(l);
            setShowAddUser(true);
            setcurrentTicketId(ticket_id);
        }
    }

    const onPageChange = (page: any) => {
        page = page.selected;
        setPaginationState((previousState) => {
            return { ...previousState, page: page + 1 };
        });
        getAllTicket(page + 1, paginationState.itemsPerPage);
    };

    const handleSelectChange = (selectedOption: any) => {
        setSelectedOptions(selectedOption);
    };

    const getAllUser = async () => {

        const response = await fetch(`${REACT_APP_GENIE_RESOLVE_API}/${REACT_APP_GENIE_RESOLVE_VERSION}/ticketroutes/get_user`, {
            method: 'Get'
        });
        const json = await response.json()
        const already_user = new Map();
        for (let i = 0; i < json.all_user.length; i++) {
            already_user.set(json.all_user[i].value, { value: json.all_user[i].value, label: json.all_user[i].label });
        }
        setAllreadyusermap(already_user);
        setUserOptions(json.all_user);

    }

    const onClickTableHeader = (event: any) => {
        const newSortObj = onChangeSortObj(event, sortState);
        setSortState({
            sortBy: newSortObj.sortBy,
            sortOn: newSortObj.sortOn
        });
    };

    const add_user = async () => {
        let new_add_user = [];
        for (let i = 0; i < selectedOptions.length; i++) {
            new_add_user.push(selectedOptions[i].value);
        }
        const response = await fetch(
            `${REACT_APP_GENIE_RESOLVE_API}/${REACT_APP_GENIE_RESOLVE_VERSION}/ticketroutes/add_user`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ticket_id: currentTicketId,
                    added_user: new_add_user
                })
            }
        );
        const json = await response.json();
        if (json.message == 'success') {
            getAllTicket(paginationState.page, paginationState.itemsPerPage);
            showToast("Added User Successfully", "success");
            setShowAddUser(false);
        }
        else {
            showToast(json.reason.message, "error");
        }
    }

    const [authUser, setAuthUser] = useState(true)
    const verify_user = async () => {
        const response = await fetch(
            `${REACT_APP_GENIE_RESOLVE_API}/${REACT_APP_GENIE_RESOLVE_VERSION}/auth/user/verify_user`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId
                })
            }
        );
        const json = await response.json();
        if (json.message !== 'success') {
            showToast(json.error.message, "error");
            setAuthUser(false);
        }
    }

    const [showPriorityBar, setShowPriorityBar] = useState(false)
    const show_priority_bar = () => {
        if (showPriorityBar) {
            setShowPriorityBar(false);
        }
        else {
            // setAlreadyArrayAssingedUser(l);
            setShowPriorityBar(true);
            // setcurrentTicketId(ticket_id);
        }
    }

    useEffect(() => {
        verify_user();
        getAllUser();
        getAllTicket(1, 10);
    }, [
        sortState.sortOn,
        sortState.sortBy,
        svalue
    ])
    return (
        <>
            {!authUser && <h5 className="text-center">You are not authorized user</h5>}
            {authUser && <div className="card">
                <ToastContainer />
                <SendRemainder _ids={idsdetail} />
                <div className="card-header py-5">
                    <div className="card-title">
                        <select
                            className="form-select form-select-solid mx-2"
                            data-kt-select2="true"
                            data-placeholder="Show records"
                            defaultValue={10}
                            onChange={(e: any) => {
                                setPaginationState((prevState) => {
                                    return {
                                        ...prevState,
                                        itemsPerPage: Number(e.target.value),
                                    };
                                });
                                getAllTicket(paginationState.page, Number(e.target.value));
                            }}
                        >
                            <option value="10">10 Records</option>
                            <option value="15">15 Records</option>
                            <option value="25">25 Records</option>
                            <option value="50">50 Records</option>
                        </select>
                        <div className="my-4 mx-5">
                            <i className="fas fa-search" data-bs-toggle="modal" data-bs-target="#kt_modal_8"
                                style={{ fontSize: "22px", cursor: "pointer" }}></i>
                            <div className="modal fade my-5" tabIndex={-1} id="kt_modal_8">

                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header" style={{ height: "10px" }}>
                                            <div>
                                                <div className="input-group">
                                                    <input type="search" style={{ width: "350px" }} name="search" onChange={onChange} id="search" className="form-control border-0" placeholder="Type here and click on Search" aria-label="Search" aria-describedby="search-addon" />
                                                    <i className="fas fa-search mx-3 my-3" onClick={searchTicket} style={{ fontSize: "20px", color: "blue", cursor: "pointer" }}></i>
                                                </div>
                                            </div>
                                            <div
                                                className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            >
                                                <RxCross2 style={{ width: "20px", height: "20px", color: "red" }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div >
                            {/* -------------------- */}
                        </div>
                        <div className="my-3">
                            <BiRefresh style={{ fontSize: "30px", cursor: "pointer" }} onClick={() => {
                                sortState.sortOn = null;
                                sortState.sortBy = null;
                                setSortstatus("");
                                setSortpriority("");
                                setSvalue("");
                                getAllTicket(paginationState.page, paginationState.itemsPerPage, 1);
                            }} />
                        </div>
                    </div>

                    <div className="card-toolbar">
                        <div
                            className="d-flex justify-content-end"
                            data-kt-customer-table-toolbar="base"
                        >
                            <div className="d-flex align-items-center gap-2 gap-lg-3">
                                <div className="m-0">
                                    <i className="fas fa-filter mx-4"
                                        onClick={show_filter}
                                        style={{ fontSize: "22px", cursor: "pointer" }}></i>
                                    {showFilter && <div
                                        className="menu menu-sub menu-sub-dropdown w-250px w-md-300px show"
                                        style={{ zIndex: "105", position: "fixed", inset: "0px auto auto", margin: "0px", transform: "translate3d(-50%, 70px, 0px)" }}
                                    >
                                        <div className="px-7 py-5">
                                            <div className="fs-5 text-dark fw-bolder">Filter Options</div>
                                        </div>
                                        <div className="separator border-gray-200"></div>
                                        <div className="px-7 py-5">
                                            <div className="mb-10">
                                                <label className="form-label fw-bold">Priority:</label>
                                                <div>
                                                    <select
                                                        onChange={sort_Priority}
                                                        name="_sortprioriy"
                                                        className="form-select form-select-solid"
                                                        data-kt-select2="true"
                                                        data-placeholder="Select option"
                                                        data-allow-clear="true"
                                                    >
                                                        <option value="">Filter Priority</option>
                                                        {priority1?.map(_priority1 =>
                                                            <option value={_priority1._id}>{_priority1.name}</option>
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mb-10">
                                                <label className="form-label fw-bold">Status:</label>
                                                <div>
                                                    <select
                                                        onChange={sort_Status}
                                                        name="_sortstatus"
                                                        className="form-select form-select-solid"
                                                        data-kt-select2="true"
                                                        data-placeholder="Select option"
                                                        data-allow-clear="true"
                                                    >
                                                        <option value="">Filter Status</option>
                                                        {status1?.map(_status1 =>
                                                            <option value={_status1._id}>{_status1.name}</option>
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-end">
                                                <button
                                                    onClick={show_filter}
                                                    className="btn btn-sm btn-light btn-active-light-primary me-2"
                                                    data-kt-menu-dismiss="true"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    type="submit"
                                                    onClick={() => { sortPriority(1, paginationState.itemsPerPage); show_filter() }}
                                                    className="btn btn-sm btn-primary"
                                                    data-kt-menu-dismiss="true"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    </div>}
                                </div>
                                <CreateTicket loginUserId={userId} />
                            </div>

                        </div>
                    </div>
                </div>
                <div className="card-body pt-0">
                    <div className="py-3">
                        <table className="table align-middle table-row-dashed table-responsive fs-6 gy-2">
                            <thead>
                                <tr className="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
                                    <th className="min-w-125px text-center text-black-50">ID</th>
                                    <th
                                        id="subject"
                                        onClick={onClickTableHeader}
                                        className={clsx(
                                            "min-w-125px table-sort cursor-pointer text-center text-black-50",
                                            {
                                                "table-sort-asc":
                                                    sortState.sortOn === "subject" &&
                                                    sortState.sortBy === "asc",
                                            },
                                            {
                                                "table-sort-desc":
                                                    sortState.sortOn === "subject" &&
                                                    sortState.sortBy === "desc",
                                            }
                                        )}>Title</th>
                                    <th className="min-w-125px text-center text-black-50">Assigned To</th>
                                    <th className="min-w-125px text-center text-black-50">Update Priority</th>
                                    <th className="min-w-125px text-center text-black-50">Completed %</th>
                                    <th className="min-w-125px text-center text-black-50">Stauts</th>
                                    <th className="min-w-125px text-center text-black-50">Send Remainder</th>
                                </tr>
                            </thead>
                            <tbody className="fw-semibold text-gray-600">
                                {allticket?.map(ticket => <tr>
                                    <td className="mw-50px text-center cursor-pointer">
                                        <CopyToClipboard onCopy={(text, result) => {
                                            result && showToast("ID copied to clipboard", "success")
                                        }} text={ticket._id || ""}>
                                            <Tooltip title="Click Here To Copy" placement="top">
                                                <span className="badge badge-light-dark text-hover-primary text-gray-700 mb-1 my-4">
                                                    NG{`${ticket.category.trim().split(" ").length == 1 ? ticket.category.slice(0, 2)?.toUpperCase() : ticket.category.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '')?.toUpperCase()}`}-{`${ticket._id?.substring(0, 10)}...`}
                                                    {/* NG{`${ticket.category.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '')?.toUpperCase()}`}-{`${ticket._id?.substring(0, 10)}...`} */}
                                                </span>
                                            </Tooltip>
                                        </CopyToClipboard>
                                    </td>
                                    <td className="text-center">
                                        <span className="text-gray-800 mb-1">
                                            {ticket.subject}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <p className="my-4" style={{ cursor: "pointer", fontWeight: "bold" }} onClick={() => show_added_user(ticket.To, ticket._id)}>
                                            <ListItemIcon>
                                                <AssignmentIndIcon style={{ fontSize: "25px" }} />
                                            </ListItemIcon>
                                        </p>
                                        {showAddUser && <div
                                            className="menu menu-sub menu-sub-dropdown w-250px w-md-300px show"
                                            style={{ zIndex: "105", position: "fixed", inset: "0px auto auto", margin: "0px", transform: "translate(-100%, 80px)" }}
                                        >
                                            <div className="px-7 py-5">
                                                <div className="fs-5 text-dark fw-bolder">Add User</div>
                                            </div>
                                            <div className="separator border-gray-200"></div>
                                            <div className="px-7 py-5">
                                                <label className="required form-label my-3">Select Add User</label>
                                                <Select
                                                    defaultValue={alreadyArrayAssingedUser}
                                                    isMulti
                                                    name="name"
                                                    onChange={handleSelectChange}
                                                    options={userOptions}
                                                    className="basic-multi-select"
                                                    classNamePrefix="select"
                                                />
                                                <div className="d-flex justify-content-end">
                                                    <button
                                                        onClick={() => show_added_user(ticket.To, ticket._id)}
                                                        className="btn btn-sm btn-light btn-active-light-primary me-2 my-5"
                                                        data-kt-menu-dismiss="true"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        onClick={() => add_user()}
                                                        className="btn btn-sm btn-primary my-5"
                                                        data-kt-menu-dismiss="true"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>}
                                    </td>
                                    <td style={{cursor: "pointer"}} className="text-center" onClick={show_priority_bar}>
                                        {/* <select style={{ width: "110px" }} className="form-select form-select-solid" onChange={(e) => updatePriority(ticket._id, e)} name="priority" defaultValue={'DEFAULT'} aria-label="Default select example">
                                        <option value={ticket.priority}>{mappriority.get(ticket.priority)?.[0]}</option>
                                        {priority1?.map(_priority1 =>
                                            <option style={{ color: `${_priority1.color}` }} value={_priority1._id}> {_priority1.name} </option>
                                        )}
                                    </select> */}
                                    {mappriority.get(ticket.priority)?.[0]} <AiFillCaretDown style={{marginLeft: "50px"}}/>
                                        {showPriorityBar && <div
                                                className="menu menu-sub menu-sub-dropdown w-150px w-md-250px show"
                                                style={{ zIndex: "105", position: "fixed", inset: "0px auto auto", margin: "0px", transform: "translate(-50%, 80px)" }}
                                            >
                                                {/* <div className="px-7 py-5">                                                    
                                                </div> */}
                                                <div className="separator border-gray-200"></div>
                                                <div className="px-7 py-5">
                                                <div className="row my-1" style={{cursor: "pointer"}}><div className="col-md-4"><FcLowPriority /></div><div  className="col-md-4">Low</div></div>
                                                <div className="row my-3" style={{cursor: "pointer"}}><div className="col-md-4"><FcMediumPriority /></div><div className="col-md-4">Medium</div></div>
                                                <div className="row my-1" style={{cursor: "pointer"}}><div className="col-md-4"><FcHighPriority /></div><div className="col-md-4">High</div></div>
                                                {priority1?.map(_priority1 =>
                                            // <option style={{ color: `${_priority1.color}` }} value={_priority1._id}> {_priority1.name} </option>
                                                <>
                                                {_priority1.name=="Low" && <div onClick={(e) => updatePriority(ticket._id, e)} className="row my-1" style={{cursor: "pointer"}}><div className="col-md-4"><FcLowPriority /></div><div  className="col-md-4">Low</div></div>}
                                                {_priority1.name=="Medium" && <div onClick={(e) => updatePriority(ticket._id, e)} className="row my-1" style={{cursor: "pointer"}}><div className="col-md-4"><FcMediumPriority /></div><div  className="col-md-4">Medium</div></div>}
                                                {_priority1.name=="High" && <div onClick={(e) => updatePriority(ticket._id, e)} className="row my-1" style={{cursor: "pointer"}}><div className="col-md-4"><FcHighPriority /></div><div  className="col-md-4">High</div></div>}
                                                </>
                                        )}
                                                    <div className="d-flex justify-content-end">
                                                    </div>
                                                </div>
                                            </div>}
                                    </td>
                                    <td className="text-center">
                                        <div className="row text-center" style={{ marginLeft: "5px" }}>
                                            <div className="col padding-0">
                                                <div className='d-flex flex-stack mb-2'>
                                                    <span className='text-muted me-2 fs-7 fw-semibold'>{ticket.complete}%</span>
                                                </div>
                                                <div className="d-flex">
                                                    <div className='progress h-6px w-100'>
                                                        <div
                                                            className='progress-bar bg-success'
                                                            role='progressbar'
                                                            style={{ width: `${ticket.complete}%` }}
                                                        >
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col padding-0">
                                                <select style={{ height: "7px", width: "6px" }} className="form-select my-4" onChange={(e) => updateCompletedPercent(ticket._id, e)} name="sendto" defaultValue={'DEFAULT'} aria-label="Default select example">
                                                    {/* <option value="Default">{ticket.complete}</option> */}
                                                    <option value="0">0%</option>
                                                    <option value="25">25%</option>
                                                    <option value="50">50%</option>
                                                    <option value="75">75%</option>
                                                    <option value="100">100%</option>
                                                    {/* {(mappriority.get(ticket.complete) !== 0) && <option value="0">0%</option>}
                                                    {(mappriority.get(ticket.complete) !== 25) && <option value="25">25%</option>}
                                                    {(mappriority.get(ticket.complete) !== 50) && <option value="50">50%</option>}
                                                    {(mappriority.get(ticket.complete) !== 75) && <option value="75">75%</option>}
                                                    {(mappriority.get(ticket.complete) !== 100) && <option value="100">100%</option>} */}
                                                </select>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="mw-50px text-center">
                                        <span style={{ color: `${mapstatus.get(ticket.status)?.[1]}` }} className="badge badge-sm badge-square badge-light-primary my-4">
                                            {mapstatus.get(ticket.status)?.[0]}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <Tooltip title="Send Remainder">
                                            <ButtonGroup data-bs-toggle="modal" data-bs-target="#kt_modal_10" variant="contained" aria-label="outlined primary button group">
                                                <Button onClick={() => { setIdsdetail({ sender_id: userId, reciever_id: ticket.To, setUser: true }) }} className="btn btn-icon btn-light btn-hover-primary btn-sm"><ScheduleSendIcon className="svg-icon svg-icon-md svg-icon-primary" /></Button>
                                            </ButtonGroup>
                                        </Tooltip>
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                        {allticket.length === 0 && <p className="text-bold text-center my-5">-----------------------------You Are Not Created Any Ticket-----------------------------</p>}
                    </div>
                    <PaginationComponent
                        onPageChange={onPageChange}
                        pageCount={Math.ceil(
                            state.agentsCount / paginationState.itemsPerPage
                        )}
                        showingFrom={paginationState.showingFrom}
                        showingTill={paginationState.showingTill}
                        totalRecords={state.agentsCount}
                    />
                </div >
            </div >}
        </>
    )
}

export default Home