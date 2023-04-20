let path = "https://purchase-pal.herokuapp.com";

export const GETALLREMINDERS = ()=>{ return fetch(`${path}/reminders`,{
        method:"GET"
    })
}


export const GETSENTREMINDERS = ()=>{return fetch(`${path}/reminders/sent`,{
        method:"GET"
    })
}

export const GETPENDINGREMINDERS = ()=>{return fetch(`${path}/reminders/pending`,{
        method:"GET"
    })
}

export const GETGRAPHDATA = ()=>{return fetch(`${path}/reminders/getgraphdatabyday`,{
        method:"GET"
    })
}

export const GETREVENUE = ()=>{return fetch(`${path}/getrevenue`,{
    method:"GET"
})
}


    // Products

export const GETPRODUCTS = (pn)=>{ return fetch(`${path}/remindersbyproducts?page=${pn}`,{
        method:"GET"
    })
}

    // Configuration
export const GETEMAILTEMPLATE = ()=>{ return fetch(`${path}/configuration/emailtemplate`,{
        method:"GET"
    })
}

export const SAVEEMAILTEMPLATE = (data)=>{ fetch(`${path}/configuration/emailtemplate`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
    })
}
    
export const GETCONFIGBYKEY = (key)=>{ return fetch(`${path}/configuration/getbykey/${key}`,{
        method:"GET"
    })
}

export const UPDATECONFIGBYKEY = (data)=>{ fetch(`${path}/configuration/updatebykey`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
    })
}

export const GETCUSTOMERS = ()=>{ return fetch(`${path}/getcustomers`,{
        method:"GET"
    })
}

export const GETCUSTOMERSBYPRODUCT = (pid)=>{ return fetch(`${path}/getcustomersbyproduct`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(pid),
    })
}
export const GETPRODUCTBYID = (pid)=>{ return fetch(`${path}/productbyid`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(pid),
})
}

export const GETUSERPLAN = ()=>{ return fetch(`${path}/getuserplan`,{
        method:"GET"
    })
}

export const GETNEWREMINDERS = ()=>{ return fetch(`${path}/getnewreminders`,{
        method:"GET"
    })
}

export const SUBSCRIBEPLAN = (data)=>{ return fetch(`${path}/subscribe`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
    })
}

export const THEMEHELP = (data)=>{ return fetch(`${path}/themehelp`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data),
})
}

export const GETTHEMES = ()=>{ return fetch(`${path}/getthemes`,{
        method:"GET",
    })
}

export const APPLYTHEME = (data)=>{ return fetch(`${path}/applytheme`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
    })
}

export const REMOVETHEME = (data)=>{ return fetch(`${path}/removetheme`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
    })
}
export const GETALLREMINDERSBYCUSTOMERS = (data)=>{ return fetch(`${path}/getallremindersbycustomers`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
    })
}

export const GETALLREMINDERSBYEMAIL = (data)=>{ return fetch(`${path}/getallreminders`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
    })
}

export const CHECKCOUPON = (data)=>{ return fetch(`${path}/checkcoupon`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data),
})
}
