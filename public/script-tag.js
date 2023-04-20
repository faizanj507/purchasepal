
let APIHOST = "https://purchase-pal.herokuapp.com";

function init(){
    let rooting = document.getElementsByTagName("body")[0];
    // let mainbtn = document.createElement("button");
    // mainbtn.setAttribute("id","reminder-btn");
    // mainbtn.setAttribute("onclick","modalshow()");
    // mainbtn.setAttribute("class","reminder-btn");
    // mainbtn.innerHTML = "Remind Me!";
    
    // create html from string
    let convertstringtohtml = (string) => {
        let div = document.createElement("div");
        div.innerHTML = string.trim();
        return div.firstChild;
    }


    fetch(`${APIHOST}/configuration/getbykey/ISPOPUP`,{
        method:"GET"
    }).then(res=>res.json()).then(res=>{
        if(window.location.pathname.startsWith("/products")){
            fetch(`${APIHOST}/configuration/getbykey/CUSTOMHTML`,{
                method:"GET"
            }).then(custhtml=>custhtml.json()).then(html=>{
                let customhtml = convertstringtohtml(html[0].value);
                fetch(`${APIHOST}/configuration/getbykey/HTMLINJECTION`,{
                    method:"GET"
                }).then(injection=>injection.json()).then(inj=>{
                    if(inj[0].value==""){
                        if(!res[0].value){
                            rooting.appendChild(customhtml);
                        }else{
                            let notpop = document.querySelectorAll(".product-form")[0];
                            notpop.appendChild(customhtml);
                        }
                    }else{
                        console.log(inj)
                        let injectionpoint = document.querySelectorAll(inj[0].value)[0];
                        injectionpoint.appendChild(customhtml);
                    }
                    document.getElementById("fname").value = getCookie("firstname");
                    document.getElementById("lname").value = getCookie("lastname");
                    loadModalData()
                })
            })
        }
    });

    let style = document.createElement("style");
    fetch(`${APIHOST}/configuration/getbykey/CUSTOMCSS`,
        {method:"GET"}
    ).then(res=>res.json()).then(res=>{
        style.innerHTML = res[0].value;
    });
    rooting.appendChild(style);
    

    // let rmodal = document.createElement("div");
    // rmodal.setAttribute("id","reminder-modal");
    // rmodal.setAttribute("class","reminder-modal reminder-hide");

    // let reminder_header = document.createElement("div");
    // reminder_header.setAttribute("id","reminder-modal-header");

    // let rmodal_content = document.createElement("div");
    // rmodal_content.setAttribute("id","reminder-modal-content");
    // rmodal_content.setAttribute("class","reminder-modal-content");

    // rooting.appendChild(rmodal)
    // rmodal.appendChild(reminder_header)
    // rmodal.appendChild(rmodal_content)
    
    
}
fetch(`${APIHOST}/configuration/getbykey/APPSTATUS`,{
    method:"GET"
}).then(res=>{
    res.json().then(des=>{
        if(des[0].value) init();
    })
});



function PostApi() {
    let fname = document.getElementById("fname").value;
    let lname = document.getElementById("lname").value;
    let email = document.getElementById("emailfield").value;
    let datepicker = document.getElementById("datepicker").value;
    let timepicker = document.getElementById("timepicker").value;
    let this_timezone = new Date(datepicker+" "+timepicker);

    if(fname.length == 0 || lname.length == 0 || email.length == 0 ) {
        alert("Please Fill the First Name Last Name And Email.");
        return null;
    }else{
        fetch(APIHOST+`/configuration/getbykey/TIMEZONE`,{
            method:"GET"
        }).then(res=>{
            res.json().then(des=>{
                let DBzone = des[0].value;
                let date_to_remind = new Date(this_timezone.toLocaleString("en-US", {timeZone: DBzone}));
                console.log(this_timezone)
                console.log(date_to_remind)

                let data = {
                    fname:fname,
                    lname:lname,
                    email:email,
                    date_to_remind:date_to_remind,
                    product_id:__st.rid
                }
                console.log(data);

                fetch(`${APIHOST}/reminders`,{
                    method:"POST",
                    headers:{
                    'Content-Type': 'application/json',
                    },
                    body:JSON.stringify(data),
                })
                document.cookie = "firstname="+fname;
                document.cookie = "lastname="+lname;
            })
        })
        this.innerHTML = "Reminded";
    }
}

function setDateByButton(dateafter){
    let date = new Date();
    let datepicker = document.getElementById("datepicker");
    let timepicker = document.getElementById("timepicker");
    datepicker.valueAsDate = new Date(date.setDate(date.getDate()+dateafter))
    timepicker.valueasTime = new Date(new Date().getHours()+":"+new Date().getMinutes())
}

function HSBToRGB(h, s, v) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
  
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
  
    return [ r * 255, g * 255, b * 255 ];
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

function onReminderClick(){
    document.getElementById("reminder-btn").innerHTML = "Remind Me!";
    document.getElementById("datepicker").value = "";
    document.getElementById("timepicker").value = "";
    document.getElementById("emailfield").value = "";    
    // set fname and lname value according to cookie
    document.getElementById("fname").value = getCookie("firstname");
    document.getElementById("lname").value = getCookie("lastname");
}

async function  loadModalData(){
    let styletag = document.createElement("style");
    let styleinner = ``
    
    await fetch(APIHOST+`/configuration/getbykey/DAYSDELAY`,{
        method:"get",
      }).then(res=>{
          res.json().then(res=>{
            //   let modal = document.getElementById("reminder-modal-content")
            //   let datepicker = document.createElement("input");
            //   let timepicker = document.createElement("input");
            //   let fname = document.createElement("input");
            //   let lname = document.createElement("input")
            //   let emailfield = document.createElement("input");
            //   let submitbtn = document.createElement("button");
            //   let closebtn = document.createElement("button");


            //   closebtn.setAttribute("onclick","modalshow()")
            //   closebtn.style.border = "none";
            //   closebtn.setAttribute("class","reminder-btn red")
            //   closebtn.innerHTML = "Close";
              
            //   fname.setAttribute("placeholder","First Name");
            //   fname.setAttribute("class","reminder-input");
            //   fname.setAttribute("id","fname");
            //   fname.setAttribute("type","text");
            //   fname.setAttribute("style","padding:10px;border:none;border-radius:4px;");

            //   lname.setAttribute("placeholder","Last Name");
            //   lname.setAttribute("class","reminder-input");
            //   lname.setAttribute("id","lname");
            //   lname.setAttribute("type","text");
            //   lname.setAttribute("style","padding:10px;border:none;border-radius:4px;");

              
            //   emailfield.setAttribute("id","emailfield");
            //   emailfield.setAttribute("style","border-radius:4px;border:none;padding:10px;");
            //   emailfield.setAttribute("type","email");
            //   emailfield.setAttribute("placeholder","Enter Your Email.");
            //   emailfield.setAttribute("class","reminder-input");
              
            //   timepicker.setAttribute("type","time");
            //   timepicker.setAttribute("id","timepicker");
            //   timepicker.setAttribute("class","reminder-input");
            //   timepicker.setAttribute("style","border-radius:4px;border:none;padding:10px;width:44%;");
              
            //   datepicker.setAttribute("type","date");
            //   datepicker.setAttribute("id","datepicker");
            //   datepicker.setAttribute("class","reminder-input");
            //   datepicker.setAttribute("style","border-radius:4px;border:none;padding:10px;width:50%;");
              
            //   submitbtn.setAttribute("class","reminder-btn");
            //   submitbtn.setAttribute("id","reminder-btn-send");
            //   submitbtn.setAttribute("onclick","PostApi()")
            //   submitbtn.innerHTML = "Remind Me!";

            //   submitbtn.addEventListener("click",function(){
            //     onReminderClick()
            //     submitbtn.innerHTML = "Your Reminder Is Set!";
            //     setTimeout(()=>{
            //         submitbtn.innerHTML = "Remind Me!";
            //     },2000)
            //   })
    
              res[0].value.split(",").map(sp=>{
                  let btn = document.createElement("button")
                  btn.setAttribute("id","reminder-day-btn");
                  btn.setAttribute("type","button");
                  btn.value = sp
                  btn.setAttribute("onclick",`setDateByButton(${sp})`)
                  btn.setAttribute("class","reminder-day-btn")
                  btn.innerHTML = sp+" Days"
                  document.getElementById("daysbutton").append(btn)
              })
            //   modal.append(datepicker)
            //   modal.append(timepicker)
            //   modal.append(fname)
            //   modal.append(lname)
            //   modal.append(emailfield)
            //   modal.append(submitbtn)
            //   modal.append(closebtn)
    
          })
    })
    
    await fetch(APIHOST+`/configuration/getbykey/TITLETEXT`,{
        method:"GET"
    }).then(res=>{
        res.json().then(async title=>{
            await fetch(APIHOST+`/configuration/getbykey/DESTEXT`,{
                method:"GET"
            }).then(res=>{
                res.json().then(des=>{
                    document.getElementById("reminder-modal-header").innerHTML = "<p class='header-title' id='header-title'>"+title[0].value+"</p><p id='header-paragraph' class='header-paragraph'>"+des[0].value+"</p>";
                    styleinner += `.header-title{font-size:20px;line-height:0px;}`
                })
            })
        })
    })

    await fetch(APIHOST+`/configuration/getbykey/FONT`,{
        method:"GET"
    }).then(res=>{
        res.json().then(des=>{
            // document.getElementById("reminder-modal").style.fontFamily = des[0].value+" !important";
            styleinner += ".reminder-modal{font-family:"+des[0].value+";}";
        })
    })


    await fetch(APIHOST+`/configuration/getbykey/CTABGCOLOR`,{
        method:"GET"
    }).then(res=>{
        res.json().then(des=>{
            resp = JSON.parse(des[0].value)
            let [r,g,b] = HSBToRGB(resp.hue,resp.saturation,resp.brightness);
            // document.getElementById("reminder-btn").style.background = "rgb("+r+","+g+","+b+")";
            styleinner += ".reminder-btn{background:rgb("+r+","+g+","+b+");}";
        })
    })
    await fetch(APIHOST+`/configuration/getbykey/CTATCOLOR`,{
        method:"GET"
    }).then(res=>{
        res.json().then(des=>{
            resp = JSON.parse(des[0].value)
            let [r,g,b] = HSBToRGB(resp.hue,resp.saturation,resp.brightness);
            // document.getElementById("reminder-btn").style.color = "rgb("+r+","+g+","+b+")";
            styleinner += ".reminder-btn{color:rgb("+r+","+g+","+b+");}";
        })
    })
    await fetch(APIHOST+`/configuration/getbykey/TCOLOR`,{
        method:"GET"
    }).then(res=>{
        res.json().then(des=>{
            resp = JSON.parse(des[0].value)
            let [r,g,b] = HSBToRGB(resp.hue,resp.saturation,resp.brightness);
            // document.getElementById("reminder-modal").style.color = "rgb("+r+","+g+","+b+")";
            styleinner += ".reminder-modal{color:rgb("+r+","+g+","+b+");}"; 
        })
    })
    await fetch(APIHOST+`/configuration/getbykey/PBGCOLOR`,{
        method:"GET"
    }).then(res=>{
        res.json().then(des=>{
            resp = JSON.parse(des[0].value)
            let [r,g,b] = HSBToRGB(resp.hue,resp.saturation,resp.brightness);
            // document.getElementById("reminder-modal").style.background = "rgb("+r+","+g+","+b+")";
            styleinner += ".reminder-modal{background:rgb("+r+","+g+","+b+");}";
        })
    })

    await fetch(APIHOST+`/configuration/getbykey/SBGCOLOR`,{
        method:"GET"
    }).then(res=>{
        res.json().then(des=>{
            resp = JSON.parse(des[0].value)
            let [r,g,b] = HSBToRGB(resp.hue,resp.saturation,resp.brightness);
            // change bg of all reminder-day-btn
            console.log(document.querySelectorAll("#reminder-day-btn"))
            console.log(document.querySelectorAll("#reminder-day-btn")[0])
            console.log(document.querySelectorAll("#reminder-day-btn").length)
            for(let i=0;i<document.querySelectorAll("#reminder-day-btn").length;i++){
                document.querySelectorAll("#reminder-day-btn")[i].style.background = "rgb("+r+","+g+","+b+")";
            }
        })
    })
    // append styletag in body 
    styletag.innerHTML = styleinner;
    document.body.append(styletag);

}

function modalshow(){
  if(document.getElementById("reminder-modal").classList.contains("reminder-show")){
      document.getElementById("reminder-modal").classList.add("reminder-hide")
      document.getElementById("reminder-modal").classList.remove("reminder-show")
  }else{
      document.getElementById("reminder-modal").classList.remove("reminder-hide")
      document.getElementById("reminder-modal").classList.add("reminder-show")
  }
}