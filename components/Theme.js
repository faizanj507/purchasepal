import React, { useCallback, useEffect, useState } from 'react';
import {Card,TextField,SettingToggle,TextStyle, Frame, Toast, Button} from '@shopify/polaris';
import { GETCONFIGBYKEY,UPDATECONFIGBYKEY } from '../fetchAPI';

export default function Theme(){
    let [toast,settoast] = useState(null);
    let [toastmsg,settoastmsg] = useState(null);
    let [ispopup,setispopup] = useState(true)
    let [customcss,setcustomcss] = useState("Please Wait...")
    // let [customhtml,setcustomhtml] = useState("Please Wait...")
    let [injectionpoint,setinjectionpoint] = useState("")

    useEffect(()=>{
        GETCONFIGBYKEY("HTMLINJECTION").then(res=>{
            res.json().then(res=>{
                setinjectionpoint(res[0].value)
            })
        })
        GETCONFIGBYKEY("ISPOPUP").then(res=>{
            res.json().then(res=>{
                setispopup(res[0].value)
            })
        })
        GETCONFIGBYKEY("CUSTOMCSS").then(res=>{
            res.json().then(res=>{
                console.log(res[0].value)
                setcustomcss((res[0].value))
            })
        })
        // GETCONFIGBYKEY("CUSTOMHTML").then(res=>{
        //     res.json().then(res=>{
        //         console.log(res[0].value)
        //         setcustomhtml((res[0].value))
        //     })
        // })
    },[])

    function updatePOPUP(){
        UPDATECONFIGBYKEY({key:"ISPOPUP",value:ispopup})
        toastit()
    }
    function updateCUSTOMCSS(){
        UPDATECONFIGBYKEY({key:"CUSTOMCSS",value:customcss})
        toastit()
    }
    function updateCUSTOMHTML(){
        // UPDATECONFIGBYKEY({key:"CUSTOMHTML",value:customhtml})
        UPDATECONFIGBYKEY({key:"HTMLINJECTION",value:injectionpoint})
        toastit()
    }

    function toastit(){
        settoast(true);
        settoastmsg("Saved");
        setTimeout(()=>{
            settoast(false);
        },2000)
    }
    return (
        <Frame>
        <Card title="Appearance">
        {
            toast ?
            <Toast content={toastmsg}  onDismiss={()=>settoast(null)}/>
            :
            null
        }
            <SettingToggle
                action={{
                content: ispopup? "Sticky" :"Positioned",
                onAction:useCallback(()=>{setispopup(ispopup => !ispopup);updatePOPUP();})
                }}
                enabled={ispopup}
            >
                <TextStyle>Product Page Button is <b>{ispopup?"Sticky":"Positioned"}</b> now</TextStyle>
            </SettingToggle>
        </Card>
        <Card title="Custom HTML">
            <div style={{margin:"10px 20px"}}>
                <TextStyle variation="strong">ID or Class(where you want to append the html code eg- .class-class2 or #id)</TextStyle>
                <br />
                <TextField value={injectionpoint} onChange={(val)=>{setinjectionpoint(val)}} />
                <br/>
                {/* <TextField multiline={20} value={customhtml}  onChange={useCallback((e)=>{setcustomhtml(e)},[])} />
                <br/> */}
                <br/>
                <Button onClick={()=>{updateCUSTOMHTML()}}>Save</Button>
                <br/>
                <br/>
            </div>
        </Card>

        <Card title="Custom CSS">
            <div style={{margin:"10px 20px"}}>
                <TextField multiline={20} value={customcss}  onChange={useCallback((e)=>{setcustomcss(e)},[])} />
                <br/>
                <br/>
                <Button onClick={()=>updateCUSTOMCSS()}>Save</Button>
                <br/>
                <br/>
            </div>
        </Card>
        </Frame>
    )
}