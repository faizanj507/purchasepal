import React,{useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import {Page,Card,DataTable,Icon,Thumbnail,Button, Stack} from '@shopify/polaris';
import { GETPRODUCTBYID,GETCUSTOMERSBYPRODUCT } from '../fetchAPI';
import { MobileBackArrowMajor } from '@shopify/polaris-icons';
import Link from 'next/link';

export default function ProductIndividual() {
    let [prodcustomer,setprodcustomer] = useState([]);
    let [product,setproduct] = useState([]);
    let router = useRouter();
    let pid = router.asPath.split("-")[1];

    useEffect(()=>{

      GETPRODUCTBYID({pid:pid}).then(res=>{
        res.json().then(res=>{
          setproduct(res)
        })
      })     

      GETCUSTOMERSBYPRODUCT({productid:pid}).then(res=>{
        res.json().then(res=>{
          setprodcustomer(res)
        })
      }) 
    },[])

    let prodrow = [[
      <Thumbnail
        source={product[0]}
        alt={product[1]}
      />,
      product[1],
      product[2],
      product[3],
      product[4],
      product[6],
      product[5],
      product[7] ? product[7][0].reminded_date : "In Pending",
    ]]

    let custrow = prodcustomer.map((cust)=>{
      let cfr = new Date(cust.added_date);
      let lfr = new Date(cust.remind_date);
      return [
        cust.fname,
        cust.lname,
        cust.email,
        cust.added_date ?`${cfr.getMonth()+1}-${cfr.getDate()}-${cfr.getFullYear()}` : "",
        cust.remind_date ? `${lfr.getMonth()+1}-${lfr.getDate()}-${lfr.getFullYear()}` : "Never",
        cust.is_reminded == "true" ? "Sent" : "Pending",
      ]
    })

    return (
        <Page title={<><Button plain icon={MobileBackArrowMajor} onClick={()=>{router.back()}} ></Button> Product Individual</>} fullWidth={true}>
            <Card sectioned title="Product Detail">
              <div style={{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                <img src={product[0]} alt={product[1]} style={{objectFit:"cover",width:"350px",height:"350px",borderRadius:"50%"}} width="50%"/>
                <div style={{padding:"20px"}}>
                  {/* show product details as card */}
                  <h2 style={{fontSize:"30px",fontWeight:"bolder",lineHeight:"0px"}}>{product[1]}</h2>
                  <br/>
                  <div style={{paddingBottom:"15px"}} dangerouslySetInnerHTML={{__html:product[9]}}></div>
                  <table>
                    <tbody>
                      <tr>
                        <td><b>Stock</b></td>
                        <td>{product[2]}</td>
                      </tr>
                      <tr>
                        <td><b>Price</b></td>
                        <td>{product[3]}</td>
                      </tr>
                      <tr>
                        <td><b>Reminders</b></td>
                        <td>{product[4]}</td>
                      </tr>
                      <tr>
                        <td><b>Reminders Sent</b></td>
                        <td>{product[6]}</td>
                      </tr>
                      <tr>
                        <td><b>Reminders Due</b></td>
                        <td>{product[5]}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              {/* <DataTable
                columnContentTypes={[
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                ]}
                headings={[
                  'Image',
                  'Title',
                  'Stock',
                  'Price',
                  'Reminders',
                  'Reminders Sent',
                  'pending',
                  'Last Reminded',
                ]}
                rows={prodrow?prodrow:[]}
                verticalAlign="middle"
              /> */}
            </Card>


            <Card sectioned title="Customers Detail">
              <DataTable
                columnContentTypes={[
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                ]}
                headings={[
                  'First Name', 
                  'Last Name',
                  'Email',
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