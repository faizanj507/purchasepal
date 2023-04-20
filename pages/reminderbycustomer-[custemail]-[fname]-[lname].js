import React,{useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import {Page,Card,DataTable,Icon,Thumbnail,Button} from '@shopify/polaris';
import { GETALLREMINDERSBYEMAIL } from '../fetchAPI';
import { MobileBackArrowMajor } from '@shopify/polaris-icons';
import Link from 'next/link';

export default function ReminderByCustomer() {
    let [prodcustomer,setprodcustomer] = useState([]);
    let router = useRouter();
    let email = router.asPath.split("-")[1];
    let fname = router.asPath.split("-")[2];
    let lname = router.asPath.split("-")[3];
    
    useEffect(()=>{
    GETALLREMINDERSBYEMAIL({email:email}).then(res=>{
        res.json().then(res=>{
          setprodcustomer(res)
        })
      });
    },[])


    let custrow = prodcustomer.map((prod)=>{
      return [
        <Thumbnail
          source={prod[0]}
          alt={prod[1]}
        />,
        prod[1],
        prod[2],
        `${prod[3]}` || "-",
        prod[4] ?`${new Date(prod[4]).getMonth()+1}-${new Date(prod[4]).getDate()}-${new Date(prod[4]).getFullYear()}` : "In Pending",
        prod[5] ?`${new Date(prod[5]).getMonth()+1}-${new Date(prod[5]).getDate()}-${new Date(prod[5]).getFullYear()}` : "In Pending",
        prod[6],
      ]
    })


    return (
        <Page title={<><Button plain icon={MobileBackArrowMajor} onClick={()=>{router.back()}} ></Button> {fname} {lname}</>}>
            <Card sectioned>
              <DataTable
                columnContentTypes={[
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                ]}
                headings={[
                  'Product Image', 
                  'Title',
                  'Stock',
                  'Price',
                  'Date Created',
                  'Reminder Due',
                  'Status',
                ]}
                
                rows={custrow?custrow:[]}
                verticalAlign="middle"
              />
            </Card>            
        </Page>
    );
}