import React, {useEffect, useState, useCallback} from 'react';
import {Card, DataTable, Page,SkeletonDisplayText,TextField,Icon} from '@shopify/polaris';
import { SearchMajor } from "@shopify/polaris-icons";
import { GETCUSTOMERS } from '../fetchAPI';
import Link from 'next/link'; 

export default function ReminderCustomers() {
    const [sortedRows, setSortedRows] = useState(null);
    let [customers,setcustomers] = useState([["loading...","loading...","loading...","loading...","loading..."]]);
    let [isloading,setisloading] = useState(true);
    let [search,setserach] = useState("");

    useEffect(()=>{
        setisloading(true);
        GETCUSTOMERS().then(res=>{
          res.json().then(res=>{
            // create a array and push results to it and setcustomers
            let customers_array = [];
            res.forEach(customer=>{
              customers_array.push([customer._id,customer.fname,customer.lname,customer.total_reminder,customer.first_reminded,customer.last_reminded])
            })
            setcustomers(customers_array)
            setisloading(false);
          })
        })
    },[])
    function convertString(val){
      return val ? val.toString() : "";
    }

    const initiallySortedRows = customers.filter(cust=>{return convertString(cust[0]).toLowerCase().indexOf(search.toLowerCase())!==-1 || convertString(cust[1]).toLowerCase().indexOf(search.toLowerCase())!==-1 || convertString(cust[2]).toLowerCase().indexOf(search.toLowerCase())!==-1 || convertString(cust[3]).toLowerCase().indexOf(search.toLowerCase())!==-1 || convertString(cust[4]).toLowerCase().indexOf(search.toLowerCase())!==-1 || convertString(cust[5]).toLowerCase().indexOf(search.toLowerCase())!==-1}).map(cust=>{
      return [
        isloading ? <SkeletonDisplayText size="small" /> :cust[1],
        isloading ? <SkeletonDisplayText size="small" /> :cust[2],
        isloading ? <SkeletonDisplayText size="small" /> :<Link href="/reminderbycustomer-[custemail]-[fname]-[lname]" as={`/reminderbycustomer-${cust[0]}-${cust[1]}-${cust[2]}`}><a>{cust[0]}</a></Link>,
        isloading ? <SkeletonDisplayText size="small" /> :cust[3],
        isloading ? <SkeletonDisplayText size="small" /> :cust[4] ? new Date(cust[4]).getMonth()+1+"-"+new Date(cust[4]).getDate()+"-"+new Date(cust[4]).getFullYear() : "Never",
        isloading ? <SkeletonDisplayText size="small" /> :cust[5] ? new Date(cust[5]).getMonth()+1+"-"+new Date(cust[5]).getDate()+"-"+new Date(cust[5]).getFullYear() : "Never",
      ]
    });
  
    const rows = sortedRows ? sortedRows : initiallySortedRows;

    let sortdata = useCallback((index, direction)=>{
      setSortedRows(sortnumbers(rows,index, direction));
    },[rows])
  
    return (
      <Page title="Customers Details" fullWidth={true} primaryAction={<TextField prefix={<Icon source={SearchMajor} color='base'/>} type="search" placeholder='Search...'  value={search} type="search" onChange={useCallback((newValue) => {setserach(newValue);setSortedRows(null)}, [])}/>}>
        <Card>
          <DataTable
            columnContentTypes={[
              'text',
              'text',
              'text',
              'text',
              'text'
            ]}
            headings={[
              'First Name',
              'Last Name',
              'Email',
              'Total Reminder',
              'Date Created',
              'Last Reminded',
            ]}
            rows={rows}
            defaultSortDirection="descending"
            initialSortColumnIndex={rows ? 3 : 0}
            footerContent={`Showing ${rows.length} of ${rows.length} results`}
            onSort={sortdata}
            sortable={[true,true,false,true,true,true]}
          />
        </Card>
      </Page>
    );
  
    function sortnumbers(rows, index, direction) {
      return [...rows].sort((rowA, rowB) => {
            // Convert numbers to string
            // replace @ to ''
            // replace . to ''

            let a = rowA[index];
            let b = rowB[index];
            console.log(a,b)
            console.log(rowA[index],rowB[index])
            
            const amountA = typeof a === 'number' ? a.toString() : b;
            const amountB = typeof b === 'number' ? b.toString() : a;

            // sort string 
      
            return direction === 'descending' ? amountA.localeCompare(amountB) : amountB.localeCompare(amountA);
        });
    }
  }