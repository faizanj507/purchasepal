import React, {useCallback, useEffect, useState, useRef} from 'react';
import {Page, Card, DataTable, Button, IndexTable, Thumbnail, TextField, Icon, SkeletonDisplayText,Pagination} from '@shopify/polaris';
import { GETPRODUCTS,GETCUSTOMERSBYPRODUCT } from '../fetchAPI';
import { SearchMajor } from "@shopify/polaris-icons";
import Link from 'next/link';


export default function ProductTable() {

    const [sortedRows, setSortedRows] = useState(null);
    let [products,setproducts] = useState([[[<SkeletonDisplayText size="small" />,"Product Title",<SkeletonDisplayText size="small" />,<SkeletonDisplayText size="small" />,<SkeletonDisplayText size="small" />]],[]]);
    let [modalactive,setmodalactive] = useState(false);
    let [search,setserach] = useState("");
    let [isloading,setisloading] = useState(true);
    let [pageno,setpageno] = useState(1);
    let [pdlimit,setpdlimit] = useState(10);

    // splice the products array to get the required page
    // let searchableproducts = products
    let skipno = pageno <= 1 ? 0 : ((pageno - 1) * pdlimit)
    let newlim = pageno <= 1 ? pdlimit : pdlimit * pageno
    console.log("Skip No",skipno,"New Limit",newlim,"Page No",pageno,"Splice",skipno,":",newlim);
    let searchableproducts = products[0].slice(skipno,newlim);

    function getproducts(pn=1){
      setisloading(true);
      GETPRODUCTS(pn).then(res=>{
        res.json().then(res=>{
          setproducts(res)
          setisloading(false);
        })
      })
      
    }

      useEffect(()=>{
          getproducts();
      },[])



    let modal_toggle =  useCallback(() => setmodalactive(!modalactive), [modalactive]);
    
    const initiallySortedRows = searchableproducts.filter(product=>{return product[1].toLowerCase().indexOf(search.toLowerCase())!==-1 || product[2].toString().toLowerCase().indexOf(search.toLowerCase())!==-1 || product[3].toString().toLowerCase().indexOf(search.toLowerCase())!==-1 || product[4].toString().toLowerCase().indexOf(search.toLowerCase())!==-1 || product[5].toString().toLowerCase().indexOf(search.toLowerCase())!==-1 || product[6].toString().toLowerCase().indexOf(search.toLowerCase())!==-1 || product[7].toString().toLowerCase().indexOf(search.toLowerCase())!==-1}).map((prod,pindex)=>{
      return [
        <Thumbnail
          source={prod[0]}
          alt={prod[1]}
        />,
        <Link style={{color:"green"}} href="/productindividual-[id]" as={`/productindividual-${prod[7]}`}>{prod[1]}</Link>,
        isloading ? <SkeletonDisplayText size="small" /> : prod[2],
        isloading ? <SkeletonDisplayText size="small" /> :`${prod[3]}` || "-",
        isloading ? <SkeletonDisplayText size="small" /> : prod[4],
        isloading ? <SkeletonDisplayText size="small" /> : prod[6] || "0",
        isloading ? <SkeletonDisplayText size="small" /> : prod[5] || "0",
        isloading ? <SkeletonDisplayText size="small" /> : prod[8] ,
      ]
    });
    // const initiallySortedRows = searchableproducts.filter(product=>{return product[1].toLowerCase().indexOf(search.toLowerCase())!==-1}).map((prod,pindex)=>{
    //   <IndexTable.Row id={pindex} key={pindex} position={pindex}>
    //     <IndexTable.Cell>
    //       <Thumbnail
    //         source={prod[0]}
    //         alt={prod[1]}
    //       />
    //     </IndexTable.Cell>
        
    //     <IndexTable.Cell>
    //       <Link style={{color:"green"}} href="/productindividual-[id]" as={`/productindividual-${prod[7]}`}>{prod[1]}</Link>,
    //     </IndexTable.Cell>

    //     <IndexTable.Cell>
    //       {prod[2]}
    //     </IndexTable.Cell>

    //     <IndexTable.Cell>
    //       {`${prod[3]}` || "-"}
    //     </IndexTable.Cell>

    //     <IndexTable.Cell>
    //       {prod[4]}
    //     </IndexTable.Cell>

    //     <IndexTable.Cell>
    //       {prod[6] || "0"}
    //     </IndexTable.Cell>

    //     <IndexTable.Cell>
    //       {prod[5] || "0"}
    //     </IndexTable.Cell>

    //     <IndexTable.Cell>
    //       {prod[8] ?`${new Date(prod[8]).getFullYear()}-${new Date(prod[8]).getMonth()+1}-${new Date(prod[8])..getDate()}` : "In Pending"}
    //     </IndexTable.Cell>
    //   </IndexTable.Row>
    // });
    
    const rows = sortedRows ? sortedRows : initiallySortedRows;
    const resourceName = {
      singular: 'Product',
      plural: 'Products',
    };

    let sortdata = useCallback((index, direction)=>{
      // set products[0] to sort
      let product = products[0];
      setproducts([sortnumbers(product,index,direction),products[1]]);
      // setSortedRows(sortnumbers(rows,index, direction));
    },[rows])
    
    return (
      <>
        <Page title="Product By Reminder" fullWidth={true}  primaryAction={<TextField prefix={<Icon source={SearchMajor} color='base'/>} type="search" placeholder='Search...'  value={search} type="search" onChange={useCallback((newValue) => {setserach(newValue);setSortedRows(null)}, [])}/>} >
        <Card>
        {/* <IndexTable
          headings={[
            {title: 'Image', transforms: [{type: 'image'}]},
            {title: 'Product Title'},
            {title: 'Stock'},
            {title: 'Price'},
            {title: 'Reminders'},
            {title: 'Reminders Sent'},
            {title: 'Reminders Due'},
            {title: 'Last Reminded'},
          ]}
          itemCount={rows.length}
          selectable={false}
          resourceName={resourceName}
        >
          {rows}
        </IndexTable> */}
          <DataTable

            columnContentTypes={[
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text'
            ]}
            headings={[
              'Image',
              'Product',
              'Stock',
              'Price',
              'Reminders',
              'Reminders Sent',
              'Reminders Pending',
              'Last Reminded'
            ]}
            rows={rows}
            defaultSortDirection="descending"

            initialSortColumnIndex={rows ? 4 : 0}
            // show footer content by calculating the total number of rows and pages
            footerContent={`Showing ${products[1].length>0 ? pageno*10 > products[1]? products[1] : pageno*10 :0} of ${products[1].length>0?products[1]:0} results`}
            verticalAlign='middle'
            onSort={sortdata}
            sortable={[false,false,true,true,true,true,true,true]}
          />
          <div style={{display:"flex",justifyContent:"center"}}>
            <Pagination
              hasPrevious={pageno>1}
              onPrevious={() => {
                // getproducts(pageno-1);
                if(pageno!==1){
                  setpageno(pageno-1);
                }
              }}
              hasNext={pageno*10<products[1]}
              onNext={() => {
                // getproducts(pageno+1);
                setpageno(pageno+1);
              }}
            />
          </div>
          </Card>
        </Page>
        </>
    );

    function sortnumbers(rows, index, direction) {
      return [...rows].sort((rowA, rowB) => {
            // Convert numbers to string

            let wirowA = rowA[index] == null ? '' : rowA[index];
            let wirowB = rowB[index] == null ? '' : rowB[index];
            const amountA = typeof wirowA === 'number' ? wirowA.toString() : wirowA;
            const amountB = typeof wirowB === 'number' ? wirowB.toString() : wirowB;
      
            return direction === 'descending' ? amountA.localeCompare(amountB,undefined, { numeric: true, sensitivity: 'base' }) : amountB.localeCompare(amountA,undefined, { numeric: true, sensitivity: 'base' });
        });
    }
  }