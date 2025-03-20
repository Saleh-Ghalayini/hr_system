export const getStatusClass = (status) => {
    const green = ["Present","Active","Completed"];
    const yellow = ["Pending","In Progress","Not Started","Late"];
    return green.includes(status) ? "status-green" : 
           yellow.includes(status) ? "status-yellow" : 
           "status-red";
};

