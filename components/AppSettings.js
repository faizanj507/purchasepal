import {useState,useCallback, useEffect} from 'react';
import momenttz from 'moment-timezone';
import {Card, ColorPicker, Select, SettingToggle,TextStyle,Page,Caption, Button, TextField, Toast, Frame, DropZone, Layout, Stack, Thumbnail} from '@shopify/polaris';
import { GETCONFIGBYKEY, UPDATECONFIGBYKEY, GETUSERPLAN } from '../fetchAPI';
import {MobileBackArrowMajor} from '@shopify/polaris-icons';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AppSettings() {
    let [appen,setappen] = useState(null);
    let [tzone,settzone] = useState(null);
    let [font,setfont] = useState(null);
    let [title,settitle] = useState(null);
    let [des,setdes] = useState(null);
    let [daysd,setdaysd] = useState(null);
    let [pbgcolor,setpbgcolor] = useState({hue: 120,brightness: 1,saturation: 1,});
    let [sbgcolor,setsbgcolor] = useState({hue: 1,brightness: 12,saturation: 61,});
    let [tcolor,settcolor] = useState({hue: 1,brightness: 1,saturation: 1,});
    let [ctabgcolor,setctabgcolor] = useState({hue: 1,brightness: 1,saturation: 1,});
    let [ctatcolor,setctatcolor] = useState({hue: 1,brightness: 1,saturation: 1,});
    let [toast,settoast] = useState(null);
    let [toastmsg,settoastmsg] = useState(null);
    let [plan,setplan] = useState(null);
    let [remainingemail,setremainingemail] = useState(null);
    let [remainingsession,setremainingsession] = useState(null);
    let [stockprod,setstockprod] = useState(false);
    let [file, setFile] = useState();

    let router = useRouter();

    const handleDropZoneDrop = useCallback(
      (_dropFiles, acceptedFiles, _rejectedFiles) =>
        setFile((file) => acceptedFiles[0]),
      [],
    );

    const validImageTypes = ['image/jpeg', 'image/png'];

    const fileUpload = !file && <DropZone.FileUpload />;
    const uploadedFile = file && (
      <Stack>
        <Thumbnail
          size="small"
          alt={file.name}
          source={
            validImageTypes.includes(file.type)
              ? window.URL.createObjectURL(file)
              : NoteMinor
          }
        />
        <div>
          {file.name} <Caption>{file.size} bytes</Caption>
        </div>
      </Stack>
    );

    const TimeZone = []
    const Fontselect = [
        {label:"Arial",value:"Arial"},
        {label:"Courier New",value:"Courier New"},
        {label:"Georgia",value:"Georgia"},
        {label:"Helvetica",value:"Helvetica"},
        {label:"Times New Roman",value:"Times New Roman"},
        {label:"Verdana",value:"Verdana"},
    ]

    momenttz.tz.names().map(zones=>{
        TimeZone.push({label:zones,value:zones})
    })

    useEffect(()=>{
        GETUSERPLAN().then(res=>{
            res.json().then(data=>{
                setplan(data[0].plan_name)
                setremainingemail(data[0].email_remaining)
                setremainingsession(data[0].sessions_remaining)
            })
        })
        GETCONFIGBYKEY("NOTISTOCKPROD").then(res=>{
            res.json().then(res=>{
                setstockprod(res[0].value)
            })
        })
        GETCONFIGBYKEY("APPSTATUS").then(res=>{
            res.json().then(res=>{
                setappen(res[0].value || "")
            })
        })
        GETCONFIGBYKEY("TIMEZONE").then(res=>{
            res.json().then(res=>{
                console.log("Time Zone Done");
                settzone(res[0].value);
            })
        });
        GETCONFIGBYKEY("FONT").then(res=>{
            res.json().then(res=>{
                console.log("font DOne")
                setfont(res[0].value);
            })
        })

        GETCONFIGBYKEY("TITLETEXT").then(res=>{
            res.json().then(res=>{
                settitle(res[0].value);
            })
        })
        GETCONFIGBYKEY("DESTEXT").then(res=>{
            res.json().then(res=>{
                setdes(res[0].value);
            })
        })
        GETCONFIGBYKEY("DAYSDELAY").then(res=>{
            res.json().then(res=>{
                setdaysd(res[0].value);
            })
        })
        GETCONFIGBYKEY("PBGCOLOR").then(res=>{
            res.json().then(res=>{
                setpbgcolor(JSON.parse(res[0].value));
            })
        })
        GETCONFIGBYKEY("SBGCOLOR").then(res=>{
            res.json().then(res=>{
                setsbgcolor(JSON.parse(res[0].value));
            })
        })
        GETCONFIGBYKEY("TCOLOR").then(res=>{
            res.json().then(res=>{
                settcolor(JSON.parse(res[0].value));
            })
        })
        GETCONFIGBYKEY("CTABGCOLOR").then(res=>{
            res.json().then(res=>{
                setctabgcolor(JSON.parse(res[0].value));
            })
        })
        GETCONFIGBYKEY("CTATCOLOR").then(res=>{
            res.json().then(res=>{
                setctatcolor(JSON.parse(res[0].value));
            })
        })
    },[])

    function saveStockNoti(){
        UPDATECONFIGBYKEY({key:"NOTISTOCKPROD",value:!stockprod})
        toastit()
    }
    function saveAppStatus(){
        UPDATECONFIGBYKEY({key:"APPSTATUS",value:appen})
        toastit()
    }
    function saveTimeZone(){
        UPDATECONFIGBYKEY({key:"TIMEZONE",value:tzone})
        toastit()
    }
    function saveTitleDescription(){
        UPDATECONFIGBYKEY({key:"TITLETEXT",value:title})
        UPDATECONFIGBYKEY({key:"DESTEXT",value:des})
        toastit()
    }
    function saveDays(){
        UPDATECONFIGBYKEY({key:"DAYSDELAY",value:daysd})
        toastit()
    }
    function saveFont(){
        UPDATECONFIGBYKEY({key:"FONT",value:font})
        toastit()
    }
    function savePBGColor(){
        UPDATECONFIGBYKEY({key:"PBGCOLOR",value:JSON.stringify(pbgcolor)})
        toastit()
    }
    function saveSBGColor(){
        UPDATECONFIGBYKEY({key:"SBGCOLOR",value:JSON.stringify(sbgcolor)})
        toastit()
    }
    function saveTColor(){
        UPDATECONFIGBYKEY({key:"TCOLOR",value:JSON.stringify(tcolor)})
        toastit()
    }
    function saveCTABGColor(){
        UPDATECONFIGBYKEY({key:"CTABGCOLOR",value:JSON.stringify(ctabgcolor)})
        toastit()
    }
    function saveCTATColor(){
        UPDATECONFIGBYKEY({key:"CTATCOLOR",value:JSON.stringify(ctatcolor)})
        toastit()
    }
    function uploadtheimage(){
        let forming = new FormData();
        forming.append("image",file);
        fetch(`https://api.imgbb.com/1/upload?expiration=600&key=295048784af7c29d5f2023c5887d8f7b`,{
            method:"POST",
            body:forming
        }).then(res=>{
            res.json().then(res=>{
                console.log(res)
                UPDATECONFIGBYKEY({key:"LOGOURL",value:res.data.url})
                toastit()
            })
        })
    }
    function toastit(){
        settoast(true);
        settoastmsg("Saved");
        setTimeout(()=>{
            settoast(false);
        },2000)
    }
    let pageTitle = "App Settings";
    
    if(router.query.from === "marketing"){
        pageTitle = <><Button plain icon={MobileBackArrowMajor} onClick={()=>{router.back()}} ></Button> App Settings</>;
    }

    return (
        <Page title={pageTitle}>
        <Frame>
        {
            toast ?
            <Toast content={toastmsg}  onDismiss={()=>settoast(null)}/>
            :
            null
        }
        <Card sectioned title="General">
            <Card sectioned title="Your Plan">
                <TextStyle>You are on <b>{plan}</b> Plan<br/>

                You Current Usage <br/>
                <b>{remainingemail}/{plan=="STARTER"?100:plan=="PRO"?500:"UNLIMITED"}</b> Emails Left
                <br/>
                <b>{remainingsession}/{plan=="STARTER"?10000:plan=="PRO"?50000:"UNLIMITED"}</b> Sessions Left</TextStyle>
                <br/>
                <br/>
                <Link href="/pricing">Upgrade</Link>
            </Card>
            <br />
            <Layout>
                <Layout.Section secondary>
                    <Card title="Communication">
                        <SettingToggle
                            action={{
                            content: stockprod ? "Enabled" : "Disabled",
                            onAction: useCallback(()=>{ setstockprod(stockprod => !stockprod);saveStockNoti();})
                            }}
                            enabled={stockprod ? true : false}
                        >
                            <TextStyle>Notification is <b>{stockprod ? "Disabled" : "Enabled"}</b> For Out Of Stock Products </TextStyle>
                        </SettingToggle>
                    </Card>
                </Layout.Section>
                <Layout.Section secondary>
                    <Card title="Enable/Disable">
                        <SettingToggle
                            action={{
                            content: appen ? "Enabled" : "Disabled",
                            onAction: useCallback(()=>{ setappen(appen => !appen);saveAppStatus();})
                            }}
                            enabled={appen ? true : false}
                        >
                            <TextStyle>App is <b>{appen ? "Enabled" : "Disabled"}</b> Now</TextStyle>
                        </SettingToggle>
                    </Card>
                </Layout.Section>
            </Layout>
            <br />
            <Card sectioned title="Time Zone">
                <Select options={TimeZone} value={tzone} onChange={useCallback((val)=>{settzone(val)},[])}/>
                <br/>
                <Button primary onClick={saveTimeZone}>Save</Button>
            </Card>
            
        </Card>
        <Card sectioned title="Visual/Design">

        <Layout>
            <Layout.Section secondary>
                <Card sectioned title="Select Primary Background Color">
                    <ColorPicker onChange={setpbgcolor} color={pbgcolor}/>
                    <br/>
                    <Button primary onClick={savePBGColor}>Save</Button>
                </Card>
                </Layout.Section>
                <Layout.Section secondary>
                <Card sectioned title="Select Secondry Background Color">
                    <ColorPicker onChange={setsbgcolor} color={sbgcolor}/>
                    <br/>
                    <Button primary onClick={saveSBGColor}>Save</Button>
                </Card>
            </Layout.Section>
        </Layout>
        <br />
        <Layout>                        
            <Layout.Section secondary>
                <Card sectioned title="Select Text Color">
                    <ColorPicker onChange={settcolor} color={tcolor}/>
                    <br/>
                    <Button primary onClick={saveTColor}>Save</Button>
                </Card>
            </Layout.Section>
            <Layout.Section secondary>
                <Card sectioned title="Select CTA Background Color">
                    <ColorPicker onChange={setctabgcolor} color={ctabgcolor}/>
                    <br/>
                    <Button primary onClick={saveCTABGColor}>Save</Button>
                </Card>
            </Layout.Section>
        </Layout>
        <br />
        <Layout>
            <Layout.Section secondary>
                <Card sectioned title="Select CTA Text Color">
                    <ColorPicker onChange={setctatcolor} color={ctatcolor}/>
                    <br/>
                    <Button primary onClick={saveCTATColor}>Save</Button>
                </Card>
            </Layout.Section>
       </Layout>
       <br />
       <Card sectioned title="Select Font Family">
           <Select options={Fontselect} value={font} onChange={useCallback((val)=>{setfont(val)})} />
           <br/>
           <Button primary onClick={saveFont}>Save</Button>
       </Card>

       <Card sectioned title="Title And Description">
           <TextField label="Title" value={title} onChange={useCallback((val)=>{settitle(val)})} />
            <TextField label="Description" value={des} onChange={useCallback((val)=>{setdes(val)})} />
            <br/>
           <Button primary onClick={saveTitleDescription}>Save</Button>
       </Card>

       <Card sectioned title="Set Days Delay">
           <TextField label="Days(eg. 1,3,7,14)" value={daysd} onChange={useCallback((val)=>{setdaysd(val)})} />
           <br/>
           <Button primary onClick={saveDays}>Save</Button>
       </Card>

       <Card sectioned title="Upload Brand Logo">
           <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
               {fileUpload}
               {uploadedFile}
           </DropZone>
           <br/>
           <Button primary onClick={()=>{uploadtheimage()}}>Upload</Button>
       </Card>
        
        </Card>
        </Frame>
        </Page>
    );
  }