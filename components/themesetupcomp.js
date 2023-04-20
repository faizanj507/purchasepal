import React, { useState,useCallback,useEffect } from "react";
import { Button, Card, Page, Select, TextField,Frame,Toast, TextStyle } from "@shopify/polaris";
import { GETTHEMES, APPLYTHEME, REMOVETHEME } from "../fetchAPI"; 

export default function Themesetupcomp(){
    let [toast,settoast] = useState(null);
    let [toastmsg,settoastmsg] = useState(null);
    let [themedata,setthemedata] = useState(null);
    let [themes,setthemes] = useState([]);
    let [selectedtheme,setselectedtheme] = useState(null);

    const handleSelectChange = useCallback((value) => setselectedtheme(value), []);

    function getThemese(){
        GETTHEMES().then(res=>{
            res.json().then(res=>{
                let temptheme = []
                temptheme.push({value:"",label:"Select Theme"})
                res.body.themes.forEach(element => {
                    console.log(element)
                    temptheme.push({label:element.role==="main"?element.name+" [In Use]":element.name,value:element.id})
                    element.role==="main"?setselectedtheme(element.name+" [In Use]") :setselectedtheme("Select Theme")
                });
                setthemedata(res.body)
                setthemes(temptheme)
            })
        })
    }
    useEffect(()=>{
        getThemese();
    },[])

    function applytheme(){
        APPLYTHEME({id:selectedtheme}).then(res=>{
            toastit()
            // set toast message with product name
            settoastmsg("Theme Applied")
        })
    }

    function removetheme(){
        REMOVETHEME({id:selectedtheme}).then(res=>{
            toastit()
            settoastmsg("Theme Removed")
        })
    }

    function toastit(){
        settoast(true);
        toastmsg == ""? settoastmsg("Saved"):null;
        setTimeout(()=>{
            settoast(false);
            settoastmsg("")
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
            <Card sectioned title="Theme Setup">
                <Select label="Select Theme" options={themes} onChange={handleSelectChange} value={selectedtheme} />
                <br/>
                <div>
                    {themedata !== null?
                        <>
                            <Button primary onClick={()=>{removetheme();getThemese()}}>Remove</Button>
                            &nbsp;&nbsp;
                            <Button primary onClick={()=>{applytheme();getThemese()}}>Apply</Button>
                        </>  
                    :
                        null
                    }
                </div>
                <br/>
                <TextStyle variation="strong"><a target="_blank" href="https://help.shopify.com/en/manual/online-store/themes/managing-themes/duplicating-themes">Duplicate Your Theme</a></TextStyle>
                <br/>
            </Card>
    </Frame>
    );
}