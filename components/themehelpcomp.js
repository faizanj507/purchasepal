import React, { useState,useCallback, useEffect } from "react";
import { Button, Card, Page, Select, TextField,Frame,Toast } from "@shopify/polaris";
import { GETUSERPLAN, THEMEHELP } from "../fetchAPI"; 

export default function Themehelpcom(){
    let [name,setname] = useState("");
    let [email,setemail] = useState("");
    let [website,setwebiste] = useState("");
    let [urgency,seturgency] = useState("Low");
    let [message,setmessage] = useState("");
    let [toast,settoast] = useState(false);
    let [toastmsg,settoastmsg] = useState("");

    function sendHelp(){
        THEMEHELP({name:name,email:email,website:website,urgency:urgency,message:message})
        toastit()
    }
    useEffect(()=>{
        GETUSERPLAN().then(res=>{
            res.json().then(res=>{
                console.log(res[0].shop)
                setwebiste(res[0].shop)
            })
        })
    },[])
    function toastit(){
        settoast(true);
        settoastmsg("Feedback Sent");
        setTimeout(()=>{
            settoast(false);
        },2000)
    }

    return(
        <Frame>
        {
            toast ?
            <Toast content={toastmsg}  onDismiss={()=>settoast(null)}/>
            :
            null
        }
        <Page title="Theme Help">
            <Card sectioned>
                <TextField label="Name" type="text" value={name} onChange={useCallback((val)=>{setname(val)})} />
                <br/>
                <TextField label="Email" type="email" value={email} onChange={useCallback((val)=>{setemail(val)})}/>
                <br/>
                <TextField label="Website URL" disabled value={website}/>
                <br/>
                <Select label="Select Urgency" value={urgency} onChange={useCallback((val)=>{seturgency(val)})}  options={[
                    {label: 'Low', value: 'low'},
                    {label: 'Medium', value: 'medium'},
                    {label: 'High', value: 'high'},
                    {label: 'Urgent', value: 'urgent'},
                ]} />
                <br/>
                <TextField label="Message" multiline={7} type="text" value={message}  onChange={useCallback((val)=>{setmessage(val)})}/>
                <br />
                <Button primary onClick={()=>{sendHelp()}}>Help Me</Button>
            </Card>
        </Page>
    </Frame>
    );
}