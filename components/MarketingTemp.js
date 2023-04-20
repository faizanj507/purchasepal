import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card,Button, Frame, Toast, TextField,SettingToggle,TextStyle, Page, Banner,Tooltip,Icon} from '@shopify/polaris';
import { GETCONFIGBYKEY, UPDATECONFIGBYKEY, GETUSERPLAN } from '../fetchAPI';
import {InfoMinor} from '@shopify/polaris-icons';
import createApp from '@shopify/app-bridge';
import {Redirect} from '@shopify/app-bridge/actions';
import dynamic from "next/dynamic";
import { useRouter } from 'next/router';
const SunEditor = dynamic(() => import("suneditor-react"), {
    ssr: false,
});
  
import 'suneditor/dist/css/suneditor.min.css';
import Link from 'next/link';

export default function MarketingTemp(){
    let router = useRouter();
    let [toast,settoast] = useState(null);
    let [toastmsg,settoastmsg] = useState(null);
    let [plan,setplan] = useState(null);

    let [notifyday,setnotifyday] = useState(false)
    let [notifydaysubject,setnotifydaysubject] = useState("This is Subject is for Notified Day")
    let [notifydaybody,setnotifydaybody] = useState(null)

    let [beforenotifyday,setbeforenotifyday] = useState(false)
    let [beforenotifydaysubject,setbeforenotifydaysubject] = useState("This is Subject from before Notified Day")
    let [beforenotifydaybody,setbeforenotifydaybody] = useState(null)

    let [afternotifyday,setafternotifyday] = useState(false)
    let [afternotifydaysubject,setafternotifydaysubject] = useState("This is Subject for after Notified Day")
    let [afternotifydaybody,setafternotifydaybody] = useState(null)

    let [reminderconfirm,setreminderconfirm] = useState(false)
    let [reminderconfirmsubject,setreminderconfirmsubject] = useState(null)
    let [reminderconfirmbody,setreminderconfirmbody] = useState(null)

    const editor = useRef();


    const ond = (sunEditor) => {
        editor.current = sunEditor;
    };

    const obnd = (sunEditor) => {
        editor.current = sunEditor;
    };

    const oand = (sunEditor) => {
        editor.current = sunEditor;
    };

    const rcnd = (sunEditor) => {
        editor.current = sunEditor;
    };

    // suneditor with font size options
        


    useEffect(()=>{
        GETCONFIGBYKEY("NOTIFYDAY").then(res=>{
            res.json().then(res=>{
                let data = res[0].value;
                setnotifyday(data[0]);
                setnotifydaysubject(data[1]);
                setnotifydaybody(data[2]);
            })
        })

        GETCONFIGBYKEY("BEFORENOTIFYDAY").then(res=>{
            res.json().then(res=>{
                let data = res[0].value;
                setbeforenotifyday(data[0]);
                setbeforenotifydaysubject(data[1]);
                setbeforenotifydaybody(data[2]);
            })
        })

        GETCONFIGBYKEY("AFTERNOTIFYDAY").then(res=>{
            res.json().then(res=>{
                let data = res[0].value;
                setafternotifyday(data[0]);
                setafternotifydaysubject(data[1]);
                setafternotifydaybody(data[2]);
            })
        })

        GETCONFIGBYKEY("REMINDERCONFIRM").then(res=>{
            res.json().then(res=>{
                let data = res[0].value;
                setreminderconfirm(data[0]);
                setreminderconfirmsubject(data[1]);
                setreminderconfirmbody(data[2]);
            })
        })

        GETUSERPLAN().then(res=>{
            res.json().then(data=>{
                setplan(data[0].plan_name)
            })
        })
    },[])

    async function updateNotifyDayTemp(){
        await UPDATECONFIGBYKEY({key:"NOTIFYDAY",value:[notifyday,notifydaysubject,notifydaybody]});
        toastit();        
    }

    async function updateBeforeNotifyDayTemp(){
        await UPDATECONFIGBYKEY({key:"BEFORENOTIFYDAY",value:[beforenotifyday,beforenotifydaysubject,beforenotifydaybody]});
        toastit();        
    }

    async function updateAfterNotifyDayTemp(){
        await UPDATECONFIGBYKEY({key:"AFTERNOTIFYDAY",value:[afternotifyday,afternotifydaysubject,afternotifydaybody]});
        toastit();        
    }

    async function updateConfirmationTemp(){
        await UPDATECONFIGBYKEY({key:"REMINDERCONFIRM",value:[!reminderconfirm,reminderconfirmsubject,reminderconfirmbody]});
        toastit();        
    }
    function toastit(){
        settoast(true);
        settoastmsg("Saved");
        setTimeout(()=>{
            settoast(false);
        },2000)
    }
    

    const app = Redirect.create(createApp({
        apiKey: process.env.SHOPIFY_API_KEY,
        host: Buffer.from(process.env.SHOPIFY_SHOP+"/admin").toString('base64'),
      }));
    
    return(
        <Page fullWidth={true} title='Marketing Settings' primaryAction={<Tooltip  content={
        <>
        <b>Avaiable Variables</b>
            
            <p>{"{firstname}"} - User Firstname</p>
            
            <p>{"{lastname}"} - User Lastname</p>
            
            <p>{"{email}"} - User Email</p>
            
            <p>{"{reminddate}"} - Reminding Date Of Product</p>
            
            <p>{"{remindtime}"} - Reminding Time Of Product</p>

            <p>{"{product.name}"} - Product Name</p>

            <p>{"{product.image}"} - Product Image</p>

            <p>{"{product.url}"} - Product URL</p>

            <p>{"{product.price}"} - Product Price</p>

            <p>{"{product.frame}"} - Product Frame with all details</p>
            </>
            }><Icon source={InfoMinor} color="base" /></Tooltip>}>
            <Frame>
                {
                    toast ?
                    <Toast content={toastmsg}  onDismiss={()=>settoast(null)}/>
                    :
                    null
                }
                <Banner status='success' title="Notification">
                    <p>You can customise color,font etc from <Button plain onClick={()=>{app.dispatch(Redirect.Action.APP,"/settings")}}>Settings</Button></p>
                </Banner>
                <br/>
                <Card sectioned title="Email Template - On Notify Day" actions={[{content:<Link style={{color:"green"}} href="/emailpreview-[id]" as={`/emailpreview-NOTIFYDAY`}>Preview</Link>,}]}>
                    <SettingToggle
                        action={{
                        content: notifyday ? "ON" : "OFF",
                        onAction: useCallback(()=>{ setnotifyday(notifyday => !notifyday);updateNotifyDayTemp();})
                        }}
                        enabled={notifyday ? true : false}
                    >
                        <TextStyle>This Template <b>{notifyday ? "ON" : "OFF"}</b> Now</TextStyle>
                    </SettingToggle>
                    <br />
                    <TextStyle variation="strong">Email Subject</TextStyle>
                    <br />
                
                    <TextField value={notifydaysubject} onChange={(e)=>{setnotifydaysubject(e)}} />
                    <br />
                    <TextStyle variation="strong">Email Template</TextStyle>
                    <br />
                
                    <SunEditor setOptions={{height:300,fontSize:[12,16,18,20,24,30,48]}} setContents={notifydaybody} getSunEditorInstance={ond} onChange={(e)=>{setnotifydaybody(e)}}/>
                    <br />
                    <Button primary onClick={updateNotifyDayTemp}>Save</Button>
                </Card>


                <Card sectioned title="Email Template - Before Notification Day" actions={[{content:<Link style={{color:"green"}} href="/emailpreview-[id]" as={`/emailpreview-BEFORENOTIFYDAY`}>Preview</Link>,}]}>
                    <SettingToggle
                        action={{
                        content: beforenotifyday ? "ON" : "OFF",
                        onAction: useCallback(()=>{ setbeforenotifyday(beforenotifyday => !beforenotifyday);updateBeforeNotifyDayTemp();})
                        }}
                        enabled={beforenotifyday ? true : false}
                    >
                        <TextStyle>This Template <b>{beforenotifyday ? "ON" : "OFF"}</b> Now</TextStyle>
                    </SettingToggle>
                    <br />
                    <TextStyle variation="strong">Email Subject</TextStyle>
                    <br />
                    
                    <TextField value={beforenotifydaysubject} onChange={(val)=>{setbeforenotifydaysubject(val)}} />
                    <br/>
                    <TextStyle variation="strong">Email Template</TextStyle>
                    <br />
                    
                    <SunEditor setOptions={{height:300,fontSize:[12,16,18,20,24,30,48]}} setContents={beforenotifydaybody} getSunEditorInstance={obnd} onChange={(e)=>{setbeforenotifydaybody(e)}}/>
                    <br />
                    <Button primary onClick={updateBeforeNotifyDayTemp}>Save</Button>
                </Card>


                {/* <Card sectioned title="Email Template - After Notification Day" actions={[{content:<Link style={{color:"green"}} href="/emailpreview-[id]" as={`/emailpreview-AFTERNOTIFYDAY`}>Preview</Link>,}]}>
                    <SettingToggle
                        action={{
                        content: afternotifyday ? "ON" : "OFF",
                        onAction: useCallback(()=>{ setafternotifyday(afternotifyday => !afternotifyday);updateAfterNotifyDayTemp();})
                        }}
                        enabled={afternotifyday}
                    >
                        <TextStyle>This Template <b>{afternotifyday ? "ON" : "OFF"}</b> Now</TextStyle>
                    </SettingToggle>
                    <br />
                    <TextStyle variation="strong">Email Subject</TextStyle>
                    <br />
                    
                    <TextField value={afternotifydaysubject} onChange={val=>{setafternotifydaysubject(val)}}/>
                    <br />
                    <TextStyle variation="strong">Email Template</TextStyle>
                    <br />
                    
                    <SunEditor setOptions={{height:300,fontSize:[12,16,18,20,24,30,48]}} setContents={afternotifydaybody} getSunEditorInstance={oand} onChange={(e)=>{setafternotifydaybody(e)}}/>
                    <br />
                    <Button primary onClick={updateAfterNotifyDayTemp}>Save</Button>
                </Card> */}


                {/* {plan==="PREMIUM" ? */}
                    <Card sectioned title="Email Template - Reminder Confirmation" actions={[{content:<Link style={{color:"green"}} href="/emailpreview-[id]" as={`/emailpreview-REMINDERCONFIRM`}>Preview</Link>,}]}>
                        <SettingToggle
                            action={{
                            content: reminderconfirm ? "ON" : "OFF",
                            onAction: useCallback(()=>{ updateConfirmationTemp();setreminderconfirm(reminderconfirm => !reminderconfirm);})
                            }}
                            enabled={reminderconfirm}
                        >
                            <TextStyle>This Template <b>{reminderconfirm ? "ON" : "OFF"}</b> Now</TextStyle>
                        </SettingToggle>
                        <br />
                        <TextStyle variation="strong">Email Subject</TextStyle>
                        <br />
                        
                        <TextField value={reminderconfirmsubject} onChange={val=>{setreminderconfirmsubject(val)}}/>
                        <br />
                        <TextStyle variation="strong">Email Template</TextStyle>
                        <br />
                        
                        <SunEditor setOptions={{height:300,fontSize:[12,16,18,20,24,30,48]}} setContents={reminderconfirmbody} getSunEditorInstance={rcnd} onChange={(e)=>{setreminderconfirmbody(e)}}/>
                        <br />
                        <Button primary onClick={updateConfirmationTemp}>Save</Button>
                    </Card>
                {/* :
                null
                } */}

            </Frame>
        </Page>
    )
}