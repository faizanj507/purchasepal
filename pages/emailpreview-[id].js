import React,{useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import {Page,Card,Button,Icon} from '@shopify/polaris';
import { GETCONFIGBYKEY } from '../fetchAPI';
import { MobileBackArrowMajor } from '@shopify/polaris-icons';

export default function EmailPreview() {
    let [subject,setsubject] = useState();
    let [body,setbody] = useState();

    let router = useRouter();
    console.log("its working till here")
    let mailkey = location.pathname.split("-")[1];
    console.log("Its working even after the suspect")

    function tempbodyvariables(template){
        let reminding_date = new Date();
        return template.replaceAll("{firstname}","Reminder")
        .replaceAll("{lastname}","Hero")
        .replaceAll("{email}","reminderhero@example.com")
        .replaceAll("{reminddate}",`${reminding_date.getMonth()}-${reminding_date.getDate()+1}-${reminding_date.getFullYear()}`)
        .replaceAll("{remindtime}",`${reminding_date.getHours()}:${reminding_date.getMinutes()}`)
        .replaceAll("{product.name}","The Reminder Hero")
        .replaceAll("{product.image}",`<img src="https://random.imagecdn.app/550/550" />`)
        .replaceAll("{product.price}","$10.00")
        .replaceAll("{product.url}",`https://www.exampleshop.com/products/the-reminder-hero`)
        .replaceAll("{product.frame}",
        `<div style="display: flex; flex-wrap: wrap; width: 100%; background: #F5F5F5; border-radius: 3px;">

            <div style="border-radius: 3px; display: flex; align-items: center;">
                <img src="https://random.imagecdn.app/150/150" width="100px" />
            </div>

            <div style="display: flex;flex-direction:column; justify-content: center; flex-grow: 1; padding: 0px 20px;">
                <a href="#" style="font-size:20px;padding: 5px 0px;">Product Title</a>
                <p>lorem ipsum dolor sit amet, consectetur </p>
            </div>

            <div style="display: flex;font-size:20px; align-items: center; padding: 0px 20px;, border-left: 1px solid #C7C5C5;">
                $ 50
            </div>
        </div>`
        )
      }
    
    useEffect(()=>{
        GETCONFIGBYKEY(mailkey).then(res=>{
            res.json().then(res=>{
                setsubject(res[0].value[1])
                setbody(tempbodyvariables(res[0].value[2]))
            })
        });
    },[])

    return (
        <Page title={<><Button plain icon={MobileBackArrowMajor} onClick={()=>{router.back()}} ></Button>  Preview</>}>
            <Card sectioned title={`Email Preview`}>
                <p>Subject</p>
                <p style={{border:"1px solid #d5d5d5",borderRadius:"5px",padding:"10px"}}>{subject}</p>
                <br />
                <p>Body</p>
                <div style={{border:"1px solid #d5d5d5",borderRadius:"5px",padding:"10px"}}>
                    <div dangerouslySetInnerHTML={{__html:body}}></div>          
                </div>
            </Card>            
        </Page>
    );
}